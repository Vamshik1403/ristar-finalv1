import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import dayjs = require('dayjs');

@Injectable()
export class QuotationService {
  constructor(private prisma: PrismaService) {}

async create(data: CreateQuotationDto) {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const prefix = `RST/${month}${year}/Q`;

  const last = await this.prisma.quotation.findFirst({
    where: { quotationRefNumber: { startsWith: prefix } },
    orderBy: { quotationRefNumber: 'desc' },
  });

  let next = 1;
  if (last?.quotationRefNumber) {
    const lastNum = parseInt(last.quotationRefNumber.split('/Q')[1]);
    next = lastNum + 1;
  }

  const ref = `${prefix}${String(next).padStart(5, '0')}`;


  // Make sure depotAvgCost is always a string, never null
  const depotAvgCost = data.depotAvgCost === null || data.depotAvgCost === undefined ? '' : data.depotAvgCost;

  // Convert empty strings to null for numeric fields
  const quotationData: any = {
    quotationRefNumber: ref,
    status: data.status,
    effectiveDate: new Date(data.effectiveDate),
    validTillDate: new Date(data.validTillDate),
    shippingTerm: data.shippingTerm || '',
    billingParty: data.billingParty,
    rateType: data.rateType,
    billingType: data.billingType,
    polFreeDays: data.polFreeDays,
    podFreeDays: data.podFreeDays,
    polDetentionRate: data.polDetentionRate,
    podDetentionRate: data.podDetentionRate,
    transitDays: data.transitDays,
    slotRate: data.slotRate,
    depotAvgCost: depotAvgCost, // Use the guaranteed string value
    leasingCost: data.leasingCost || '', // Convert null/undefined to empty string
    depotCleaningCost: data.depotCleaningCost || '',
    terminalHandlingFee: data.terminalHandlingFee || '',
    containerPreparationCost: data.containerPreparationCost || '',
    expAgencyCommission: data.expAgencyCommission || '',
    impAgencyCommission: data.impAgencyCommission || '',
    expCollectionCharges: data.expCollectionCharges || '',
    impCollectionCharges: data.impCollectionCharges || '',
    totalCost: data.totalCost || '',
    sellingAmount: data.sellingAmount || '',
    totalRevenueAmount: data.totalRevenueAmount || '',
    totalPLAmount: data.totalPLAmount || '',
    plMargin: data.plMargin || '',

    custAddressBook: { connect: { id: data.custAddressBookId } },
    product: { connect: { id: data.productId } },
    polPort: { connect: { id: data.polPortId } },
    podPort: { connect: { id: data.podPortId } },
    expDepotAddressBook: { connect: { id: data.expDepotAddressBookId } },
    expHandlingAgentAddressBook: { connect: { id: data.expHandlingAgentAddressBookId } },
    impHandlingAgentAddressBook: { connect: { id: data.impHandlingAgentAddressBookId } },
  };

  // Optional fields
  if (data.emptyReturnAddressBookId && data.emptyReturnAddressBookId > 0) {
    quotationData.emptyReturnAddressBook = {
      connect: { id: data.emptyReturnAddressBookId },
    };
  }

  if (data.transhipmentPortId && data.transhipmentPortId > 0) {
    quotationData.transhipmentPort = {
      connect: { id: data.transhipmentPortId },
    };
  }

  if (data.transhipmentHandlingAgentAddressBookId && data.transhipmentHandlingAgentAddressBookId > 0) {
    quotationData.transhipmentHandlingAgentAddressBook = {
      connect: { id: data.transhipmentHandlingAgentAddressBookId },
    };
  }

  // Validate required fields
  if (!data.productId) {
    throw new Error('Product ID is required');
  }

  if (!data.polPortId) {
    throw new Error('Port of Loading ID is required');
  }

  if (!data.podPortId) {
    throw new Error('Port of Discharge ID is required');
  }

  if (!data.custAddressBookId) {
    throw new Error('Customer ID is required');
  }

  try {
    const result = await this.prisma.quotation.create({
      data: quotationData,
    });
    return result;
  } catch (error) {
    console.error('❌ Failed to create quotation:', error);
    throw new Error('Quotation creation failed. See logs for details.');
  }
}



