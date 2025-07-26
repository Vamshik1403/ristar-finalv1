import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UploadedFile, UseInterceptors, Req } from '@nestjs/common';
import { OnHireReportService } from './on-hire-report.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { OnHireReportDto } from './dto/create-onhire-report.dto';
import { UpdateOnHireReportDto } from './dto/update-onhire-report.dto';

@Controller('onhirereport')
export class OnHireReportController {
     constructor(private readonly service: OnHireReportService) {}

  // In your backend (e.g., reports-upload.controller.ts)
@Post('uploads/reports')
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: './uploads/reports',
    filename: (req, file, cb) => {
      // Make sure file exists 
      if (!file) {
        return cb(new Error('No file provided'), '');
      }

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname || 'unknown');
      cb(null, `${file.fieldname || 'file'}-${uniqueSuffix}${ext}`);
    },
  }),
  // Add fileFilter to validate file types if needed
  fileFilter: (req, file, cb) => {
    // Optional: Add file type validation
    // For now, accept all files
    cb(null, true);
  },
}))
uploadReport(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
  
  if (!file) {
    return { 
      success: false,
      filename: null, 
      message: 'No file uploaded. Please ensure the form includes a file field named "file".' 
    };
  }
  return { 
    success: true,
    filename: file.filename,
    originalName: file.originalname
  };
}

  // ADD THIS MISSING CREATE ENDPOINT
  @Post()
  create(@Body() createOnHireReportDto: OnHireReportDto) {
    return this.service.create(createOnHireReportDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOnHireReportDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
