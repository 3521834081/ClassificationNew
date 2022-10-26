import { Injectable } from '@nestjs/common';
import { Prisma, resources_info, self_db } from '@prisma/client';
import { SqlInfo } from 'src/graphql.schema';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ServerResourceService {
  constructor(private prisma: PrismaService) {}

  /**
   * 根据id查找resources_info表内记录
   *
   * @param {Prisma.resources_infoWhereUniqueInput} input
   * @returns {*} {Promise<resources_info>}
   * @memberof ServerResourceService
   */
  async findById(
    input: Prisma.resources_infoWhereUniqueInput,
  ): Promise<resources_info> {
    return this.prisma.resources_info.findUnique({
      where: input,
    });
  }
  /**
   * 根据字段条件按分页查询resrouces_info表内记录
   *
   * @param {Prisma.resources_infoWhereInput} input
   * @param {{ skip: number; take: number }} pagination
   * @returns {*} Promise<{ data: resources_info[] | []; total: number }>
   * @memberof ServerResourceService
   */
  async findByOutId(
    input: Prisma.resources_infoWhereInput,
    pagination?: { skip: number; take: number },
  ): Promise<{ data: resources_info[] | []; total: number }> {
    if (pagination) {
      const data = await this.prisma.resources_info.findMany({
        where: input,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: [
          {
            //根据id倒序这里要改成根据时间做一个排序
            id: 'desc',
          },
        ],
      });
      const total = await this.prisma.resources_info.count({
        where: input,
      });
      return { data, total };
    } else {
      const data = await this.prisma.resources_info.findMany({
        where: input,
        orderBy: [
          {
            //根据id倒序这里要改成根据时间做一个排序
            id: 'desc',
          },
        ],
      });
      const total = await this.prisma.resources_info.count({
        where: input,
      });
      return { data, total };
    }
  }
  /**
   * 在resource_info表中插入一条记录
   *
   * @param {Prisma.resources_infoCreateInput} data
   * @returns {*} {Promise<resources_info>}
   * @memberof ServerResourceService
   */
  async createOne(
    data: Prisma.resources_infoCreateInput,
  ): Promise<resources_info> {
    return await this.prisma.resources_info.create({
      data,
    });
  }
  /**
   * 删除resrouces_info表内指定条件的一条记录
   *
   * @param {Prisma.resources_infoWhereUniqueInput} input
   * @returns {*} {Promise<resources_info>}
   * @memberof ServerResourceService
   */
  async deleteOne(
    input: Prisma.resources_infoWhereUniqueInput,
  ): Promise<resources_info> {
    return await this.prisma.resources_info.delete({
      where: input,
    });
  }
  /**
   * 查找self_db表内记录
   *
   * @param input
   */
  async findSelf_db(input: { id: number }): Promise<{ data: self_db[] }> {
    const data = await this.prisma.self_db.findMany({
      where: { resources_info_id: input.id },
    });
    return { data };
  }
  /**
   * 更新resrouces_info表内指定条件的一条记录
   *
   * @param {Prisma.resources_infoWhereUniqueInput} input
   * @param {Prisma.resources_infoUpdateInput} data
   * @returns {*} {Promise<resources_info>}
   * @memberof ServerResourceService
   */
  async updateOne(
    input: Prisma.resources_infoWhereUniqueInput,
    data: Prisma.resources_infoUpdateInput,
  ): Promise<resources_info> {
    return await this.prisma.resources_info.update({
      where: input,
      data,
    });
  }
  /**
   * 根据筛选条件删除resrouces_info表内数据
   *
   * @param {Prisma.resources_infoDeleteManyArgs} input
   * @returns {*} Promise<Prisma.BatchPayload>
   * @memberof ServerResourceService
   */
  async deleteMany(
    input: Prisma.resources_infoDeleteManyArgs,
  ): Promise<Prisma.BatchPayload> {
    const deleteCount = await this.prisma.resources_info.deleteMany({
      where: input.where,
    });
    return deleteCount;
  }

  //获取已授权数据库
  async getAuthorizedDb(resources_info_id: number): Promise<self_db[]> {
    const data = await this.prisma.self_db.findMany({
      where: {
        resources_info_id: resources_info_id,
        identify_permissions: 1,
      },
    });
    // const total = await this.prisma.self_db.count({
    //   where: {
    //     resources_info_id: resources_info_id,
    //     identify_permissions: 1,
    //   },
    // });
    return data;
  }
}