   async getNextQuotationRefNumber(): Promise<string> {
    const now = dayjs();
    const prefix = `RST/${now.format('MMYY')}/`;

    const latest = await this.prisma.quotation.findFirst({
      where: {
        quotationRefNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        quotationRefNumber: 'desc',
      },
    });

    let nextNumber = 1;

    if (latest && latest.quotationRefNumber) {
      const parts = latest.quotationRefNumber.split('/');
      const last = parts[2];
      nextNumber = parseInt(last.replace('Q', '')) + 1;
    }

    const padded = String(nextNumber).padStart(5, '0');
    return `${prefix}Q${padded}`;
  }

  async findAll() {
    return this.prisma.quotation.findMany({
      include: {
        custAddressBook: true,
        expDepotAddressBook: true,
        emptyReturnAddressBook: true,
        expHandlingAgentAddressBook: true,
        impHandlingAgentAddressBook: true,
        transhipmentHandlingAgentAddressBook: true,
        polPort: true,
        podPort: true,
        transhipmentPort: true,
        product: true,
      },
    });
  }

  async findOne(id: number) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: {
        custAddressBook: true,
        expDepotAddressBook: true,
        emptyReturnAddressBook: true,
        expHandlingAgentAddressBook: true,
        impHandlingAgentAddressBook: true,
        transhipmentHandlingAgentAddressBook: true,
        polPort: true,
        podPort: true,
        transhipmentPort: true,
        product: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    return quotation;
  }

