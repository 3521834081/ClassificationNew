import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ClassificationTemplateService } from './service';
import { ClassificationTemplateResolver } from './resolver';
import { SensitiveClassificationService } from '../sensitiveClassification/service';
import { SensitiveClassificationResolver } from '../sensitiveClassification/resolver';

@Module({
  providers: [
    PrismaService,
    ClassificationTemplateService,
    ClassificationTemplateResolver,
    SensitiveClassificationService,
  ],
})
export class ClassificationTemplateModule { }
