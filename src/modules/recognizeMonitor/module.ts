import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ServerResourceResolver } from 'src/server-resource/server-resource.resolver';
import { ServerResourceService } from 'src/server-resource/server-resource.service';
import { DataAssetAuthorizationResolver } from '../dataAssetAuthorization/resolver';
import { DataAssetAuthorizationService } from '../dataAssetAuthorization/service';
import { SensitiveClassificationService } from '../sensitiveClassification/service';
import { SensitiveResultService } from '../sensitiveResult/service';

import { RecognizeMonitorResolver } from './resolver';
import { RecognizeMonitorService } from './service';

@Module({
  providers: [
    PrismaService,
    RecognizeMonitorResolver,
    RecognizeMonitorService,
    DataAssetAuthorizationResolver,
    DataAssetAuthorizationService,
    ServerResourceResolver,
    DataAssetAuthorizationResolver,
    ServerResourceService,
    SensitiveResultService,
    SensitiveClassificationService,
  ],
})
export class RecognizeMonitorModule { }
