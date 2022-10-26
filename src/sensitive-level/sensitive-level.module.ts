import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { SensitiveLevelService } from './sensitive-level.service';
import { SensitiveLevelResolver } from './sensitive-level.resolver';
import { ClassificationTemplateService } from 'src/modules/classificationTemplate/service';
import { SensitiveClassificationService } from 'src/modules/sensitiveClassification/service';
import { SensitiveRuleservice } from 'src/modules/sensitiveRules/service';

@Module({
  providers: [
    PrismaService,
    SensitiveLevelService,
    SensitiveLevelResolver,
    ClassificationTemplateService,
    SensitiveClassificationService,
    SensitiveRuleservice,
  ],
})
export class SensitiveModule { }
