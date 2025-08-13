import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for all origins (or restrict to localhost:3000 if you want)
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Serve static files for certificates
  app.useStaticAssets(join(process.cwd(), 'uploads', 'certificates'), {
    prefix: '/tankcertificate/uploads/certificates/',
  });

  // Serve static files for reports
  app.useStaticAssets(join(process.cwd(), 'uploads', 'reports'), {
    prefix: '/tankcertificate/uploads/reports/',
  });

   // Serve static files for the main uploads directory (for MSDS and other files)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(8000); // Bill of Lading API available
}
bootstrap();
