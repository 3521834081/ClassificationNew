import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  Prisma,
  classification_template as classificationTemplate,
  classification,
} from '@prisma/client';
import { TransferDate } from 'src/utils/TransferDate';
import {
  SensitiveClassification,
  SensitiveRuleWithLevel,
} from 'src/graphql.schema';
import { SensitiveClassificationService } from '../sensitiveClassification/service';
import { ClassificationMidType, LevelMidType, RulesMidType } from './dto/dto';
import { Classifications } from '@ts-morph/common/lib/typescript';

/**
 * 分类模板的service
 *
 * @export
 * @class ClassificationTemplateService
 */
@Injectable()
export class ClassificationTemplateService {
  constructor(
    private prisma: PrismaService,

    private sensitiveClassificationService: SensitiveClassificationService,
  ) { }

  async getRootClassifacationByTemplateId(templateId: number) {
    const item = await this.prisma.classification.findFirst({
      where: {
        AND: [{ classification_template_id: templateId }, { parent_id: 0 }],
      },
    });
    if (!item) {
      throw new Error(
        '该模版下没有第一个分类,有可能是直接从数据库里添加的数据,',
      );
    }
    const classificationData: SensitiveClassification = {};
    classificationData.key = item.id;
    classificationData.title = item.title;
    classificationData.classification_template_id =
      item.classification_template_id;
    classificationData.depth = item.depth;
    classificationData.parentKey = item.parent_id;
    classificationData.sort = item.sort;
    const ruleObject = await this.prisma.sensitive_rules.findMany({
      where: {
        classification_template_id: templateId,
        sensitive_classification_id: item.id,
      },
    });

    const ruleObjectAndLevel: SensitiveRuleWithLevel[] = [];

    for (const item of ruleObject) {
      const level = await this.prisma.sensitive_level.findUnique({
        where: { id: item.sensitive_level_id },
      });
      ruleObjectAndLevel.push({ ...item, sensitiveLevel: level });
    }

    return { ruleObjectAndLevel, childrenClassifiction: classificationData };
  }

