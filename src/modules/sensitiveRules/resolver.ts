import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { modelandrules, sensitive_rules } from '@prisma/client';
import {
  DeleteSensitiveRuleResult,
  ModelAndRule,
  ModelAndRules,
  SensitiveRule,
  SensitiveRuleResult,
} from 'src/graphql.schema';
import { SensitiveRuleservice } from './service';
import { CreateSensitiveRuleDto } from './dto/dto';
import { ClassificationTemplateService } from 'src/modules/classificationTemplate/service';

import { ClassTreeTools } from 'src/utils/ClassTreeTools';
import { TransferDate } from 'src/utils/TransferDate';

/**
 * 敏感规则的Resolver
 *
 * @export
 * @class SensitiveRulesResolver
 */
@Resolver('SensitiveRules')
export class SensitiveRulesResolver {
  constructor(
    private sensitiveRulesService: SensitiveRuleservice,
    private classificationTemplateService: ClassificationTemplateService,
  ) {}

  /**
   * 按id查询一条敏感规则，
   * 返回敏感规则
   * @param {number} id
   * @return {*}  {Promise<SensitiveRule>}
   * @memberof SensitiveRulesResolver
   */
  // @Query('sensitiveRule')
  // async getById(
  //   @Args('id')
  //   id: number,
  // ): Promise<SensitiveRule> {
  //   const getModel = await this.sensitiveRulesService.findById({
  //     id,
  //   });

  //   const SensitiveRule = {
  //     ...getModel,
  //     sensitiveLevelId: getModel.sensitive_level_id,
  //     recognitionModelId: getModel.recognition_model_id,
  //     sensitiveClassificationId: getModel.sensitive_classification_id,
  //     classificationTemplateId: getModel.classification_template_id,
  //     scanRange: getModel.scan_range,
  //     createTime: getModel.create_time,
  //     updateTime: getModel.update_time,
  //     attributeType: getModel.attribute_type,
  //     describe: getModel.describe,
  //   };
  //   return SensitiveRule;
  // }

  /**
   * 按id查询一条模型中间表数据，
   * 返回敏感规则
   * @param {number} sensitive_rules_id
   * @return {*}  {Promise<ModelAndRules>}
   * @memberof SensitiveRulesResolver
   */

  @Query('modelAndRules')
  async getByRuleId(
    @Args('sensitive_rules_id')
    sensitive_rules_id: number,
  ): Promise<ModelAndRules> {
    if (sensitive_rules_id) {
      const getModelAndRules = await this.sensitiveRulesService.findByRuleId({
        sensitive_rules_id,
      });
      const ModelAndRules = {
        data: getModelAndRules,
      };

      return ModelAndRules;
    }
  }

  /**
   * 按分页查询符合条件的敏感规则，
   * 返回分页指定数量及符合条件的敏感规则总数
   * @param {*} id
   * @param {*} name
   * @param {*} sensitiveLevelId
   * @param {*} recognitionModelId
   * @param {*} classificationTemplateId
   * @param {*} sensitiveClassificationId
   * @param {*} status
   * @param {*} skip
   * @param {*} take
   * @return {*}  {Promise<SensitiveRuleResult>}
   * @memberof SensitiveRulesResolver
   */
  @Query('sensitiveRules')
  async getByOutId(
    @Args('id')
    id,
    @Args('name')
    name,
    @Args('sensitiveLevelId')
    sensitiveLevelId,
    @Args('recognitionModelId')
    recognitionModelId,
    @Args('classificationTemplateId')
    classificationTemplateId,
    @Args('sensitiveClassificationId')
    sensitiveClassificationId,
    @Args('sensitiveClassificationIds')
    sensitiveClassificationIds,
    @Args('status')
    status,
    @Args('skip')
    skip,
    @Args('take')
    take,
  ): Promise<SensitiveRuleResult> {
    const getModel = await this.sensitiveRulesService.findByOutId(
      {
        id,
        name,
        sensitive_level_id: sensitiveLevelId,
        recognition_model_id: recognitionModelId,
        // classification_template_id: classificationTemplateId,
        sensitive_classification_id: sensitiveClassificationId
          ? sensitiveClassificationId
          : {
              in:
                sensitiveClassificationIds !== null
                  ? sensitiveClassificationIds
                  : undefined,
            },
        status,
      },
      { skip, take },
    );

    const sensitiveRules = getModel.data.map((item: sensitive_rules) => ({
      ...item,
      sensitiveLevelId: item.sensitive_level_id,
      recognitionModelId: item.recognition_model_id,
      sensitiveClassificationId: item.sensitive_classification_id,
      classificationTemplateId: item.classification_template_id,
      scanRange: item.scan_range,
      createTime: item.create_time,
      updateTime: item.update_time,
      attributeType: item.attribute_type,
      describe: item.describe,
    }));

    const total = getModel.total;
    const sensitiveRulesResult = {
      data: sensitiveRules,
      total,
    };
    return sensitiveRulesResult;
  }

