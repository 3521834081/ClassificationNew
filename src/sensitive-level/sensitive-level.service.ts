import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { sensitive_level, Prisma } from '@prisma/client';
import { SensitiveLevel } from 'src/graphql.schema';
// import { SensitiveLevel } from 'src/graphql.schema';

@Injectable()
export class SensitiveLevelService {
  constructor(private prisma: PrismaService) {}

  async findSensitiveLevelById(
    sensitive_levelWhereUniqueInput: Prisma.sensitive_levelWhereUniqueInput,
  ): Promise<sensitive_level | null> {
    return this.prisma.sensitive_level.findUnique({
      where: sensitive_levelWhereUniqueInput,
    });
  }

  async findSensitiveLevelByOnUse(
    input: Prisma.sensitive_levelWhereInput,
    pagination?: { skip: number; take: number },
  ): Promise<{ data: SensitiveLevel[] | null; total: number }> {
    if (pagination) {
      const data = await this.prisma.sensitive_level.findMany({
        where: input,
        skip: pagination.skip,
        take: pagination.take,
      });
      const total = await this.prisma.sensitive_level.count({
        where: input,
      });
      return { data, total };
    } else {
      const data = await this.prisma.sensitive_level.findMany({
        where: input,
      });
      const total = await this.prisma.sensitive_level.count({
        where: input,
      });
      return { data, total };
    }
  }

  async findAllSensitiveLevel(): Promise<sensitive_level[]> {
    return await this.prisma.sensitive_level.findMany();
  }

  async createSensitiveLevel(
    data: Prisma.sensitive_levelCreateInput,
  ): Promise<sensitive_level> {
    return await this.prisma.sensitive_level.create({
      data,
    });
  }

  async deleteSensitiveLevel(
    input: Prisma.sensitive_levelWhereUniqueInput,
  ): Promise<sensitive_level> {
    return await this.prisma.sensitive_level.delete({
      where: input,
    });
  }
  async findIsUse(id: number): Promise<boolean> {
    const data = Boolean(
      await this.prisma.sensitive_rules.findFirst({
        where: { sensitive_level_id: id },
      }),
    );
    return data;
  }

  async updateSensitiveLevel(
    id: number,
    describe: string,
  ): Promise<sensitive_level> {
    const data = await this.prisma.sensitive_level.update({
      where: {
        id: id,
      },
      data: {
        describe: describe,
      },
    });
    return data;
  }
}