  async findClassificationByIds(
    templateId: number,
    classificationId: number,
  ): Promise<{
    ruleObjectAndLevel: SensitiveRuleWithLevel[];
    childrenClassifiction: SensitiveClassification[];
  }> {
    const childrenClassifiction = await this.prisma.classification.findMany({
      where: {
        AND: [
          { classification_template_id: templateId },
          { parent_id: classificationId },
        ],
      },
    });
    const data: SensitiveClassification[] = childrenClassifiction.map(
      (item: classification) => {
        const classificationData: SensitiveClassification = {};
        classificationData.key = item.id;
        classificationData.title = item.title;
        classificationData.classification_template_id =
          item.classification_template_id;
        classificationData.depth = item.depth;
        classificationData.parentKey = item.parent_id;
        classificationData.sort = item.sort;
        return classificationData;
      },
    );

    const ruleObject = await this.prisma.sensitive_rules.findMany({
      where: {
        classification_template_id: templateId,
        sensitive_classification_id: classificationId,
      },
    });

    const ruleObjectAndLevel: SensitiveRuleWithLevel[] = [];

    for (const item of ruleObject) {
      const level = await this.prisma.sensitive_level.findUnique({
        where: { id: item.sensitive_level_id },
      });
      ruleObjectAndLevel.push({ ...item, sensitiveLevel: level });
    }

    return { ruleObjectAndLevel, childrenClassifiction: data };
  }
  async copyOne(templateId: number): Promise<boolean> {
    const tagTemplate = await this.prisma.classification_template.findUnique({
      where: { id: templateId },
    });
    if (!tagTemplate) {
      throw new Error('需要被复制的模版丢失');
    }
    //复制分级，新的分级要修改时间，count 模版id type
    const tagLevel = await this.prisma.sensitive_level.findMany({
      where: { classification_template_id: templateId },
    });
    //复制分类 需要修改父类id，模版id 时间
    const tagClassification = await this.prisma.classification.findMany({
      where: { classification_template_id: templateId },
      orderBy: { depth: 'asc' },
    });
    //复制规则
    const tagRules = await this.prisma.sensitive_rules.findMany({
      where: { classification_template_id: templateId },
    });
    const tagrulesIdArr: number[] = tagRules.map((item) => item.id);
    //复制中间表

    let tagModelandrules = await this.prisma.modelandrules.findMany({
      where: { sensitive_rules_id: { in: tagrulesIdArr } },
    });

    //创建模版表
    const templateObject: Prisma.classification_templateCreateInput = {
      is_use: 0,
      name: tagTemplate.name,
      describe: tagTemplate.describe,
      create_time: TransferDate.parseISOLocal(),
      update_time: TransferDate.parseISOLocal(),
      type: 3,
      is_delete: true,
    };

    const newTemplate = await this.prisma.classification_template.create({
      data: templateObject,
    });

    if (!newTemplate.id) {
      throw new Error('复制模版失败');
    }
    //复制新的分类 用来存储每次创建完成的新的
    let newClassificationT: ClassificationMidType = {
      beforeId: 0,
      beforeParentId: 0,
      id: 0,
      parent_id: 0,
      depth: 1,
      classification_template_id: newTemplate.id,
      title: '',
      create_time: TransferDate.parseISOLocal(),
      update_time: TransferDate.parseISOLocal(),
    };
    const newClassificationMapT = new Map<number, ClassificationMidType>();
    for (const iterator of tagClassification) {
      let newClassification: Prisma.classificationCreateInput = {
        create_time: '',
        update_time: '',
        depth: 0,
      };
      //如果是模版表中的第一级元素
      if (iterator.depth === 1) {
        newClassification = {
          parent_id: 0,
          depth: 1,
          classification_template_id: newTemplate.id,
          title: iterator.title,
          create_time: TransferDate.parseISOLocal(),
          update_time: TransferDate.parseISOLocal(),
          is_delete: true,
        };
        const classificationRes = await this.prisma.classification.create({
          data: newClassification,
        });
        newClassificationT = {
          ...classificationRes,
          beforeId: iterator.id,
          beforeParentId: iterator.parent_id,
        };

        newClassificationMapT.set(iterator.id, newClassificationT);
      } else {
        const parentClassification = newClassificationMapT.get(
          iterator.parent_id,
        );

        newClassification = {
          parent_id: parentClassification.id,
          depth: iterator.depth,
          classification_template_id: newTemplate.id,
          title: iterator.title,
          create_time: TransferDate.parseISOLocal(),
          update_time: TransferDate.parseISOLocal(),
          is_delete: true,
        };
        const classificationRes = await this.prisma.classification.create({
          data: newClassification,
        });
        newClassificationT = {
          ...classificationRes,
          beforeId: iterator.id,
          beforeParentId: iterator.parent_id,
        };

        newClassificationMapT.set(iterator.id, newClassificationT);
      }
    }

    //处理新的等级，新的分级要修改时间，count 模版id type
    const newLevelMapT = new Map<number, LevelMidType>();
    let newLevelT: LevelMidType;
    for (const iterator of tagLevel) {
      let newLevel: Prisma.sensitive_levelCreateInput = {
        create_time: '',
        update_time: '',
        name: '',
        classification_template_id: 0,
      };

      newLevel = {
        name: iterator.name,
        describe: iterator.describe,
        classification_template_id: newTemplate.id,
        type: 2,
        color: iterator.color,
        count: iterator.count,
        create_time: TransferDate.parseISOLocal(),
        update_time: TransferDate.parseISOLocal(),
        is_delete: true,
      };
      const levelRes = await this.prisma.sensitive_level.create({
        data: newLevel,
      });

      newLevelT = {
        ...levelRes,
        beforeId: iterator.id,
      };

      newLevelMapT.set(iterator.id, newLevelT);
    }
    //处理规则
    const newRulesMapT = new Map<number, RulesMidType>();
    let newRulesT: RulesMidType;
    for (const iterator of tagRules) {
      let newRules: Prisma.sensitive_rulesCreateInput = {
        create_time: '',
        update_time: '',
        name: '',
        classification_template_id: 0,
        uuid: '',
        sensitive_level_id: 0,
        sensitive_classification_id: 0,
        status: 0,
      };
      // 传入的是旧的id, 得到的是新插入对象的id
      const levelObject = newLevelMapT.get(iterator.sensitive_level_id);
      const classificationObject = newClassificationMapT.get(
        iterator.sensitive_classification_id,
      );
      newRules = {
        uuid: iterator.uuid,
        name: iterator.name,
        sensitive_level_id: levelObject.id,
        recognition_model_id: iterator.recognition_model_id,
        classification_template_id: newTemplate.id,
        sensitive_classification_id: classificationObject.id,
        status: iterator.status,
        scan_range: iterator.scan_range,
        create_time: TransferDate.parseISOLocal(),
        update_time: TransferDate.parseISOLocal(),
        attribute_type: iterator.attribute_type,
        describe: iterator.describe,
        is_delete: true,
      };
      const ruleRes = await this.prisma.sensitive_rules.create({
        data: newRules,
      });

      newRulesT = {
        id: ruleRes.id,
        beforeId: iterator.id,
      };

      newRulesMapT.set(iterator.id, newRulesT);
    }
    //更新中间表

    const rulesId: number[] = [];
    tagModelandrules = tagModelandrules.map((item) => {
      const rulesT = newRulesMapT.get(item.sensitive_rules_id);
      rulesId.push(rulesT.id);
      return {
        ...item,
        id: undefined,
        sensitive_rules_id: rulesT.id,
        is_delete: true,
        update_time: TransferDate.parseISOLocal(),
        create_time: TransferDate.parseISOLocal(),
      };
    });
    await this.prisma.modelandrules.createMany({
      data: tagModelandrules,
    });

    //处理事务
    const updataTemplate = this.prisma.classification_template.updateMany({
      where: { AND: [{ is_delete: true }, { id: newTemplate.id }] },
      data: { is_delete: false },
    });

    const updataClassification = this.prisma.classification.updateMany({
      where: {
        AND: [
          { is_delete: true },
          { classification_template_id: newTemplate.id },
        ],
      },
      data: { is_delete: false },
    });
    const updataLevel = this.prisma.sensitive_level.updateMany({
      where: {
        AND: [
          { is_delete: true },
          { classification_template_id: newTemplate.id },
        ],
      },
      data: { is_delete: false },
    });
    const updataRules = this.prisma.sensitive_rules.updateMany({
      where: {
        AND: [
          { is_delete: true },
          { classification_template_id: newTemplate.id },
        ],
      },
      data: { is_delete: false },
    });
    const updataModelAndRules = this.prisma.modelandrules.updateMany({
      where: {
        AND: [{ is_delete: true }, { sensitive_rules_id: { in: rulesId } }],
      },
      data: { is_delete: false },
    });
    const translationRes = await this.prisma.$transaction([
      updataTemplate,
      updataClassification,
      updataLevel,
      updataRules,
      updataModelAndRules,
    ]);

    if (translationRes[0].count !== 0) return true;
    return false;
  }

