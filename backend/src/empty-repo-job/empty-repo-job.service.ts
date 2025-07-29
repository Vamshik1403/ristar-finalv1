import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmptyRepoJobDto } from './dto/create-emptyRepoJob.dto';
import { UpdateEmptyRepoJobDto } from './dto/update-emptyRepoJob.dto';

@Injectable()
export class EmptyRepoJobService {
  constructor(private readonly prisma: PrismaService) {}

  async getNextJobNumber(): Promise<string> {
    
    const currentYear = new Date().getFullYear().toString().slice(-2); // "25"
    
   
    const prefix = `RST/`;
    const yearPart = `/${currentYear}/`;

    // Get the latest job number to determine the next sequence
    const latestJob = await this.prisma.emptyRepoJob.findFirst({
      where: {
        jobNumber: {
          contains: yearPart,
        },
      },
      orderBy: { jobNumber: 'desc' },
    });

    let nextSeq = 1;
    if (latestJob?.jobNumber) {
      // Extract sequence number from job number like "RST/NSAJEV/25/00001"
      const parts = latestJob.jobNumber.split('/');
      if (parts.length >= 4) {
        const lastSeq = parseInt(parts[3]);
        if (!isNaN(lastSeq)) {
          nextSeq = lastSeq + 1;
        }
      }
    }

    const paddedSeq = String(nextSeq).padStart(5, '0');
    
    // Return a preview format - actual ports will be used when form is submitted
    return `${prefix}[POL][POD]${yearPart}${paddedSeq}`;
  }

  async create(data: CreateEmptyRepoJobDto) {
    const { containers, polPortId, podPortId, ...jobData } = data;

    // ✅ Ensure required port IDs are defined
    if (!polPortId || !podPortId) {
      throw new Error('polPortId and podPortId are required');
    }

    // Fetch port codes
    const [polPort, podPort] = await Promise.all([
      this.prisma.ports.findUnique({ where: { id: polPortId } }),
      this.prisma.ports.findUnique({ where: { id: podPortId } }),
    ]);

    if (!polPort || !podPort) {
      throw new Error('Invalid port IDs provided');
    }

    // FIX: Use actual port codes instead of placeholders
    const polCode = polPort.portCode || 'POL';
    const podCode = podPort.portCode || 'POD';
    const year = new Date().getFullYear().toString().slice(-2);

    // Create the proper format: RST/NSAJEV/25/00001
    const portCombination = `${polCode}${podCode}`;
    const prefix = `RST/${portCombination}/${year}/`;

    const latestJob = await this.prisma.emptyRepoJob.findFirst({
      where: {
        jobNumber: { startsWith: prefix },
      },
      orderBy: { jobNumber: 'desc' },
    });

    let nextSeq = 1;
    if (latestJob?.jobNumber) {
      const parts = latestJob.jobNumber.split('/');
      if (parts.length >= 4) {
        const lastSeq = parseInt(parts[3]);
        if (!isNaN(lastSeq)) {
          nextSeq = lastSeq + 1;
        }
      }
    }

    const paddedSeq = String(nextSeq).padStart(5, '0');
    const jobNumber = `${prefix}${paddedSeq}`;

    const parseDate = (d: string | Date | undefined) =>
      d ? new Date(d).toISOString() : new Date().toISOString();

    return this.prisma.$transaction(async (tx) => {
      const houseBL = jobNumber; // House BL is same as job number
      
      // Build data object
      const jobDataForCreate: any = {
        ...jobData,
        jobNumber,
        polPortId,
        podPortId,
        houseBL,
        date: parseDate(jobData.date),
        gsDate: parseDate(jobData.gsDate),
        etaTopod: parseDate(jobData.etaTopod),
        estimateDate: parseDate(jobData.estimateDate),
      };

      // Handle SOB date conditionally - only set if provided
      if (jobData.sob) {
        jobDataForCreate.sob = new Date(jobData.sob).toISOString();
      }

      const createdJob = await tx.emptyRepoJob.create({
        data: jobDataForCreate,
      });

      // Rest of the container creation logic remains the same...
      if (containers && containers.length > 0) {
        await tx.repoShipmentContainer.createMany({
          data: containers.map((c) => ({
            shipmentId: createdJob.id,
            containerNumber: c.containerNumber,
            capacity: c.capacity,
            tare: c.tare,
            portId: c.portId,
            inventoryId: c.inventoryId,
            depotName: c.depotName,
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
                  emptyRepoJobId: createdJob.id,
                  status: 'ALLOTTED',
                  date: new Date(),
                },
              });
            }
          }
        }
      }

      return createdJob;
    });
  }

  findAll() {
    return this.prisma.emptyRepoJob.findMany({
      include: {
        expHandlingAgentAddressBook: true,
        impHandlingAgentAddressBook: true,
        carrierAddressBook: true,
        emptyReturnDepotAddressBook: true,
        polPort: true,
        podPort: true,
        transhipmentPort: true,
        containers: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.emptyRepoJob.findUnique({
      where: { id },
      include: {
        expHandlingAgentAddressBook: true,
        impHandlingAgentAddressBook: true,
        carrierAddressBook: true,
        emptyReturnDepotAddressBook: true,
        polPort: true,
        podPort: true,
        transhipmentPort: true,
        containers: true,
      },
    });
  }

  async update(id: number, data: UpdateEmptyRepoJobDto) {
    const { containers, ...jobData } = data;

    return this.prisma.$transaction(async (tx) => {
      const updatedJob = await tx.emptyRepoJob.update({
        where: { id },
        data: {
          ...jobData,
          date: jobData.date ? new Date(jobData.date) : undefined,
          gsDate: jobData.gsDate ? new Date(jobData.gsDate) : undefined,
          vesselName: jobData.vesselName,
          sob: jobData.sob ? new Date(jobData.sob) : undefined,
          etaTopod: jobData.etaTopod ? new Date(jobData.etaTopod) : undefined,
          estimateDate: jobData.estimateDate
            ? new Date(jobData.estimateDate)
            : undefined,
        },
      });

      await tx.repoShipmentContainer.deleteMany({
        where: { shipmentId: id },
      });

      if (containers && containers.length > 0) {
        await tx.repoShipmentContainer.createMany({
          data: containers.map((container) => ({
            ...container,
            shipmentId: id,
          })),
        });
      }

      return updatedJob;
    });
  }

  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      await tx.movementHistory.deleteMany({
        where: { emptyRepoJobId: id },
      });

      await tx.repoShipmentContainer.deleteMany({
        where: { shipmentId: id },
      });

      return tx.emptyRepoJob.delete({
        where: { id },
      });
    });
  }
}
