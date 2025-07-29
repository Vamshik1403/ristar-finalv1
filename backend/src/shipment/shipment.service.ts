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

  return this.prisma.$transaction(async (tx) => {
    // Step 1: Update shipment
    const updatedShipment = await tx.shipment.update({
      where: { id },
      data: shipmentData,
    });

    // Step 2: Delete old containers
    await tx.shipmentContainer.deleteMany({
      where: { shipmentId: id },
    });

    // Step 3: Re-create containers
    if (containers && containers.length > 0) {
      await tx.shipmentContainer.createMany({
        data: containers.map((container) => ({
          ...container,
          shipmentId: id,
        })),
      });

      // Step 4: Create movement history for each container
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
                shipmentId: id,
                status: 'ALLOTTED',
                date: new Date(),
              },
            });
          }
        }
      }
    }

    return updatedShipment;
  });
}



  remove(id: number) {
    return this.prisma.shipment.delete({
      where: { id },
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
}