  /**
   * 根据id查找classification_template表内记录
   *
   * @param {Prisma.classification_templateWhereUniqueInput} input
   * @return {*}  {(Promise<classificationTemplate | null>)}
   * @memberof ClassificationTemplateService
   */
  async findById(
    input: Prisma.classification_templateWhereUniqueInput,
  ): Promise<classificationTemplate | null> {
    return this.prisma.classification_template.findUnique({
      where: input,
    });
  }

  /**
   * 根据字段条件按分页查找classification_template表内记录
   *
   * @param {Prisma.classification_templateWhereInput} input
   * @param {{ skip: number; take: number }} [pagination]
   * @return {*}  {(Promise<{ data: classificationTemplate[] | null; total: number }>)}
   * @memberof ClassificationTemplateService
   */
  async findMany(
    input?: Prisma.classification_templateWhereInput,
    pagination?: { skip: number; take: number },
  ): Promise<{ data: classificationTemplate[] | null; total: number }> {
    let data;
    if (pagination) {
      data = await this.prisma.classification_template.findMany({
        where: input,
        orderBy: [{ is_use: 'desc' }, { update_time: 'desc' }],
        skip: pagination.skip,
        take: pagination.take,
      });
    } else {
      data = await this.prisma.classification_template.findMany({
        where: input,
        orderBy: [{ is_use: 'desc' }, { update_time: 'desc' }],
      });
    }
    const total = await this.prisma.classification_template.count({
      where: input,
    });
    return { data, total };
  }

