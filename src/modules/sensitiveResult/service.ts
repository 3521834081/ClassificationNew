import { Injectable } from '@nestjs/common';
import { column_info, self_db, sensitive_results } from '@prisma/client';
import {
  ColumnInfo,
  RevisedRecord,
  SensitiveResult,
  SqlInfo,
} from 'src/graphql.schema';
import { PrismaService } from 'src/prisma.service';
import { TransferDate } from 'src/utils/TransferDate';

@Injectable()
export class SensitiveResultService {
  constructor(private prisma: PrismaService) { }
  async findSensitiveResult(
    input?: {
      table_name: string;
      hit_data?;
      starttime?: string;
      endtime?: string;
    },
    database_id?: number[],
    pagination?: { skip: number; take: number },
  ): Promise<{ data: sensitive_results[] | []; total: number }> {
    if (input.starttime && input.endtime) {
      const data = await this.prisma.sensitive_results.findMany({
        where: {
          table_name: input.table_name,
          database_id: { in: database_id },
          hit_data: input.hit_data,
          update_time: {
            gte: TransferDate.parseISOLocal(input.starttime),
            lte: TransferDate.parseISOLocal(input.endtime),
          },
        },
        orderBy: [
          {
            id: 'desc',
          },
        ],
        skip: pagination.skip,
        take: pagination.take,
      });

      const total = await this.prisma.sensitive_results.count({
        where: {
          table_name: input.table_name,
          database_id: { in: database_id },
          hit_data: input.hit_data,
          update_time: {
            gte: TransferDate.parseISOLocal(input.starttime),
            lte: TransferDate.parseISOLocal(input.endtime),
          },
        },
      });
      return { data, total };
    } else {
      const data = await this.prisma.sensitive_results.findMany({
        where: {
          table_name: input.table_name,
          database_id: { in: database_id },
          hit_data: input.hit_data,
        },
        orderBy: [
          {
            id: 'desc',
          },
        ],
        skip: pagination.skip,
        take: pagination.take,
      });

      const total = await this.prisma.sensitive_results.count({
        where: {
          table_name: input.table_name,
          database_id: { in: database_id },
          hit_data: input.hit_data,
        },
      });
      return { data, total };
    }
  }

  async getTablesDetail(
    database_id: number,
    table_name?: string,
    pagination?: { skip: number; take: number },
  ): Promise<{ data: SensitiveResult[] | []; total: number }> {
    if (pagination) {
      const data = await this.prisma.sensitive_results.findMany({
        where: {
          database_id: database_id,
          table_name: table_name,
        },
        // skip: pagination.skip,
        // take: pagination.take,
      });
      const total = await this.prisma.sensitive_results.count({
        where: {
          database_id: database_id,
          table_name: table_name,
        },
      });
      // console.log(data, '===', total);
      return { data, total };
    } else {
      const data = await this.prisma.sensitive_results.findMany({
        where: {
          database_id: database_id,
          table_name: table_name,
        },
      });
      const total = await this.prisma.sensitive_results.count({
        where: {
          database_id: database_id,
          table_name: table_name,
        },
      });
      return { data, total };
    }
  }
  /**
   * 添加一条result
   */
  //  async  addSensitiveResult(tableResult: sensitive_results){

