import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  Prisma,
  sensitive_rules as sensitiveRules,
  modelandrules as modelAndRules,
  modelandrules,
} from '@prisma/client';
import { CreateManyModelAndRulesCount } from 'src/graphql.schema';

/**
 * 敏感规则的service
 *
 * @export
 * @class SensitiveRuleservice
 */
@Injectable()
export class SensitiveRuleservice {
  constructor(private prisma: PrismaService) { }

  /**
   * 根据id查找sensitive_rules表内记录
   *
   * @param {Prisma.sensitive_rulesWhereUniqueInput} input
   * @return {*}  {(Promise<sensitiveRules | null>)}
   * @memberof SensitiveRuleservice
   */
  async findById(
    input: Prisma.sensitive_rulesWhereUniqueInput,
  ): Promise<sensitiveRules | null> {
    return await this.prisma.sensitive_rules.findUnique({
      where: input,
    });
  }

  /**
   * 根据sensitive_rules_id查找modelandrules表内记录
   *
   * @param {Prisma.modelandrulesWhereUniqueInput} input
   * @return {*}  {(Promise<modelAndRules | null>)}
   * @memberof SensitiveRuleservice
   */

  async findByRuleId(
    input: Prisma.modelandrulesWhereInput,
  ): Promise<modelandrules[]> {
    return await this.prisma.modelandrules.findMany({
      where: input,
    });
  }

  /**
   * 根据字段条件按分页查找sensitive_rules表内记录
   *
   * @param {Prisma.sensitive_rulesWhereInput} input
   * @param {{ skip: number; take: number }} [pagination]
   * @return {*}  {(Promise<{ data: sensitiveRules[] | []; total: number }>)}
   * @memberof SensitiveRuleservice
   */
  async findByOutId(
    input: Prisma.sensitive_rulesWhereInput,
    pagination?: { skip: number; take: number },
  ): Promise<{ data: sensitiveRules[] | []; total: number }> {
    const classificationTemplate =
      await this.prisma.classification_template.findFirst({
        where: {
          is_use: 1,
        },
      });
    const data = await this.prisma.sensitive_rules.findMany({
      where: {
        id: input.id,
        name: input.name,
        sensitive_level_id: input.sensitive_level_id,
        recognition_model_id: input.recognition_model_id,
        classification_template_id: classificationTemplate.id,
        sensitive_classification_id: input.sensitive_classification_id,
        status: input.status,
      },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: [
        {
          id: 'desc',
        },
      ],
    });
    const total = await this.prisma.sensitive_rules.count({
      where: input,
    });
    return { data, total };
  }

  async findLevelQuoteCount(
    levelId: number,
    classification_template_id: number,
  ): Promise<number> {
    const count = await this.prisma.sensitive_rules.count({
      where: {
        sensitive_level_id: levelId,
        classification_template_id: classification_template_id,
      },
    });
    const data = await this.prisma.sensitive_rules.findMany({
      where: {
        sensitive_level_id: levelId,
        classification_template_id: classification_template_id,
      },
    });
    return count;
  }

  /**
   * 在sensitive_rules表内插入一条记录
   *
   * @param {Prisma.sensitive_rulesCreateInput} data
   * @return {*}  {Promise<sensitiveRules>}
   * @memberof SensitiveRuleservice
   */
  async createOne(
    data: Prisma.sensitive_rulesCreateInput,
  ): Promise<sensitiveRules> {
    const classificationTemplate =
      await this.prisma.classification_template.findFirst({
        where: {
          is_use: 1,
        },
      });

    const createRules = await this.prisma.sensitive_rules.create({
      data: {
        uuid: data.uuid,
        name: data.name,
        status: data.status,
        sensitive_level_id: data.sensitive_level_id,
        recognition_model_id: data.recognition_model_id,
        sensitive_classification_id: data.sensitive_classification_id,
        classification_template_id: classificationTemplate.id,
        scan_range: data.scan_range,
        describe: data.describe,
        attribute_type: data.attribute_type,
        create_time: data.create_time,
        update_time: data.update_time,
      },
    });
    return createRules;
  }
  /**
   * 在ModelAndRules表内插入记录，用于关联识别模型和识别规则
   *
   * @param {Prisma.modelandrulesCreateInput} data
   * @memberof SensitiveRuleservice
   */
  async createManyModelAndRules(
    data: Prisma.modelandrulesCreateInput[],
  ): Promise<CreateManyModelAndRulesCount> {
    return await this.prisma.modelandrules.createMany({
      data: data,
    });
  }

  /**
   * 在sensitive_rules表内插入多条记录，返回插入数量
   *
   * @param {Prisma.sensitive_rulesCreateInput[]} data
   * @return {*}  {Promise<Prisma.BatchPayload>}
   * @memberof SensitiveRuleservice
   */

  /**
   * 删除sensitive_rules表内指定条件的一条记录
   *
   * @param {Prisma.sensitive_rulesWhereUniqueInput} input
   * @return {*}  {Promise<sensitiveRules>}
   * @memberof SensitiveRuleservice
   */
  async deleteOne(
    input: Prisma.sensitive_rulesWhereUniqueInput,
  ): Promise<boolean> {
    const deleteSuccess = true;
    const deleteRules = this.prisma.sensitive_rules.delete({
      where: input,
    });
    const deleteModelAndRules = this.prisma.modelandrules.deleteMany({
      where: {
        sensitive_rules_id: input.id,
      },
    });
    this.prisma.$transaction([deleteRules, deleteModelAndRules]);
    return deleteSuccess;
  }

  /**
   * 删除ModelAndRules表内指定条件的多条记录
   *
   * @param {Prisma.modelandrulesWhereInput} input
   * @return {*}  {Promise<Prisma.BatchPayload>}
   * @memberof SensitiveRuleservice
   */

  async deleteManyModelAndRules(
    input: Prisma.modelandrulesWhereInput,
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.modelandrules.deleteMany({
      where: input,
    });
  }

  /**
   * 更新sensitive_rules表内指定条件的一条记录
   *
   * @param {Prisma.sensitive_rulesWhereUniqueInput} input
   * @param {Prisma.sensitive_rulesUpdateInput} data
   * @return {*}  {Promise<sensitiveRules>}
   * @memberof SensitiveRuleservice
   */
  async updateOne(
    input: Prisma.sensitive_rulesWhereUniqueInput,
    data: Prisma.sensitive_rulesUpdateInput,
  ): Promise<sensitiveRules> {
    return await this.prisma.sensitive_rules.update({
      where: input,
      data,
    });
  }

  /**
   * 更新sensitive_rules表内指定条件的多条记录
   *
   * @param {Prisma.sensitive_rulesWhereInput} input
   * @param {Prisma.sensitive_rulesUpdateInput[]} data
   * @return {*}  {Promise<Prisma.BatchPayload>}
   * @memberof SensitiveRuleservice
   */
  async updateMany(
    input: Prisma.sensitive_rulesWhereInput,
    data: Prisma.sensitive_rulesUpdateInput[],
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.sensitive_rules.updateMany({
      where: input,
      data,
    });
  }
}
