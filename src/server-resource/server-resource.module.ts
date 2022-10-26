import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ServerResourceResolver } from './server-resource.resolver';
import { ServerResourceService } from './server-resource.service';

@Module({
  providers: [PrismaService, ServerResourceService, ServerResourceResolver],
})
export class ServerResourceModule {}