  async createOne(
    data: Prisma.classification_templateCreateInput,
  ): Promise<classificationTemplate> {
    //当该模版要启用时，其余的模版要关闭
    if (data.is_use === 1) {
      await this.prisma.classification_template.updateMany({
        where: { is_use: 1 },
        data: { is_use: 0 },
      });
    }

    const createTemplate = await this.prisma.classification_template.create({
      data,
    });

    // 当创建模版成功时,创建以下内容
    let transactionRes;

    if (createTemplate.id) {
      const classificationRoot: Prisma.classificationCreateInput = {
        depth: 1,
        parent_id: 0,
        title: '全部分类',
        classification_template_id: createTemplate.id,
        create_time: TransferDate.parseISOLocal(),
        update_time: TransferDate.parseISOLocal(),
      };
      const createLevelRoot: Prisma.sensitive_levelCreateInput = {
        name: 'N/A',
        count: 0,
        color: '#D8D8D8',
        classification_template_id: createTemplate.id,
        create_time: TransferDate.parseISOLocal(),
        update_time: TransferDate.parseISOLocal(),
        type: 3,
        describe: '未命中',
      };
      const createClassification = this.prisma.classification.create({
        data: classificationRoot,
      });

      const createLevel = this.prisma.sensitive_level.create({
        data: createLevelRoot,
      });
      transactionRes = await this.prisma.$transaction([
        createClassification,
        createLevel,
      ]);
    }

    //事务处理： 当级别跟分类没成功
    if (transactionRes[0].count !== 0) {
      return createTemplate;
    } else {
      //当下边失败的时候，把上边创建的值给删除了
      this.prisma.classification_template.delete({
        where: { id: createTemplate.id },
      });

      throw new Error('创建分类失败');
    }
  }
  async judgeFlag(
    input: Prisma.recognition_modelWhereUniqueInput,
  ): Promise<boolean> {
    const flag = await this.prisma.classification_template.findUnique({
      where: input,
    });
    if (flag.type === 1) {
      return false;
    } else {
      return true;
    }
  }
  async deleteOne(
    input: Prisma.classification_templateWhereUniqueInput,
  ): Promise<boolean> {
    //得到根分类
    const classificationInRoot = await this.prisma.classification.findFirst({
      where: { AND: [{ classification_template_id: input.id }, { depth: 1 }] },
    });

    //删除模板
    const deleteTemplate = this.prisma.classification_template.delete({
      where: input,
    });

    //删除分级
    const deleteLevel = this.prisma.sensitive_level.deleteMany({
      where: { classification_template_id: input.id },
    });
    const transactionRes = await this.prisma.$transaction([
      deleteTemplate,
      deleteLevel,
    ]);

    const isDeleteTemplate = transactionRes[0] as unknown as { count };

    // 事务的另一种处理方式,删除分类,及其下的规则
    if (isDeleteTemplate.count === 1) {
      const deleteClassificationAndRules =
        await this.sensitiveClassificationService.deleteById(
          classificationInRoot.id,
          input.id,
        );
      if (deleteClassificationAndRules) {
        return true;
      } else {
        return false;
      }
    } else {
      throw new Error('删除模版失败,请检查该id');
    }
  }

  /**
   * 更新classification_template表内指定条件的一条记录
   *
   * @param {Prisma.classification_templateWhereUniqueInput} input
   * @param {Prisma.classification_templateUpdateInput} data
   * @return {*}  {Promise<classificationTemplate>}
   * @memberof ClassificationTemplateService
   */
  async updateOne(
    input: Prisma.classification_templateWhereUniqueInput,
    data: Prisma.classification_templateUpdateInput,
  ): Promise<classificationTemplate> {
    // 将其他状态置为0
    const classificationTemplate =
      await this.prisma.classification_template.findUnique({ where: input });
    if (data.is_use === 1 && classificationTemplate.is_use !== 1) {
      // console.log('我更新了其他状态');
      await this.prisma.classification_template.updateMany({
        where: { is_use: 1 },
        data: { is_use: 0 },
      });
      // 只更新启用属性is_use不更新其他内容
      const updataAfterTemplateCount =
        await this.prisma.classification_template.update({
          where: input,
          data: {
            is_use: 1,
          },
        });
      if (updataAfterTemplateCount['count']) {
        const updataAfterTemplate =
          await this.prisma.classification_template.findUnique({
            where: input,
          });
        return updataAfterTemplate;
      } else throw new Error('启用失败');
    } else if (this.judgeFlag) {
      const updataAfterTemplateCount =
        await this.prisma.classification_template.update({
          where: input,
          data,
        });
      // console.log(updataAfterTemplateCount);

      if (updataAfterTemplateCount['count']) {
        const updataAfterTemplate =
          await this.prisma.classification_template.findUnique({
            where: input,
          });
        return updataAfterTemplate;
      }
      throw new Error('更新失败');
    } else {
      throw new Error('不能更新内置模板数据');
    }
  }
}
