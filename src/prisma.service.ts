import { INestApplication, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TransferDate } from './utils/TransferDate';

export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    // if (process.env.NODE_ENV && process.env.NODE_ENV === 'dev') {
    //   console.log('当前模式为开发模式，开启prisma日志');
    //   await this.$use(async (params, next) => {
    //     const before = Date.now();
    //     const result = await next(params);
    //     const after = Date.now();
    //     console.log(
    //       '\x1B[32m',
    //       '[Graphql] -',
    //       '\x1B[36m',
    //       `${new Date(before)}  `,
    //       '\x1B[32m',
    //       'Query',
    //       '\x1B[33m',
    //       `${params.model}.${params.action} `,
    //       '\x1B[32m',
    //       'took',
    //       '\x1B[33m',
    //       `${after - before}ms`,
    //     );
    //     console.log(result);
    //     return result;
    //   });
    // }
    this.$use(async (params, next) => {
      // Check incoming query type
      if (params.action == 'delete') {
        // Delete queries
        // Change action to an update
        params.action = 'update';
        params.args['data'] = {
          is_delete: true,
          update_time: TransferDate.parseISOLocal(),
        };
      }
      if (params.action == 'deleteMany') {
        // Delete many queries
        params.action = 'updateMany';
        if (params.args.data != undefined) {
          params.args.data['is_delete'] = true;
          params.args.data['update_time'] = TransferDate.parseISOLocal();
        } else {
          params.args['data'] = {
            is_delete: true,
            update_time: TransferDate.parseISOLocal(),
          };
        }
      }
      if (params.action == 'findUnique') {
        // 更改为 findFirst - 无法过滤
        // 除 ID / unique 和 findUnique 之外的任何内容
        params.action = 'findFirst';
        // 添加 'deleted' 过滤器
        // 保持 ID 过滤器
        params.args.where['is_delete'] = false;
      }
      if (params.action == 'findMany') {
        if (params.args.where != undefined) {
          if (params.args.where.is_delete == undefined) {
            // 如果未明确要求删除记录，则将其排除在外
            params.args.where['is_delete'] = false;
          }
        } else {
          params.args['where'] = { is_delete: false };
        }
      }
      if (params.action == 'update') {
        // 更改为 updateMany - 无法过滤
        // 除 ID / unique 和 findUnique 之外的任何内容
        params.action = 'updateMany';
        // 添加 'deleted' 过滤器
        // 保持 ID 过滤器
        params.args.where['is_delete'] = false;
      }
      if (params.action == 'updateMany') {
        if (params.args.where != undefined) {
          //在查询条件中增加 is_delete=false的条件：当and中没有出现is_delete,且没有and时
          if (
            params.args.where.is_delete == undefined &&
            params.args.where.AND == undefined //为了解决And删除中间键的问题
          ) {
            params.args.where['is_delete'] = false;
          }
          //当and中有值，但是isdelete为空时执行此
          if (
            params.args.where.AND !== undefined &&
            params.args.where.AND[0].is_delete == undefined
          ) {
            params.args.where['is_delete'] = false;
          }
        } else {
          params.args['where'] = { is_delete: false };
        }
      }
      if (params.action == 'count') {
        if (params.args.where != undefined) {
          if (params.args.where.is_delete == undefined) {
            // 如果未明确要求删除记录，则将其排除在外
            params.args.where['is_delete'] = false;
          }
        } else {
          params.args['where'] = { is_delete: false };
        }
      }

      return next(params);
    });
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
