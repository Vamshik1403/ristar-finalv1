import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDepotCleaningTariffDto } from './dto/create-depot-cleaning-tariff.dto';
import { UpdateDepotCleaningTariffDto } from './dto/update-depot-cleaning-tariff.dto';

@Injectable()
export class DepotCleaningTariffCostService {
  // Make sure prisma is properly injected via constructor
  constructor(private readonly prisma: PrismaService) {
    // Add validation to verify prisma is initialized
    if (!prisma) {
      console.error('PrismaService is not properly injected!');
    }
  }

  async create(data: CreateDepotCleaningTariffDto) {
    
    try {
      // Make sure prisma is available
      if (!this.prisma) {
        console.error('PrismaService is undefined in create method!');
        throw new Error('Database service is unavailable');
      }
      
      // Check if tariff code already exists to avoid duplicates
      if (data.tariffCode) {
        const existing = await this.prisma.depotCleaningTariffCost.findFirst({
          where: { tariffCode: data.tariffCode }
        });
        
        if (existing) {
          console.warn(`Tariff code ${data.tariffCode} already exists! Generating a new one.`);
          
          // Get all existing tariffs
          const allTariffs = await this.prisma.depotCleaningTariffCost.findMany();
          
          // Extract max number
          const regex = /RST-DC-(\d+)/;
          const numbers = allTariffs
            .map(t => {
              const match = t.tariffCode.match(regex);
              return match ? parseInt(match[1], 10) : 0;
            })
            .filter(n => !isNaN(n) && n > 0);
          
          let nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
          data.tariffCode = `RST-DC-${nextNum.toString().padStart(5, '0')}`;
        }
      }
      
      // Validate foreign keys exist before creating
      await this.validateForeignKeys(data);
      
      // Create the record
      const result = await this.prisma.depotCleaningTariffCost.create({ 
        data,
        include: {
          addressBook: true,
          port: true,
          currency: true,
          product: true,
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error in create method:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      if (error.code === 'P2003') {
        throw new BadRequestException(`Invalid foreign key: ${error.meta?.field || 'unknown field'}`);
      }
      
      throw new BadRequestException(`Failed to create depot cleaning tariff: ${error.message}`);
    }
  }

  findAll() {
    return this.prisma.depotCleaningTariffCost.findMany({
      include: {
        addressBook: true,
        port: true,
        currency: true,
        product: true,
      },
    });
  }

  async findOne(id: number) {

    if (!id || isNaN(id)) {
      throw new BadRequestException(`Invalid ID: ${id}`);
    }

    const record = await this.prisma.depotCleaningTariffCost.findUnique({
      where: { id },
      include: {
        addressBook: true,
        port: true,
        currency: true,
        product: true,
      },
    });

    if (!record) {
      throw new NotFoundException(`Depot cleaning tariff with ID ${id} not found`);
    }

    return record;
  }

  // Enhance the update method
  async update(id: number, data: UpdateDepotCleaningTariffDto) {
    
    try {
      // Check if record exists first
      const existingRecord = await this.prisma.depotCleaningTariffCost.findUnique({
        where: { id }
      });
      
      if (!existingRecord) {
        console.error(`Record with id ${id} not found`);
        throw new NotFoundException(`Depot cleaning tariff with ID ${id} not found`);
      }


      // Clean up data by removing undefined values
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      );

      // Ensure all foreign keys are valid numbers if present
      const numericFields = ['portId', 'addressBookId', 'productId', 'currencyId'];
      for (const field of numericFields) {
        if (field in cleanData) {
          cleanData[field] = Number(cleanData[field]);
          
        }
      }

      // If any foreign keys are included, validate they exist
      await this.validateForeignKeys({
        ...existingRecord,
        ...cleanData
      });
      
      
      return await this.prisma.depotCleaningTariffCost.update({
        where: { id },
        data: cleanData,
        include: {
          addressBook: true,
          port: true,
          currency: true,
          product: true,
        },
      });
    } catch (error) {
      console.error('Error updating record:', error);
      
      if (error instanceof NotFoundException) throw error;
      
      if (error.code === 'P2003') {
        const constraintName = error.meta?.constraint || 'unknown';
        const fieldName = constraintName.replace('DepotCleaningTariffCost_', '').replace('_fkey', '');
        throw new BadRequestException(`Invalid foreign key: ${fieldName}. The referenced record does not exist.`);
      }
      
      if (error.code === 'P2025') {
        throw new NotFoundException(`Depot cleaning tariff with ID ${id} not found`);
      }
      
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const existingRecord = await this.prisma.depotCleaningTariffCost.findUnique({
        where: { id }
      });
      
      if (!existingRecord) {
        throw new NotFoundException(`Depot cleaning tariff with ID ${id} not found`);
      }
      
      return await this.prisma.depotCleaningTariffCost.delete({ where: { id } });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      
      if (error.code === 'P2025') {
        throw new NotFoundException(`Depot cleaning tariff with ID ${id} not found`);
      }
      
      throw error;
    }
  }

  // Helper method to validate foreign keys
  private async validateForeignKeys(data: any) {
    // Verify prisma is available before using it
    if (!this.prisma) {
      console.error('PrismaService is undefined in validateForeignKeys!');
      throw new Error('Database service is unavailable');
    }

    
    // Check port exists if portId is provided
    if (data.portId) {
      try {
        // FIXED: Changed 'ports' to 'port' (singular) to match Prisma model name
        const port = await this.prisma.ports.findUnique({
          where: { id: Number(data.portId) }
        });
        
        if (!port) {
          throw new BadRequestException(`Port with ID ${data.portId} not found`);
        }
      } catch (error) {
        console.error(`Error validating portId ${data.portId}:`, error);
        throw new BadRequestException(`Invalid portId: ${data.portId}`);
      }
    }

    // Check addressBook exists if addressBookId is provided
    if (data.addressBookId) {
      const addressBook = await this.prisma.addressBook.findUnique({
        where: { id: Number(data.addressBookId) }
      });
      
      if (!addressBook) {
        throw new BadRequestException(`Address Book with ID ${data.addressBookId} not found`);
      }
    }

    // Check product exists if productId is provided
    if (data.productId) {
      const product = await this.prisma.products.findUnique({
        where: { id: Number(data.productId) }
      });
      
      if (!product) {
        throw new BadRequestException(`Product with ID ${data.productId} not found`);
      }
    }

    // Check currency exists if currencyId is provided
    if (data.currencyId) {
      const currency = await this.prisma.currency.findUnique({
        where: { id: Number(data.currencyId) }
      });
      
      if (!currency) {
        throw new BadRequestException(`Currency with ID ${data.currencyId} not found`);
      }
    }
  }
}
