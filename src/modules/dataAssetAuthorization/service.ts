import { Injectable } from '@nestjs/common';
import { Prisma, self_db, self_db as SqlInfos } from '@prisma/client';
import { CreateManySqlCount } from 'src/graphql.schema';
import { PrismaService } from 'src/prisma.service';

/**
 * 数据库资产授权的service
 *
 * @export
 * @class DataAssetAuthorizationService
 */
@Injectable()
export class DataAssetAuthorizationService {
  async getResourcesInfoId(
    input: Prisma.self_dbWhereInput,
    pagination?: { skip: number; take: number },
    region?: string,
  ): Promise<{ data: SqlInfos[] | []; total: number }> {
    const idArrObject: { id: number }[] =
      await this.prisma.resources_info.findMany({
        where: { region: region },
        select: { id: true },
      });

    //将对象转换为数组
    const idArr = idArrObject.map((item) => item.id);

    //查询所有的
    const data = await this.prisma.self_db.findMany({
      where: {
        AND: [
          input,
          {
            resources_info_id: { in: idArr },
          },
        ],
      },
      orderBy: [
        {
          //根据id倒序这里要改成根据时间做一个排序
          id: 'desc',
        },
      ],
      skip: pagination.skip,
      take: pagination.take,
    });
    const total = await this.prisma.self_db.count({
      where: { AND: [input, { resources_info_id: { in: idArr } }] },
    });

    return { data, total };
  }
  constructor(private prisma: PrismaService) { }
  async findById(id: number) {
    return this.prisma.self_db.findFirst({ where: { id: id } });
  }
  async deleteOne(input: Prisma.self_dbWhereUniqueInput): Promise<SqlInfos> {
    await this.prisma.db_sensitive_result.deleteMany({
      where: { self_db_id: input.id },
    });
    const database = await this.prisma.self_db.findUnique({
      where: input,
    });
    const result = await this.prisma.self_db.delete({
      where: input,
    });
    const countOfAuthorizied = await this.prisma.self_db.count({
      where: {
        resources_info_id: database.resources_info_id,
        identify_permissions: 1,
      },
    });
    await this.prisma.resources_info.update({
      where: { id: database.resources_info_id },
      data: { authorizedDatabase: countOfAuthorizied },
    });
    return result;
  }
  /**
   * 创建一条或者多条数据
   * @param input
   * @param data
   * @returns
   */
  async updateOne(
    input: Prisma.self_dbWhereUniqueInput,
    data: Prisma.self_dbUpdateInput,
  ): Promise<self_db> {
    const result = await this.prisma.self_db.update({
      where: input,
      data,
    });
    const database = await this.prisma.self_db.findUnique({
      where: input,
    });
    const countOfAuthorizied = await this.prisma.self_db.count({
      where: {
        resources_info_id: database.resources_info_id,
        identify_permissions: 1,
      },
    });
    await this.prisma.resources_info.update({
      where: { id: database.resources_info_id },
      data: { authorizedDatabase: countOfAuthorizied },
    });
    return result;
  }
  /**
   * 创建一个或多个记录
   * @param data
   * @returns
   */
  async createMany(
    data: Prisma.self_dbCreateInput[],
  ): Promise<CreateManySqlCount> {
    return await this.prisma.self_db.createMany({
      data: data,
    });
  }

  /**
   *  组合条件查询查询所有的数据库资产
   * @param input
   * @param pagination
   * @returns
   */
  async getSqlInfosByOriginzd(
    input: Prisma.self_dbWhereInput,
    pagination?: { skip: number; take: number },
  ): Promise<{ data: SqlInfos[] | []; total: number }> {
    //查询所有的
    const data = await this.prisma.self_db.findMany({
      where: input,
      orderBy: [
        {
          //根据id倒序这里要改成根据时间做一个排序
          id: 'desc',
        },
      ],
      skip: pagination.skip,
      take: pagination.take,
    });
    const total = await this.prisma.self_db.count({
      where: input,
    });

    return { data, total };
  }
  async findByResourceInfoId(
    resource_info_id: number[],
  ): Promise<{ data: SqlInfos[] | []; total: number }> {
    const data = await this.prisma.self_db.findMany({
      where: { resources_info_id: { in: resource_info_id } },
    });

    const total = await this.prisma.self_db.count({
      where: { resources_info_id: { in: resource_info_id } },
    });

    return { data, total };
  }
  async findByDbType(
    db_tpye: string,
  ): Promise<{ data: SqlInfos[] | []; total: number }> {
    const data = await this.prisma.self_db.findMany({
      where: { db_type: db_tpye },
    });
    const total = await this.prisma.self_db.count({
      where: { db_type: db_tpye },
    });
    return { data, total };
  }

  //获取已授权数据库
  async getAuthorizedDb(
    resources_info_id: number,
  ): Promise<{ data: SqlInfos[] | []; total: number }> {
    const data = await this.prisma.self_db.findMany({
      where: {
        resources_info_id: resources_info_id,
        identify_permissions: 1,
      },
    });
    const total = await this.prisma.self_db.count({
      where: {
        resources_info_id: resources_info_id,
        identify_permissions: 1,
      },
    });
    return { data, total };
  }
}
