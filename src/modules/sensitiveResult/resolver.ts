import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { column_info } from '@prisma/client';
import {
  ColumnInfoResult,
  RevisedRecordResult,
  SensitiveResultModel,
} from 'src/graphql.schema';
import { ServerResourceService } from 'src/server-resource/server-resource.service';
import { DataAssetAuthorizationResolver } from '../dataAssetAuthorization/resolver';
import { DataAssetAuthorizationService } from '../dataAssetAuthorization/service';
import { SensitiveResultService } from './service';

@Resolver('SensitiveResult')
export class SensitiveResultResolver {
  constructor(
    private sensitiveResultService: SensitiveResultService,
    private dataAssetAuthorizationResolver: DataAssetAuthorizationResolver,
    private serverResourceService: ServerResourceService,
    private dataAssetAuthorizationService: DataAssetAuthorizationService,
  ) {}
  @Query('sensitiveResult')
  async getAll(
    @Args('tableName')
    table_name,
    @Args('region')
    region,
    @Args('instance')
    instance,
    @Args('hitData')
    hit_data,
    @Args('starttime')
    starttime,
    @Args('endtime')
    endtime,
    @Args('skip')
    skip,
    @Args('take')
    take,
  ): Promise<SensitiveResultModel> {
    const resource_info = await this.serverResourceService.findByOutId({
      region,
      instance,
    });
    const resource_info_id = resource_info.data.map((item) => item.id);
    const self_db =
      await this.dataAssetAuthorizationService.findByResourceInfoId(
        resource_info_id,
      );
    const database_id = self_db.data.map((item) => item.id);

    const dataModel = await this.sensitiveResultService.findSensitiveResult(
      { table_name, hit_data, starttime, endtime },
      database_id,
      { skip, take },
    );
    const sensitiveResult = dataModel.data.map((item) => ({
      ...item,
      sqlInfoResult: this.dataAssetAuthorizationResolver.getSqlInfosByOriginzd(
        item.database_id,
      ),
    }));
    const total = dataModel.total;
    const Result = {
      data: sensitiveResult,
      total,
    };
    return Result;
  }
  //新 列详情搜索
  @Query('columnInfo')
  async getColumnInfo(
    @Args('sensitive_result_id') sensitive_result_id: number,
    @Args('skip')
    skip,
    @Args('take')
    take,
  ): Promise<ColumnInfoResult> {
    const result = await this.sensitiveResultService.getColumnInfo(
      sensitive_result_id,
      {
        skip,
        take,
      },
    );
    return result;
  }
  //新 订正命中规则
  @Mutation('RevisionHitRules')
  async revisionHitRules(
    @Args('sensitive_result_id') sensitive_result_id,
    @Args('column_id') column_id,
    @Args('hit_rule') hit_rule,
  ): Promise<column_info> {
    const sensitive_level = await this.sensitiveResultService.selectLevel(
      sensitive_result_id,
      hit_rule,
    );
    return await this.sensitiveResultService.revisionHitRules(
      sensitive_result_id,
      column_id,
      hit_rule,
      sensitive_level,
    );
  }
  @Mutation('RecoveryHitRules')
  async recoveryHitRules(@Args('id') id): Promise<column_info> {
    return await this.sensitiveResultService.recoveryHitRules(id);
  }
  //订正记录表
  @Query('revisedRecord')
  async getRevisedRecord(
    @Args('resource') resource,
    @Args('database') database,
    @Args('hit_rule') hit_rule,
    @Args('sensitive_level') sensitive_level,
    @Args('skip') skip?,
    @Args('take') take?,
  ): Promise<RevisedRecordResult> {
    const column = await this.sensitiveResultService.revisedrecord(
      resource,
      database,
      hit_rule,
      sensitive_level,
      {
        skip,
        take,
      },
    );
    const data = column.data.map((item) => ({
      ...item,
      sensitiveResult: this.sensitiveResultService.getSensitiveResult(
        item.sensitive_results_id,
      ),
      database: this.sensitiveResultService.getDatabase(
        item.sensitive_results_id,
      ),
    }));
    return { data: data, total: column.total };
  }
}
