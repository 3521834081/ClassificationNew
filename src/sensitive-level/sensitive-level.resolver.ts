import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { sensitive_level as SensitiveLevel1 } from '@prisma/client';
import { SensitiveLevel, SensitiveLevelResult } from 'src/graphql.schema';
import { SensitiveLevelService } from './sensitive-level.service';
import { createSensitiveLevelDto } from './dto/create-sensitive-level.dto';
import { ClassificationTemplateService } from 'src/modules/classificationTemplate/service';
import { TransferDate } from 'src/utils/TransferDate';
import { SensitiveRuleservice } from 'src/modules/sensitiveRules/service';

@Resolver('SensitiveLevel')
export class SensitiveLevelResolver {
  constructor(
    private sensitiveService: SensitiveLevelService,
    private classificationTemplateService: ClassificationTemplateService,
    private sensitiveRulesService: SensitiveRuleservice,
  ) { }

  @Query('sensitiveLevel')
  async getSensitiveLevelById(
    @Args('id')
    id: number,
  ) {
    return this.sensitiveService.findSensitiveLevelById({ id });
  }

  // 前端目前查的是所有的，而不是正在使用的，改一下接口
  @Query('allSensitiveLevel')
  async getAllSensitiveLevel(): Promise<SensitiveLevel1[]> {
    return this.sensitiveService.findAllSensitiveLevel();
  }

  @Query('allSensitiveLevelOnUse')
  async getAllSensitiveLevelOnUse(
    @Args('skip') skip: number,
    @Args('take') take: number,
  ): Promise<SensitiveLevelResult> {
    const template = await this.classificationTemplateService.findMany({
      is_use: 1,
    });
    const onUseId = template.data[0].id;
    const onUseName = template.data[0].name;
    const onUseType = template.data[0].type;
    const data1 = await this.sensitiveService.findSensitiveLevelByOnUse(
      {
        classification_template_id: onUseId,
      },
      {
        skip: skip,
        take: take,
      },
    );
    const data: any[] = data1.data.map(async (item) => {
      const count = this.sensitiveRulesService.findLevelQuoteCount(
        item.id,
        onUseId,
      );
      return {
        ...item,
        count: count,
        isUse: this.sensitiveService.findIsUse(item.id),
      };
    });
    return {
      data: data,
      total: data1.total,
      onUseName: onUseName,
      onUseId: onUseId,
      onUseType: onUseType,
    };
  }

  @Mutation('createSensitiveLevel')
  async create(
    @Args('createSensitiveLevelInput')
    args: createSensitiveLevelDto,
  ): Promise<SensitiveLevel1> {
    const template = await this.classificationTemplateService.findMany({
      is_use: 1,
    });
    const onUseId = template.data[0].id;
    const type = template.data[0].type;
    const sensitive_levels =
      await this.sensitiveService.findSensitiveLevelByOnUse({
        classification_template_id: onUseId,
      });
    const total = sensitive_levels.total;
    const data = sensitive_levels.data;
    // 判断敏感等级是否超过10个
    if (total > 10) {
      throw new Error('敏感等级最高设置10级');
    }
    // console.log(total);
    // 判断是否创建重复的敏感等级
    data.map((item) => {
      if (item.name === args.name) {
        throw new Error('不能创建相同的级别名称');
      }
    });
    const createSensitive = await this.sensitiveService.createSensitiveLevel({
      ...args,
      type: type,
      create_time: TransferDate.parseISOLocal(),
      update_time: TransferDate.parseISOLocal(),
    });
    return createSensitive;
  }

  @Mutation('deleteSensitiveLevel')
  async deleteLevel(@Args('id') args: number): Promise<SensitiveLevel> {
    return await this.sensitiveService.deleteSensitiveLevel({
      id: args,
    });
  }

  @Mutation('updateSensitiveLevel')
  async updateLevel(
    @Args('id') id: number,
    @Args('describe') describe: string,
  ): Promise<SensitiveLevel1> {
    const data = await this.sensitiveService.updateSensitiveLevel(id, describe);
    return data;
  }
}
