import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { SensitiveRuleservice } from './service';
import { SensitiveRulesResolver } from './resolver';
import { ClassificationTemplateService } from 'src/modules/classificationTemplate/service';
import { RecognitionModelService } from 'src/modules/recognitionModel/service';
import { SensitiveClassificationService } from '../sensitiveClassification/service';

@Module({
  providers: [
    PrismaService,
    SensitiveRuleservice,
    SensitiveRulesResolver,
    ClassificationTemplateService,
    RecognitionModelService,
    SensitiveClassificationService,
  ],
})
export class SensitiveRuleModule { }
