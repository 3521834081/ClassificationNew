import { Module } from '@nestjs/common';
import { DbSensitiveResultService } from './service';
import { DbSensitiveResultResolver } from './resolver';
import { PrismaService } from 'src/prisma.service';
import { DataAssetAuthorizationService } from '../dataAssetAuthorization/service';
import { ServerResourceService } from 'src/server-resource/server-resource.service';
import { ServerResourceResolver } from 'src/server-resource/server-resource.resolver';
import { DataAssetAuthorizationResolver } from '../dataAssetAuthorization/resolver';
import { SensitiveResultService } from '../sensitiveResult/service';

@Module({
  providers: [
    PrismaService,
    DbSensitiveResultService,
    DbSensitiveResultResolver,
    DataAssetAuthorizationService,
    DataAssetAuthorizationResolver,
    ServerResourceService,
    ServerResourceResolver,
    SensitiveResultService,
  ],
})
export class DbSensitiveResultModule {}