  async update(id: number, data: UpdateQuotationDto) {
    // Format dates properly for ISO format
    const formattedData: any = {};
    
    // Handle basic scalar fields
    if (data.status !== undefined) formattedData.status = data.status;
    if (data.shippingTerm !== undefined) formattedData.shippingTerm = data.shippingTerm || '';
    if (data.billingParty !== undefined) formattedData.billingParty = data.billingParty || '';
    if (data.rateType !== undefined) formattedData.rateType = data.rateType || '';
    if (data.billingType !== undefined) formattedData.billingType = data.billingType || '';
    if (data.polFreeDays !== undefined) formattedData.polFreeDays = data.polFreeDays || '';
    if (data.podFreeDays !== undefined) formattedData.podFreeDays = data.podFreeDays || '';
    if (data.polDetentionRate !== undefined) formattedData.polDetentionRate = data.polDetentionRate || '';
    if (data.podDetentionRate !== undefined) formattedData.podDetentionRate = data.podDetentionRate || '';
    if (data.transitDays !== undefined) formattedData.transitDays = data.transitDays || '';
    if (data.slotRate !== undefined) formattedData.slotRate = data.slotRate || '';
    
    // Always ensure these fields are strings, never null
    if (data.depotAvgCost !== undefined) {
      formattedData.depotAvgCost = data.depotAvgCost === null ? '' : data.depotAvgCost;
    }
    
    if (data.leasingCost !== undefined) {
      formattedData.leasingCost = data.leasingCost === null ? '' : data.leasingCost;
    }
    
    if (data.depotCleaningCost !== undefined) {
      formattedData.depotCleaningCost = data.depotCleaningCost === null ? '' : data.depotCleaningCost;
    }
    
    // Handle other potentially empty fields
    if (data.terminalHandlingFee !== undefined) {
      formattedData.terminalHandlingFee = data.terminalHandlingFee || '';
    }
    
    if (data.containerPreparationCost !== undefined) {
      formattedData.containerPreparationCost = data.containerPreparationCost || '';
    }
    
    if (data.expAgencyCommission !== undefined) {
      formattedData.expAgencyCommission = data.expAgencyCommission || '';
    }
    
    if (data.impAgencyCommission !== undefined) {
      formattedData.impAgencyCommission = data.impAgencyCommission || '';
    }
    
    if (data.expCollectionCharges !== undefined) {
      formattedData.expCollectionCharges = data.expCollectionCharges || '';
    }
    
    if (data.impCollectionCharges !== undefined) {
      formattedData.impCollectionCharges = data.impCollectionCharges || '';
    }
    
    if (data.totalCost !== undefined) {
      formattedData.totalCost = data.totalCost || '';
    }
    
    if (data.sellingAmount !== undefined) {
      formattedData.sellingAmount = data.sellingAmount || '';
    }
    
    if (data.totalRevenueAmount !== undefined) {
      formattedData.totalRevenueAmount = data.totalRevenueAmount || '';
    }
    
    if (data.totalPLAmount !== undefined) {
      formattedData.totalPLAmount = data.totalPLAmount || '';
    }
    
    if (data.plMargin !== undefined) {
      formattedData.plMargin = data.plMargin || '';
    }
    
    // Format dates as ISO strings
    if (data.effectiveDate) {
      formattedData.effectiveDate = new Date(data.effectiveDate).toISOString();
    }
    
    if (data.validTillDate) {
      formattedData.validTillDate = new Date(data.validTillDate).toISOString();
    }
    
    // Relations handling remains the same
    if (data.custAddressBookId) {
      formattedData.custAddressBook = { 
        connect: { id: Number(data.custAddressBookId) } 
      };
    }
    
    if (data.productId) {
      formattedData.product = { 
        connect: { id: Number(data.productId) } 
      };
    }
    
    if (data.polPortId) {
      formattedData.polPort = { 
        connect: { id: Number(data.polPortId) } 
      };
    }
    
    if (data.podPortId) {
      formattedData.podPort = { 
        connect: { id: Number(data.podPortId) } 
      };
    }
    
    if (data.expDepotAddressBookId) {
      formattedData.expDepotAddressBook = { 
        connect: { id: Number(data.expDepotAddressBookId) } 
      };
    }
    
    if (data.expHandlingAgentAddressBookId) {
      formattedData.expHandlingAgentAddressBook = { 
        connect: { id: Number(data.expHandlingAgentAddressBookId) } 
      };
    }
    
    if (data.impHandlingAgentAddressBookId) {
      formattedData.impHandlingAgentAddressBook = { 
        connect: { id: Number(data.impHandlingAgentAddressBookId) } 
      };
    }
    
    // Optional relations - connect or disconnect
    if (data.emptyReturnAddressBookId && Number(data.emptyReturnAddressBookId) > 0) {
      formattedData.emptyReturnAddressBook = { 
        connect: { id: Number(data.emptyReturnAddressBookId) } 
      };
    } else if (data.emptyReturnAddressBookId === null || data.emptyReturnAddressBookId === 0) {
      formattedData.emptyReturnAddressBook = { disconnect: true };
    }
    
    // Handle transhipment fields
    if (data.transhipmentPortId && Number(data.transhipmentPortId) > 0) {
      formattedData.transhipmentPort = { 
        connect: { id: Number(data.transhipmentPortId) } 
      };
    } else if (data.transhipmentPortId === null || data.transhipmentPortId === 0) {
      formattedData.transhipmentPort = { disconnect: true };
    }
    
    if (data.transhipmentHandlingAgentAddressBookId && 
        Number(data.transhipmentHandlingAgentAddressBookId) > 0) {
      formattedData.transhipmentHandlingAgentAddressBook = { 
        connect: { id: Number(data.transhipmentHandlingAgentAddressBookId) } 
      };
    } else if (data.transhipmentHandlingAgentAddressBookId === null || 
        data.transhipmentHandlingAgentAddressBookId === 0) {
      formattedData.transhipmentHandlingAgentAddressBook = { disconnect: true };
    }
        
    try {
      return await this.prisma.quotation.update({
        where: { id },
        data: formattedData,
      });
    } catch (error) {
      console.error('❌ Failed to update quotation:', error);
      throw new Error(`Quotation update failed: ${error.message}`);
    }
  }

  async remove(id: number) {
    return this.prisma.quotation.delete({
      where: { id },
    });
  }
}
