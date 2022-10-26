import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RecognitionModelService } from './service';
import { RecognitionModelResolver } from './resolver';

@Module({
  providers: [PrismaService, RecognitionModelService, RecognitionModelResolver],
})
export class RecognitionModelModule {}
