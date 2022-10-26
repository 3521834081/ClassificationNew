import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ServerResourceResolver } from 'src/server-resource/server-resource.resolver';
import { ServerResourceService } from 'src/server-resource/server-resource.service';
import { DataAssetAuthorizationResolver } from '../dataAssetAuthorization/resolver';
import { DataAssetAuthorizationService } from '../dataAssetAuthorization/service';
import { SensitiveResultResolver } from './resolver';
import { SensitiveResultService } from './service';

@Module({
  providers: [
    PrismaService,
    SensitiveResultService,
    SensitiveResultResolver,
    DataAssetAuthorizationService,
    DataAssetAuthorizationResolver,
    ServerResourceService,
    ServerResourceResolver,
  ],
})
export class SensitiveResultModule {}
