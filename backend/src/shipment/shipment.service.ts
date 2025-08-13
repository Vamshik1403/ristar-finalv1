import { Injectable } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShipmentService {
  constructor(private readonly prisma: PrismaService) {}

async create(data: CreateShipmentDto) {
  const currentYear = new Date().getFullYear().toString().slice(-2); // "25"

  // ✅ Fetch polPort & podPort to extract portCode
  const [polPort, podPort] = await Promise.all([
    this.prisma.ports.findUnique({ where: { id: data.polPortId }, select: { portCode: true } }),
    this.prisma.ports.findUnique({ where: { id: data.podPortId }, select: { portCode: true } }),
  ]);

  const polCode = polPort?.portCode || 'XXX';
  const podCode = podPort?.portCode || 'XXX';

  const prefix = `RST/${polCode}${podCode}/${currentYear}/`;

  const latestShipment = await this.prisma.shipment.findFirst({
    where: {
      houseBL: {
        startsWith: prefix,
      },
    },
    orderBy: {
      houseBL: 'desc',
    },
  });

  let nextSequence = 1;
  if (latestShipment?.houseBL) {
    const parts = latestShipment.houseBL.split('/');
    const lastNumber = parseInt(parts[3]);
    if (!isNaN(lastNumber)) {
      nextSequence = lastNumber + 1;
    }
  }

  const paddedSequence = String(nextSequence).padStart(5, '0');
  const generatedHouseBL = `${prefix}${paddedSequence}`;

  const { containers, ...shipmentData } = data;

  const parseDate = (d: string | Date | undefined) =>
    d ? new Date(d).toISOString() : new Date().toISOString();

  // Generate jobNumber before transaction
  const generatedJobNumber = await this.getNextJobNumber();

  return this.prisma.$transaction(async (tx) => {
    // Build the data object conditionally
    const shipmentData: any = {
      ...data, // This spreads all the other fields
      houseBL: generatedHouseBL,
      jobNumber: generatedJobNumber,
      date: parseDate(data.date),
      gsDate: parseDate(data.gsDate),
      etaTopod: parseDate(data.etaTopod),
      estimateDate: parseDate(data.estimateDate),
    };

    // Handle SOB date conditionally - only set if provided
    if (data.sob) {
      shipmentData.sob = new Date(data.sob).toISOString();
    } else {
      shipmentData.sob = null;
    }

    // Only include quotationRefNumber if it's provided
    if (data.quotationRefNumber) {
      shipmentData.quotationRefNumber = data.quotationRefNumber;
    }

    // Remove containers from shipmentData as it's handled separately
    delete shipmentData.containers;

    const createdShipment = await tx.shipment.create({
      data: shipmentData,
    });

    if (containers && containers.length > 0) {
      await tx.shipmentContainer.createMany({
        data: containers.map((c) => ({
          containerNumber: c.containerNumber,
          capacity: c.capacity,
          tare: c.tare,
          portId: c.portId,
          depotName: c.depotName,
          inventoryId: c.inventoryId,
          shipmentId: createdShipment.id,
        })),
      });

      for (const container of containers) {
        const inventory = await tx.inventory.findFirst({
          where: { containerNumber: container.containerNumber },
        });

        if (inventory) {
          const leasingInfo = await tx.leasingInfo.findFirst({
            where: { inventoryId: inventory.id },
            orderBy: { createdAt: 'desc' },
          });

          if (leasingInfo) {
         await tx.movementHistory.create({
  data: {
    inventoryId: inventory.id,
    portId: leasingInfo.portId,
    addressBookId: leasingInfo.onHireDepotaddressbookId,
    shipmentId: createdShipment.id,
    status: 'ALLOTTED',
    date: new Date(),
    jobNumber: createdShipment.jobNumber, // ✅ ADD THIS LINE ONLY HERE
  },
});

          }
        }
      }
    }

    return createdShipment;
  });
}




 async getNextJobNumber(): Promise<string> {
    const currentYear = new Date().getFullYear().toString().slice(-2); // "25"
    const prefix = `${currentYear}/`;

    const latestShipment = await this.prisma.shipment.findFirst({
      where: {
        jobNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        jobNumber: 'desc',
      },
    });

    let nextSequence = 1;
    if (latestShipment?.jobNumber) {
      const parts = latestShipment.jobNumber.split('/');
      const lastNumber = parseInt(parts[1]);
      if (!isNaN(lastNumber)) {
        nextSequence = lastNumber + 1;
      }
    }

    const paddedSequence = String(nextSequence).padStart(5, '0');
    return `${prefix}${paddedSequence}`; // e.g., "25/00003"
  }

  findAll() {
  return this.prisma.shipment.findMany({
    include: {
      customerAddressBook: true,
      consigneeAddressBook: true,
      shipperAddressBook: true,
      polPort: true,
      podPort: true,
      product: true,
      transhipmentPort: true,
      expHandlingAgentAddressBook: true,
      impHandlingAgentAddressBook: true,
      carrierAddressBook: true,
      emptyReturnDepotAddressBook: true,
      containers: true, // ✅ Add this line
    },
  });
}


  findOne(id: number) {
    return this.prisma.shipment.findUnique({
      where: { id },
      include: {
        customerAddressBook: true,
        consigneeAddressBook: true,
        shipperAddressBook: true,
        polPort: true,
        podPort: true,
        product: true,
        transhipmentPort: true,
        expHandlingAgentAddressBook: true,
        impHandlingAgentAddressBook: true,
        carrierAddressBook: true,
        emptyReturnDepotAddressBook: true,
        containers: true,
      },
    });
  }

 async update(id: number, data: UpdateShipmentDto) {
  const { containers, ...shipmentData } = data;

  // Fetch the current shipment to get the jobNumber
  const currentShipment = await this.prisma.shipment.findUnique({
    where: { id },
    select: { jobNumber: true },
  });
  const jobNumber = currentShipment?.jobNumber || 'UNKNOWN';

  return this.prisma.$transaction(async (tx) => {
    // 1. Fetch existing containers for this shipment
    const existingContainers = await tx.shipmentContainer.findMany({
      where: { shipmentId: id },
    });

    const existingInventoryIds = existingContainers
      .map((c) => c.inventoryId)
      .filter((id): id is number => id !== null && id !== undefined);

    const newInventoryIds = (containers || [])
      .map((c) => c.inventoryId)
      .filter((id): id is number => id !== null && id !== undefined);

    // 2. Identify removed inventoryIds (no longer in the new list)
    const removedInventoryIds = existingInventoryIds.filter(
      (oldId) => !newInventoryIds.includes(oldId),
    );

    // 3. Handle removed containers
    for (const inventoryId of removedInventoryIds) {
      const leasingInfo = await tx.leasingInfo.findFirst({
        where: { inventoryId },
        orderBy: { createdAt: 'desc' },
      });

      if (!leasingInfo || leasingInfo.portId == null || leasingInfo.onHireDepotaddressbookId == null) {
        throw new Error(`Leasing info incomplete for inventoryId ${inventoryId}`);
      }

      // 3a. Mark as AVAILABLE and clear shipmentId and emptyRepoJobId
      await tx.movementHistory.create({
        data: {
          inventoryId,
          portId: leasingInfo.portId,
          addressBookId: leasingInfo.onHireDepotaddressbookId,
          status: 'AVAILABLE',
          date: new Date(),
          remarks: `Removed from shipment - ${jobNumber}`,
          shipmentId: null,
          emptyRepoJobId: null,
        },
      });
    }

    // 4. Update shipment main data
    const updatedShipment = await tx.shipment.update({
      where: { id },
      data: {
        ...shipmentData,
        date: shipmentData.date ? new Date(shipmentData.date) : undefined,
        gsDate: shipmentData.gsDate ? new Date(shipmentData.gsDate) : undefined,
        etaTopod: shipmentData.etaTopod ? new Date(shipmentData.etaTopod) : undefined,
        estimateDate: shipmentData.estimateDate ? new Date(shipmentData.estimateDate) : undefined,
        sob: shipmentData.sob ? new Date(shipmentData.sob) : null,
      },
    });

    // 5. Delete old containers
    await tx.shipmentContainer.deleteMany({
      where: { shipmentId: id },
    });

    // 6. Re-create container records
    if (containers && containers.length > 0) {
      await tx.shipmentContainer.createMany({
        data: containers.map((container) => ({
          containerNumber: container.containerNumber,
          capacity: container.capacity,
          tare: container.tare,
          portId: container.portId ?? undefined,
          depotName: container.depotName ?? undefined,
          inventoryId: container.inventoryId ?? undefined,
          shipmentId: id,
        })),
      });

      // 7. Log movement history for new containers
      for (const container of containers) {
        if (!container.inventoryId) continue;

        const leasingInfo = await tx.leasingInfo.findFirst({
          where: { inventoryId: container.inventoryId },
          orderBy: { createdAt: 'desc' },
        });

        if (!leasingInfo || leasingInfo.portId == null || leasingInfo.onHireDepotaddressbookId == null) {
          throw new Error(`Leasing info incomplete for inventoryId ${container.inventoryId}`);
        }

        await tx.movementHistory.create({
          data: {
            inventoryId: container.inventoryId,
            portId: leasingInfo.portId,
            addressBookId: leasingInfo.onHireDepotaddressbookId,
            status: 'ALLOTTED',
            date: new Date(),
            shipmentId: id,
            emptyRepoJobId: null,
          },
        });
      }
    }

    return updatedShipment;
  });
}


async remove(id: number) {
  const shipment = await this.prisma.shipment.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      jobNumber: true,
    },
  });

  const containers = await this.prisma.shipmentContainer.findMany({
    where: { shipmentId: id },
  });

  return this.prisma.$transaction(async (tx) => {
    for (const container of containers) {
      const inventoryId = container.inventoryId;

      if (!inventoryId) continue; // Skip if null

      const leasingInfo = await tx.leasingInfo.findFirst({
        where: {
          inventoryId: inventoryId, // Ensure it's not null
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!leasingInfo || !leasingInfo.portId || !leasingInfo.onHireDepotaddressbookId) {
        throw new Error(`Leasing info missing for inventoryId ${inventoryId}`);
      }

      await tx.movementHistory.create({
        data: {
          inventoryId,
          portId: leasingInfo.portId,
          addressBookId: leasingInfo.onHireDepotaddressbookId,
          status: 'AVAILABLE',
          date: new Date(),
          remarks: `Shipment cancelled - ${shipment.jobNumber}`,
          shipmentId: shipment.id,
          emptyRepoJobId: null,
        },
      });
    }

    await tx.shipmentContainer.deleteMany({
      where: { shipmentId: id },
    });

    return tx.shipment.delete({
      where: { id },
    });
  });
}



  async getQuotationDataByRef(refNumber: string) {
    return this.prisma.quotation.findUnique({
      where: { quotationRefNumber: refNumber },
      include: {
        custAddressBook: true,
        polPort: true,
        podPort: true,
        product: true,
      },
    });
  }

  async markCroGenerated(id: number) {
    try {
      // Get the existing shipment
      const existingShipment = await this.prisma.shipment.findUnique({
        where: { id },
      });

      if (!existingShipment) {
        throw new Error('Shipment not found');
      }

      const currentDate = new Date();
      const updateData: any = {};

      // Set hasCroGenerated to true if not already set
      if (!existingShipment.hasCroGenerated) {
        updateData.hasCroGenerated = true;
      }

      // Set firstCroGenerationDate if not already set
      if (!existingShipment.firstCroGenerationDate) {
        updateData.firstCroGenerationDate = currentDate;
      }

      // Only update if there's something to update
      if (Object.keys(updateData).length > 0) {
        return await this.prisma.shipment.update({
          where: { id },
          data: updateData,
        });
      }

      return existingShipment;
    } catch (error) {
      console.error('❌ Failed to mark CRO as generated:', error);
      throw new Error('CRO generation tracking failed. See logs for details.');
    }
  }
}