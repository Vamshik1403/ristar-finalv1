import { Injectable, NotFoundException } from '@nestjs/common';
import { MovementHistory } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MovementHistoryService {
  constructor(private readonly prisma: PrismaService) {}

 findAll() {
  return this.prisma.movementHistory.findMany({
    include: {
      inventory: true,
      port: true,
      addressBook: true,
      shipment: {
        select: {
          jobNumber: true,
          vesselName: true, // ✅
        },
      },
      emptyRepoJob: {
        select: {
          jobNumber: true,
          vesselName: true, // ✅
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });
}

  async findOne(id: number) {
    const movement = await this.prisma.movementHistory.findUnique({
      where: { id },
      include: {
        inventory: true,
        port: true,
        addressBook: true,
        shipment: true,
        emptyRepoJob:true,
      },
    });

    if (!movement) {
      throw new NotFoundException(`MovementHistory with ID ${id} not found`);
    }

    return movement;
  }

  async findAllExceptAvailable() {
    return this.prisma.movementHistory.findMany({
      where: {
        NOT: {
          status: 'AVAILABLE',
        },
      },
      include: {
        inventory: true,
        port: true,
        addressBook: true,
        shipment: true,
        emptyRepoJob:true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }
async bulkUpdateStatus(ids: number[], newStatus: string, jobNumber: string, remarks?:string) {
  // First try to find the shipment
  const shipment = await this.prisma.shipment.findFirst({
    where: { jobNumber },
    include: {
      polPort: true,
      podPort: true,
      carrierAddressBook: true,
    },
  });

  // Fallback to EmptyRepoJob
  const emptyRepoJob = !shipment
    ? await this.prisma.emptyRepoJob.findFirst({
        where: { jobNumber },
        select: {
          id: true,
          polPortId: true,
          podPortId: true,
          carrierAddressBookId: true,
          emptyReturnDepotAddressBookId: true,
        },
      })
    : null;


  const status = newStatus.toUpperCase();

  const tasks = ids.map(async (id) => {
    const prev = await this.prisma.movementHistory.findUnique({ where: { id } });
    if (!prev) throw new NotFoundException(`MovementHistory ${id} not found`);

    let portId: number = prev.portId;
    let addressBookId: number | null = prev.addressBookId ?? null;
let finalRemarks: string | null = remarks?.trim() || null;

    switch (status) {
      case 'EMPTY PICKED UP':
        portId = prev.portId ?? shipment?.polPortId ?? emptyRepoJob?.polPortId!;
        addressBookId = prev.addressBookId ?? null;
        break;

      case 'GATE-IN':
        portId = shipment?.polPortId ?? emptyRepoJob?.polPortId!;
        addressBookId = null;
        break;

      case 'SOB':
        portId =
          shipment?.podPortId ??
          shipment?.polPortId ??
          emptyRepoJob?.podPortId ??
          emptyRepoJob?.polPortId!;
        addressBookId =
          shipment?.carrierAddressBookId ??
          emptyRepoJob?.carrierAddressBookId ??
          null;
        break;

      case 'GATE-OUT':
        portId = shipment?.podPortId ?? emptyRepoJob?.podPortId!;
        addressBookId = null;
        break;

      case 'EMPTY RETURNED':
        portId = shipment?.podPortId ?? emptyRepoJob?.podPortId!;
        addressBookId =
          shipment?.emptyReturnDepotAddressBookId ??
          emptyRepoJob?.emptyReturnDepotAddressBookId ??
          null;
        break;

     case 'AVAILABLE':
case 'UNAVAILABLE':
  if (portId == null) portId = prev.portId;
  if (addressBookId == null) addressBookId = prev.addressBookId;
  break;

  

      default:
        throw new Error(`Unsupported status transition: ${status}`);
    }

    if (!portId) {
      throw new Error(`portId cannot be null or undefined for movement ID ${id}`);
    }

    return this.prisma.movementHistory.create({
      data: {
        inventoryId: prev.inventoryId,
        shipmentId: prev.shipmentId ?? shipment?.id ?? null,
        emptyRepoJobId: prev.emptyRepoJobId ?? emptyRepoJob?.id ?? null,
        portId,
        addressBookId,
        status,
        date: new Date(),
 remarks: finalRemarks,
      },
    });
  });

  return this.prisma.$transaction(tasks as any);
}



  async updateMovement(id: number, data: Partial<MovementHistory>) {
  const updatedData = {
    ...data,
    date: data.date ? new Date(data.date) : undefined, // 👈 convert only if defined
  };

  return this.prisma.movementHistory.update({
    where: { id },
    data: updatedData,
  });
}


async createNewStatusEntry(
  prevId: number,
  newStatus: string,
  portId?: number | null,
  addressBookId?: number | null,
  remarks?:string,
) {
 
  const previous = await this.prisma.movementHistory.findUnique({
    where: { id: prevId },
  });

  if (!previous) {
    console.error(`❌ MovementHistory with ID ${prevId} not found`);
    throw new NotFoundException(`MovementHistory with ID ${prevId} not found`);
  }
  // Fetch shipment info once if needed
  type ShipmentInfo = {
    polPortId: number | null;
    podPortId: number | null;
    carrierAddressBookId: number | null;
    emptyReturnDepotAddressBookId: number | null;
  } | null;

  let shipment: ShipmentInfo = null;
if (['GATE-IN', 'SOB', 'EMPTY RETURNED'].includes(newStatus.toUpperCase())) {
  if (previous.shipmentId) {
    shipment = await this.prisma.shipment.findUnique({
      where: { id: previous.shipmentId },
      select: {
        polPortId: true,
        podPortId: true,
        carrierAddressBookId: true,
        emptyReturnDepotAddressBookId: true,
      },
    });
  } else if (previous.emptyRepoJobId) {
    shipment = await this.prisma.emptyRepoJob.findUnique({
      where: { id: previous.emptyRepoJobId },
      select: {
        polPortId: true,
        podPortId: true,
        carrierAddressBookId: true,
        emptyReturnDepotAddressBookId: true,
      },
    });
  } else {
    throw new Error(`No shipmentId or emptyRepoJobId for movement ID ${prevId}`);
  }
}


  // Apply custom logic based on status
  const status = newStatus.toUpperCase();
  if (status === 'EMPTY PICKED UP') {
    // Use previous portId and addressBookId
    portId = previous.portId;
    addressBookId = previous.addressBookId;
  } else if (status === 'GATE-IN') {
    portId = shipment?.polPortId ?? null;
    addressBookId = null;
  } else if (status === 'SOB') {
    portId = shipment?.podPortId ?? shipment?.polPortId ?? null;
    addressBookId = shipment?.carrierAddressBookId ?? null;
  } else if (status === 'EMPTY RETURNED') {
    portId = shipment?.podPortId ?? null;
    addressBookId = shipment?.emptyReturnDepotAddressBookId ?? null;
  } else {
    // Fallback: use explicitly passed or previous values
    if (portId == null) portId = previous.portId;
    if (typeof addressBookId === 'undefined') addressBookId = previous.addressBookId;
  }



  if (portId == null) {
    console.error(`❌ portId is null/undefined for movement ID ${prevId}`);
    throw new Error(`portId cannot be null or undefined for movement ID ${prevId}`);
  }

  const newEntry = await this.prisma.movementHistory.create({
    data: {
     inventoryId: previous.inventoryId,
    shipmentId: previous.shipmentId ?? null,
    emptyRepoJobId: previous.emptyRepoJobId ?? null,
      portId,
      addressBookId,
      status,
      date: new Date(),
          remarks: remarks?.trim() || null, // ✅ here

    },
  });

  return newEntry;
}


// In MovementHistoryService
async findLatestPerContainer() {
  const latestMovements = await this.prisma.$queryRaw<
    MovementHistory[]
  >`SELECT DISTINCT ON ("inventoryId") *
     FROM "MovementHistory"
     ORDER BY "inventoryId", "date" DESC`;

  const ids = latestMovements.map((m) => m.id);

  return this.prisma.movementHistory.findMany({
    where: { id: { in: ids } },
    include: {
      inventory: true,
      port: true,
      addressBook: true,
      shipment: true,
      emptyRepoJob:true,
    },
    orderBy: {
      date: "desc",
    },
  });
}

}