  //  }
  //新 列详情搜索
  async getColumnInfo(
    sensitive_result_id: number,
    pagination?: { skip: number; take: number },
  ): Promise<{ data: ColumnInfo[] | []; total: number }> {
    if (pagination) {
      const data = await this.prisma.column_info.findMany({
        where: { sensitive_results_id: sensitive_result_id },
        skip: pagination.skip,
        take: pagination.take,
      });
      const total = await this.prisma.column_info.count({
        where: { sensitive_results_id: sensitive_result_id },
      });
      return { data, total };
    } else {
      const data = await this.prisma.column_info.findMany({
        where: { sensitive_results_id: sensitive_result_id },
      });
      const total = await this.prisma.column_info.count({
        where: { sensitive_results_id: sensitive_result_id },
      });
      return { data, total };
    }
  }
  //新 订正命中规则
  async revisionHitRules(
    sensitive_result_id: number,
    column_id: number,
    hit_rule: string,
    sensitive_level: string,
  ): Promise<column_info> {
    const column = await this.prisma.column_info.findMany({
      where: {
        sensitive_results_id: sensitive_result_id,
        column_id: column_id,
      },
    });
    const id = column[0].id;
    if (column[0].revision_status == 0) {
      const before_hit_rule = column[0].hit_rule;
      const before_hit_level = column[0].sensitive_level;
      return await this.prisma.column_info.update({
        where: { id: id },
        data: {
          hit_rule: hit_rule,
          sensitive_level: sensitive_level,
          before_hit_rule: before_hit_rule,
          before_hit_level: before_hit_level,
          revision_status: 1,
        },
      });
    } else {
      return await this.prisma.column_info.update({
        where: { id: id },
        data: {
          hit_rule: hit_rule,
          sensitive_level: sensitive_level,
        },
      });
    }
  }
  // 查询命中规则敏感等级
  async selectLevel(
    sensitive_result_id: number,
    hit_rule: string,
  ): Promise<string> {
    const result = await this.prisma.sensitive_results.findUnique({
      where: { id: sensitive_result_id },
    });
    const rule = await this.prisma.sensitive_rules.findMany({
      where: {
        classification_template_id: result.classification_template_id,
        name: hit_rule,
      },
    });
    const level = await this.prisma.sensitive_level.findUnique({
      where: { id: rule[0].sensitive_level_id },
    });
    return level.name;
  }
  //新 恢复命中规则
  async recoveryHitRules(input: number): Promise<column_info> {
    const data = await this.prisma.column_info.findMany({
      where: { id: input },
    });
    return await this.prisma.column_info.update({
      where: { id: input },
      data: {
        hit_rule: data[0].before_hit_rule,
        sensitive_level: data[0].before_hit_level,
        revision_status: 0,
      },
    });
  }
  //获取订正记录
  async revisedrecord(
    resource: number,
    database?: string,
    hit_rule?: string,
    sensitice_level?: string,
    pagination?: { skip: number; take: number },
  ): Promise<{
    data: column_info[] | [];
    total: number;
  }> {
    const result_resource = await this.prisma.self_db.findMany({
      where: { resources_info_id: resource },
    });
    const db_id = result_resource.map((item) => item.id);
    const sen_result = await this.prisma.sensitive_results.findMany({
      where: { database_id: { in: db_id } },
    });
    const sen_result_id = sen_result.map((item) => item.id);
    if (database && hit_rule && sensitice_level) {
      const result_database = await this.prisma.self_db.findMany({
        where: { database: database },
      });
      const database_id = result_database.map((item) => item.id);
      const sensitive_results = await this.prisma.sensitive_results.findMany({
        where: { database_id: { in: database_id } },
      });
      const sensitive_results_id = sensitive_results.map((item) => item.id);
      const intersection = this.ArrayIntersection(
        sen_result_id,
        sensitive_results_id,
      );
      const column_revised = await this.prisma.column_info.findMany({
        where: {
          sensitive_results_id: { in: intersection },
          revision_status: 1,
          hit_rule: hit_rule,
          sensitive_level: sensitice_level,
        },
        skip: pagination.skip,
        take: pagination.take,
      });
      const total = await this.prisma.column_info.count({
        where: {
          sensitive_results_id: { in: sensitive_results_id },
          revision_status: 1,
          hit_rule: hit_rule,
          sensitive_level: sensitice_level,
        },
      });
      return { data: column_revised, total: total };
    } else if (hit_rule && sensitice_level) {
      const column_revised = await this.prisma.column_info.findMany({
        where: {
          sensitive_results_id: { in: sen_result_id },
          revision_status: 1,
          hit_rule: hit_rule,
          sensitive_level: sensitice_level,
        },
        skip: pagination.skip,
        take: pagination.take,
      });
      const total = await this.prisma.column_info.count({
        where: {
          sensitive_results_id: { in: sen_result_id },
          revision_status: 1,
          hit_rule: hit_rule,
          sensitive_level: sensitice_level,
        },
      });
      return { data: column_revised, total: total };
    } else if (database && hit_rule) {
      const result_database = await this.prisma.self_db.findMany({
        where: { database: database },
      });
      const database_id = result_database.map((item) => item.id);
      const sensitive_results = await this.prisma.sensitive_results.findMany({
        where: { database_id: { in: database_id } },
      });
      const sensitive_results_id = sensitive_results.map((item) => item.id);
      const intersection = this.ArrayIntersection(
        sen_result_id,
        sensitive_results_id,
      );
      const column_revised = await this.prisma.column_info.findMany({
        where: {
          sensitive_results_id: { in: intersection },
          revision_status: 1,
          hit_rule: hit_rule,
        },
        skip: pagination.skip,
        take: pagination.take,
      });
      const total = await this.prisma.column_info.count({
        where: {
          sensitive_results_id: { in: sensitive_results_id },
          revision_status: 1,
          hit_rule: hit_rule,
        },
      });
      return { data: column_revised, total: total };
    } else if (database && sensitice_level) {
      const result_database = await this.prisma.self_db.findMany({
        where: { database: database },
      });
      const database_id = result_database.map((item) => item.id);
      const sensitive_results = await this.prisma.sensitive_results.findMany({
        where: { database_id: { in: database_id } },
      });
      const sensitive_results_id = sensitive_results.map((item) => item.id);
      const intersection = this.ArrayIntersection(
        sen_result_id,
        sensitive_results_id,
      );
      const column_revised = await this.prisma.column_info.findMany({
        where: {
          sensitive_results_id: { in: intersection },
          revision_status: 1,
          sensitive_level: sensitice_level,
        },
        skip: pagination.skip,
        take: pagination.take,
      });
      const total = await this.prisma.column_info.count({
        where: {
          sensitive_results_id: { in: sensitive_results_id },
          revision_status: 1,
          sensitive_level: sensitice_level,
        },
      });
      return { data: column_revised, total: total };
    } else if (sensitice_level) {
      const column_revised = await this.prisma.column_info.findMany({
        where: {
          sensitive_results_id: { in: sen_result_id },
          revision_status: 1,
          sensitive_level: sensitice_level,
        },
        skip: pagination.skip,
        take: pagination.take,
      });
      const total = await this.prisma.column_info.count({
        where: {
          sensitive_results_id: { in: sen_result_id },
          revision_status: 1,
          sensitive_level: sensitice_level,
        },
      });
      return { data: column_revised, total: total };
    } else if (hit_rule) {
      const column_revised = await this.prisma.column_info.findMany({
        where: {
          sensitive_results_id: { in: sen_result_id },
          revision_status: 1,
          hit_rule: hit_rule,
        },
        skip: pagination.skip,
        take: pagination.take,
      });
      const total = await this.prisma.column_info.count({
        where: {
          sensitive_results_id: { in: sen_result_id },
          revision_status: 1,
          hit_rule: hit_rule,
        },
      });
      return { data: column_revised, total: total };
    } else if (database) {
      const result_database = await this.prisma.self_db.findMany({
        where: { database: database },
      });
      const database_id = result_database.map((item) => item.id);
      const sensitive_results = await this.prisma.sensitive_results.findMany({
        where: { database_id: { in: database_id } },
      });
      const sensitive_results_id = sensitive_results.map((item) => item.id);
      const intersection = this.ArrayIntersection(
        sen_result_id,
        sensitive_results_id,
      );
      const column_revised = await this.prisma.column_info.findMany({
        where: {
          sensitive_results_id: { in: intersection },
          revision_status: 1,
        },
        skip: pagination.skip,
        take: pagination.take,
      });
      const total = await this.prisma.column_info.count({
        where: {
          sensitive_results_id: { in: sensitive_results_id },
          revision_status: 1,
        },
      });
      return { data: column_revised, total: total };
    } else {
      const column_revised = await this.prisma.column_info.findMany({
        where: {
          sensitive_results_id: { in: sen_result_id },
          revision_status: 1,
        },
        skip: pagination.skip,
        take: pagination.take,
      });
      const total = await this.prisma.column_info.count({
        where: {
          sensitive_results_id: { in: sen_result_id },
          revision_status: 1,
        },
      });
      return { data: column_revised, total: total };
    }
  }
  async getSensitiveResult(id: number): Promise<SensitiveResult> {
    return await this.prisma.sensitive_results.findUnique({
      where: { id: id },
    });
  }
  async getDatabase(id: number): Promise<self_db> {
    const DBid = await this.getSensitiveResult(id);
    const id1 = DBid.database_id;
    return await this.prisma.self_db.findUnique({
      where: { id: id1 },
    });
  }
  private ArrayIntersection(a, b) {
    let ai = 0,
      bi = 0;
    const result = [];
    while (ai < a.length && bi < b.length) {
      if (a[ai] < b[bi]) {
        ai++;
      } else if (a[ai] > b[bi]) {
        bi++;
      } else {
        result.push(a[ai]);
        ai++;
        bi++;
      }
    }
    return result;
  }
}
