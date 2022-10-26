import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Prisma, resources_info, self_db } from '@prisma/client';
import {
  CreateManySqlCount,
  IsMysqlTureResult,
  SqlInfo,
  SqlInfoResult,
  UpdataManySqlCount,
} from 'src/graphql.schema';
import { ServerResourceResolver } from 'src/server-resource/server-resource.resolver';
import { TransferDate } from 'src/utils/TransferDate';
import { CreateDataAssetAuthDto, UpdataDataAssetAuthDto } from './dto/dto';

import { DataAssetAuthorizationService } from './service';

import { ResultDataUtILS } from 'src/utils/ResultData';
import MysqlUntil from 'src/utils/MysqlUtil';
/**
 * 数据资产授权的Resolver
 *
 * @export
 * @class DataAssetAuthorizationResolver
 */
@Resolver('dataAssetAuthorization')
export class DataAssetAuthorizationResolver {
  //全局变量,存储get内容

  dbUntil;
  error: any;
  prisma: any;

  // 将server服务注入进来
  constructor(
    private dataAssetAuthService: DataAssetAuthorizationService,
    private serverResourceResolver: ServerResourceResolver,
  ) {
    this.dbUntil = new MysqlUntil();
  }

  @Query('getMysqlIsTure')
  async getMysqlIsTure(
    @Args('resources_info_id')
    resources_info_id,
    @Args('port')
    port,
    @Args('user')
    user,
    @Args('database')
    database,
    @Args('password')
    password,
  ): Promise<IsMysqlTureResult> {
    //  得到服务器信息跟ip
    const resourceInfo = this.serverResourceResolver.getById(resources_info_id);

    // 传入到mysql登陆工具中判断
    const sql = 'SELECT 1';
    const MysqlLoginData = await this.dbUntil.MysqlUtilLogin(
      (
        await resourceInfo
      ).instance,
      port,
      user,
      password,
      database,
      sql,
    );

    if (MysqlLoginData[0]) {
      return ResultDataUtILS.ok();
    } else {
      return ResultDataUtILS.error(false, 20001, MysqlLoginData[1].sqlMessage);
    }
  }
  async getMysqlIs(
    @Args('instance')
    instance,
    @Args('port')
    port,
    @Args('user')
    user,
    @Args('database')
    database,
    @Args('password')
    password,
  ): Promise<IsMysqlTureResult> {
    // 传入到mysql登陆工具中判断
    const sql = 'SELECT 1';
    const MysqlLoginData = await this.dbUntil.MysqlUtilLogin(
      instance,
      port,
      user,
      password,
      database,
      sql,
    );

    return MysqlLoginData[0];
  }

