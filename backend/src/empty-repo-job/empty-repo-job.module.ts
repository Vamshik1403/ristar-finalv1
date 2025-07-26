import { Module } from '@nestjs/common';
import { EmptyRepoJobController } from './empty-repo-job.controller';
import { EmptyRepoJobService } from './empty-repo-job.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports:[PrismaModule],
  controllers: [EmptyRepoJobController],
  providers: [EmptyRepoJobService]
})
export class EmptyRepoJobModule {}
