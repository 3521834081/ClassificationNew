import { Injectable } from '@nestjs/common';
import { db_sensitive_result, Prisma, sensitive_results } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { TransferDate } from 'src/utils/TransferDate';

@Injectable()
export class DbSensitiveResultService {
  constructor(private prisma: PrismaService) {}
  async findDbSensitiveResult(
    pagination?: { skip: number; take: number },
    input?: {
      starttime: string;
      endtime: string;
    },
    self_db_id?: number[],
  ): Promise<{ data: db_sensitive_result[] | []; total: number }> {
    if (input.starttime && input.endtime) {
      const data = await this.prisma.db_sensitive_result.findMany({
        where: {
          self_db_id: { in: self_db_id },
          update_time: {
            gte: TransferDate.parseISOLocal(input.starttime),
            lte: TransferDate.parseISOLocal(input.endtime),
          },
        },
        orderBy: [{ id: 'desc' }],
        skip: pagination.skip,
        take: pagination.take,
      });
      const total = await this.prisma.db_sensitive_result.count({
        where: {
          self_db_id: { in: self_db_id },
          update_time: {
            gte: TransferDate.parseISOLocal(input.starttime),
            lte: TransferDate.parseISOLocal(input.endtime),
          },
        },
      });
      return { data, total };
    } else {
      const data = await this.prisma.db_sensitive_result.findMany({
        where: {
          self_db_id: { in: self_db_id },
          // update_time: {
          //   gte: TransferDate.parseISOLocal(input.starttime),
          //   lte: TransferDate.parseISOLocal(input.endtime),
          // },
        },
        orderBy: [{ id: 'desc' }],
        skip: pagination.skip,
        take: pagination.take,
      });
      const total = await this.prisma.db_sensitive_result.count({
        where: {
          self_db_id: { in: self_db_id },
          // update_time: {
          //   gte: TransferDate.parseISOLocal(input.starttime),
          //   lte: TransferDate.parseISOLocal(input.endtime),
          // },
        },
      });
      return { data, total };
    }
  }
  async updateHitRules(
    input: Prisma.sensitive_resultsWhereUniqueInput,
    data: Prisma.sensitive_resultsUpdateInput,
  ): Promise<sensitive_results> {
    return await this.prisma.sensitive_results.update({
      where: input,
      data,
    });
  }
}
