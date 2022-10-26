import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ServerResourceResolver } from 'src/server-resource/server-resource.resolver';
import { ServerResourceService } from 'src/server-resource/server-resource.service';
import { DataAssetAuthorizationResolver } from './resolver';
import { DataAssetAuthorizationService } from './service';

@Module({
  providers: [
    PrismaService,
    DataAssetAuthorizationService,
    ServerResourceResolver,
    DataAssetAuthorizationResolver,
    ServerResourceService,
  ],
})
export class DataAssetAuthorizationModule {}