  @Mutation('deleteSqlInfo')
  async deleteOne(
    @Args('id')
    id: number,
  ): Promise<SqlInfo> {
    const deleteOneInstance = await this.dataAssetAuthService.findById(id);
    const deleteOneInstanceCount = await this.dataAssetAuthService.deleteOne({
      id,
    });

    const deleteResult: SqlInfo = {
      ...deleteOneInstance,
      create_time: deleteOneInstance.create_time.toDateString(),
      update_time: deleteOneInstance.update_time.toDateString(),
      scan_time: deleteOneInstance.scan_time,
      resourceInfo: undefined,
    };
    return deleteResult;
  }
  /**
   * 查询所有的数据库条件
   * @param id
   * @param skip
   * @param take
   * @param resources_info_id  服务器实例id
   * @param db_type   数据库类型
   * @param identify_permissions  数据库时间
   * @returns
   */
  @Query('sqlInfos')
  async getSqlInfosByOriginzd(
    @Args('id') id?,
    @Args('skip')
    skip?,
    @Args('take')
    take?,
    @Args('region')
    region?,
    @Args('resources_info_id')
    resources_info_id?,
    @Args('db_type')
    db_type?,
    @Args('identify_permissions')
    identify_permissions?,
  ): Promise<SqlInfoResult> {
    let dataModel: { data; total };
    //当有区域筛选的时候 &&resources_info_id为空的时候
    if (region && !resources_info_id) {
      dataModel = await this.dataAssetAuthService.getResourcesInfoId(
        { id, db_type, identify_permissions },
        { skip, take },
        region,
      );
    } else {
      dataModel = await this.dataAssetAuthService.getSqlInfosByOriginzd(
        { id, resources_info_id, db_type, identify_permissions },
        { skip, take },
      );
    }

    const sqlInfos = dataModel.data.map((item) => {
      const resourceInfo = this.serverResourceResolver.getById(
        item.resources_info_id,
      );

      return {
        ...item,
        resourceInfo: resourceInfo,
        mysqlIsTure: resourceInfo.then((res) => {
          return this.getMysqlIs(
            res.instance,
            item.port,
            item.user,
            item.database,
            item.password,
          );
        }),
      };
    });
    //  遍历sqlInfos,得到相同的数据库id的放在一块,
    // 使用Map key存储id,value存数据库的数量
    const mysqlMap = new Map();

    const total = dataModel.total;

    const SqlInfoResult = {
      data: sqlInfos,
      total,
    };
    return SqlInfoResult;
  }
  @Query('sqlInfosNoDb')
  async getsqlInfosNoDbByOriginzd(
    @Args('id') id?,
    @Args('skip')
    skip?,
    @Args('take')
    take?,
    @Args('resources_info_id')
    resources_info_id?,
    @Args('db_type')
    db_type?,
    @Args('identify_permissions')
    identify_permissions?,
  ): Promise<SqlInfoResult> {
    const dataModel = await this.dataAssetAuthService.getSqlInfosByOriginzd(
      { id, resources_info_id, db_type, identify_permissions },
      { skip, take },
    );

    const sqlInfos = dataModel.data.map((item) => {
      const resourceInfo = this.serverResourceResolver.getById(
        item.resources_info_id,
      );

      return {
        ...item,
        resourceInfo: resourceInfo,
      };
    });
    //  遍历sqlInfos,得到相同的数据库id的放在一块,
    // 使用Map key存储id,value存数据库的数量
    const mysqlMap = new Map();

    const total = dataModel.total;

    const SqlInfoResult = {
      data: sqlInfos,
      total,
    };
    return SqlInfoResult;
  }
  /**
   * 添加一条或者多条数据
   * @param createSqlInfoInputs
   * @returns
   */
  @Mutation('createSqlInfos')
  async createSqlInfosOrOne(
    @Args('createSqlInfoInputs')
    createSqlInfoInputs: CreateDataAssetAuthDto[],
  ): Promise<CreateManySqlCount> {
    const data: Prisma.self_dbCreateInput[] =
      createSqlInfoInputs &&
      createSqlInfoInputs.map((item) => {
        return {
          ...item,
          show_count: 0, //默认展示为0
          identify_permissions: 0, //默认识别权限为0
          create_time: TransferDate.parseISOLocal(),
          update_time: TransferDate.parseISOLocal(),
        };
      });

    const createManyNumber = await this.dataAssetAuthService.createMany(data);

    return createManyNumber;
  }

  /**
   *  更新一条或者多条数据
   * @param updateSqlInfoInputs
   * @returns
   */
  @Mutation('updateSqlInfos')
  async updateSqlInfos(
    @Args('updateSqlInfoInputs')
    updateSqlInfoInputs: UpdataDataAssetAuthDto[],
  ): Promise<UpdataManySqlCount> {
    //当传入的内容为多条时,执行的方法

    updateSqlInfoInputs.forEach(async (element) => {
      const updateOneInstance = await this.dataAssetAuthService.updateOne(
        {
          id: element.id,
        },
        {
          ...element,
          update_time: TransferDate.parseISOLocal(),
        },
      );
    });

    return { count: updateSqlInfoInputs.length };
  }

  /**获取已授权数据库 */
  @Query('getAuthorizedDb')
  async getAuthorizedDb(
    @Args('resources_info_id') resources_info_id: number,
  ): Promise<{ data: self_db[] | []; total: number }> {
    return await this.dataAssetAuthService.getAuthorizedDb(resources_info_id);
  }
}
