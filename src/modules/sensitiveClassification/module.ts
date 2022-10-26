import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { SensitiveRuleservice } from '../sensitiveRules/service';
import { SensitiveClassificationResolver } from './resolver';
import { ClassificationTemplateService } from '../classificationTemplate/service';
import { SensitiveClassificationService } from './service';

@Module({
  providers: [
    PrismaService,
    SensitiveRuleservice,
    ClassificationTemplateService,
    SensitiveClassificationResolver,
    SensitiveClassificationService,
  ],
})
export class SensitiveClassificationModule { }
