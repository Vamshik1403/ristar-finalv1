import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { MovementHistoryService } from './movement-history.service';
import { BulkUpdateMovementDto } from './dto/bulk-update-movement.dto';

@Controller('movement-history')
export class MovementHistoryController {
  constructor(
    private readonly movementHistoryService: MovementHistoryService,
  ) {}

  @Get('except-available')
  findAllExceptAvailable() {
    return this.movementHistoryService.findAllExceptAvailable();
  }

  @Get()
  async getAllMovementHistory() {
    return this.movementHistoryService.findAll();
  }
  
      @Get("latest")
getLatestPerContainer() {
  return this.movementHistoryService.findLatestPerContainer();
}



  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.movementHistoryService.findOne(id);
  }


  @Post('bulk-create')
  
  async bulkCreateStatus(
    
    @Body()
    body: {
      ids: number[];
      newStatus: string;
      jobNumber: string;
      portId?: number;
      addressBookId?: number;
      remarks?:string;
      vesselName?: string;
    },
    
  ) {
    console.log('🚀 Received payload:', body); 
    const { ids, newStatus, portId, addressBookId ,remarks , vesselName} = body;

    const results = await Promise.all(
      ids.map((id) =>
        this.movementHistoryService.createNewStatusEntry(
          id,
          newStatus,
          portId ?? null,
          addressBookId ?? null,
          remarks?.trim() || undefined,
          vesselName?.trim() || undefined,
        ),
      ),
    );

    return { message: 'New status entries created', results };
  }

  @Post('bulk-update')
  async bulkUpdate(
    @Body() dto: { ids: number[]; newStatus: string; jobNumber: string; remarks:string , vesselName?: string },
  ) {
    return this.movementHistoryService.bulkUpdateStatus(
      dto.ids,
      dto.newStatus,
      dto.jobNumber,
      dto.remarks,
      dto.vesselName,

    );
  }

  @Patch(':id')
  updateMovement(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.movementHistoryService.updateMovement(id, body);
  }



}