  /**
   * 创建一个敏感规则，
   * 返回创建后的敏感规则
   * @param {CreateSensitiveRuleDto} args
   * @return {*}  {Promise<SensitiveRule>}
   * @memberof SensitiveRulesResolver
   */
  @Mutation('createSensitiveRule')
  async createOne(
    @Args('createSensitiveRuleInput')
    args: CreateSensitiveRuleDto,
  ): Promise<SensitiveRule> {
    let scanRangeT;
    if (args.scanRange) {
      scanRangeT = JSON.parse(args.scanRange.toString());
    } else {
      scanRangeT = [];
    }
    const arr = args.recognitionModelIds;

    const createOneInstance = await this.sensitiveRulesService.createOne({
      uuid: args.uuid,
      name: args.name,
      status: args.status,
      sensitive_level_id: args.sensitiveLevelId,
      recognition_model_id: args.recognitionModelId,
      sensitive_classification_id: args.sensitiveClassificationId,
      classification_template_id: args.classificationTemplateId,
      scan_range: scanRangeT,
      describe: args.describe,
      attribute_type: args.attributeType,
      create_time: TransferDate.parseISOLocal(),
      update_time: TransferDate.parseISOLocal(),
    });

    const data =
      arr &&
      arr.map((item: number) => {
        return {
          recognition_model_id: item,
          sensitive_rules_id: createOneInstance.id,
          create_time: TransferDate.parseISOLocal(),
          update_time: TransferDate.parseISOLocal(),
          is_delete: false,
        };
      });

    await this.sensitiveRulesService.createManyModelAndRules(data);

    const createResult = {
      ...createOneInstance,
      sensitiveLevelId: createOneInstance.sensitive_level_id,
      recognitionModelId: createOneInstance.recognition_model_id,
      sensitiveClassificationId: createOneInstance.sensitive_classification_id,
      classificationTemplateId: createOneInstance.classification_template_id,
      describe: createOneInstance.describe,
      attributeType: createOneInstance.attribute_type,
      scanRange: createOneInstance.scan_range,
    };

    return createResult;
  }

  /**
   * 删除指定id的敏感规则，
   * 返回删除后的敏感规则
   * @param {number} id
   * @return {*}  {Promise<SensitiveRule>}
   * @memberof SensitiveRulesResolver
   */
  @Mutation('deleteSensitiveRule')
  async deleteOne(
    @Args('id')
    id: number,
  ): Promise<DeleteSensitiveRuleResult> {
    const deleteSuccess = await this.sensitiveRulesService.deleteOne({
      id,
    });

    return { deleteSuccess };
  }

  /**
   * 更新指定id的敏感规则，
   * 返回更新后的敏感规则
   * @param {number} id
   * @param {CreateSensitiveRuleDto} data
   * @return {*}  {Promise<SensitiveRule>}
   * @memberof SensitiveRulesResolver
   */
  @Mutation('updateSensitiveRule')
  async updateOne(
    @Args('id')
    id: number,
    @Args('createSensitiveRuleInput')
    data: CreateSensitiveRuleDto,
  ): Promise<SensitiveRule> {
    let scanRangeT;
    if (data.scanRange) {
      scanRangeT = JSON.parse(data.scanRange.toString());
    } else {
      scanRangeT = [];
    }
    const updateOneInstance = await this.sensitiveRulesService.updateOne(
      {
        id,
      },
      {
        name: data.name,
        sensitive_level_id: data.sensitiveLevelId,
        recognition_model_id: data.recognitionModelId,
        sensitive_classification_id: data.sensitiveClassificationId,
        status: data.status,
        scan_range: scanRangeT,
        attribute_type: data.attributeType,
        describe: data.describe,
        update_time: TransferDate.parseISOLocal(),
      },
    );

    if (data.recognitionModelIds) {
      await this.sensitiveRulesService.deleteManyModelAndRules({
        sensitive_rules_id: id,
      });
      const arr = data.recognitionModelIds;
      const data1 =
        arr &&
        arr.map((item: number) => {
          return {
            recognition_model_id: item,
            sensitive_rules_id: id,
            create_time: TransferDate.parseISOLocal(),
            update_time: TransferDate.parseISOLocal(),
            is_delete: false,
          };
        });

      await this.sensitiveRulesService.createManyModelAndRules(data1);
    }

    return updateOneInstance;
  }
}
