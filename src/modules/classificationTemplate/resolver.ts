import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
// import { classification_template as classificationTemplate } from '@prisma/client';
import {
  ClassificationTemplatesResult,
  ClassificationTemplate,
  DeleteClassificationTemplateResult,
  CopyClassificationTemplateResult,
  ClassificationAndRulesResult,
} from 'src/graphql.schema';
import { ClassificationTemplateService } from './service';
import { CreateClassificationTemplateDto } from './dto/dto';
import { ClassTreeTools } from 'src/utils/ClassTreeTools';
import { TransferDate } from 'src/utils/TransferDate';
import { title } from 'process';

/**
 * 分类模板的Resolver
 *
 * @export
 * @class ClassificationTemplateResolver
 */
@Resolver('ClassificationTemplate')
export class ClassificationTemplateResolver {
  constructor(
    private classificationTemplateService: ClassificationTemplateService,
  ) { }

  @Query('findIsUseClassification')
  async findIsUseClassification(): Promise<ClassificationTemplate> {
    const classification = await this.classificationTemplateService.findMany({
      is_use: 1,
    });
    return classification.data[0];
  }
  /**
   *
   * @param templateId 想要查询的模版id
   * @param classificationId 点击的那个节点的长度
   * @returns 返回当前节点下的
   */

  @Query('findClassificationByIds')
  async findClassificationByIds(
    @Args('templateId')
    templateId: number,
    @Args('classificationId')
    classificationId: number,
  ): Promise<ClassificationAndRulesResult> {
    //由于classificationId并非从0开始约定如果为0进行的操作
    if (classificationId !== 0) {
      const res =
        await this.classificationTemplateService.findClassificationByIds(
          templateId,
          classificationId,
        );
      return {
        classifications: res.childrenClassifiction,
        rules: res.ruleObjectAndLevel,
      };
    } else {
      const res =
        await this.classificationTemplateService.getRootClassifacationByTemplateId(
          templateId,
        );
      return {
        classifications: [res.childrenClassifiction],
        rules: res.ruleObjectAndLevel,
      };
    }
  }
  @Mutation('copyClassificationTemplate')
  async copyClassificationTemplate(
    @Args('templateId')
    templateId,
  ): Promise<CopyClassificationTemplateResult> {
    const isCopySuccess = await this.classificationTemplateService.copyOne(
      templateId,
    );
    return { isSuccess: isCopySuccess };
  }
  /**
   * 按id查询一条分类模板，
   * 返回分类模板
   * @param {number} id
   * @return {*}  {Promise<ClassificationTemplate>}
   * @memberof ClassificationTemplateResolver
   */
  @Query('classificationTemplate')
  async getById(
    @Args('id')
    id: number,
  ): Promise<ClassificationTemplate> {
    const getClassificationTemplate =
      await this.classificationTemplateService.findById({ id });
    const classificationTemplate = {
      ...getClassificationTemplate,

      isUse: getClassificationTemplate.is_use,
      createTime: getClassificationTemplate.create_time,
      updateTime: getClassificationTemplate.update_time,
    };
    return classificationTemplate;
  }

  /**
   * 按分页查询所有模板，
   * 返回分页指定数量及所有模板总数
   * @param {number} [skip] 跳过记录数
   * @param {number} [take] 获取记录数
   * @return {*}  {Promise<ClassificationTemplatesResult>}
   * @memberof ClassificationTemplateResolver
   */
  @Query('allClassificationTemplates')
  async getAll(
    @Args('skip')
    skip?: number,
    @Args('take')
    take?: number,
  ): Promise<ClassificationTemplatesResult> {
    const getClassificationTemplate =
      await this.classificationTemplateService.findMany({}, { skip, take });

    const total = getClassificationTemplate.total;
    const classificationTemplatesResult = getClassificationTemplate;
    return classificationTemplatesResult;
  }

  /**
   * 按分页查询符合条件的模板，
   * 返回分页指定数量及符合条件的模板总数
   * @param {number} id
   * @param {number} type
   * @param {string} name
   * @param {string} describe
   * @param {number} [skip]
   * @param {number} [take]
   * @return {*}  {Promise<ClassificationTemplatesResult>}
   * @memberof ClassificationTemplateResolver
   */
  @Query('classificationTemplates')
  async getMany(
    @Args('id')
    id: number,
    @Args('type')
    type: number,
    @Args('name')
    name: string,
    @Args('describe')
    describe: string,
    @Args('skip')
    skip?: number,
    @Args('take')
    take?: number,
  ): Promise<ClassificationTemplatesResult> {
    const getClassificationTemplate =
      await this.classificationTemplateService.findMany(
        {
          id,
          type,
          name,
          describe,
        },
        { skip, take },
      );
    const classificationTemplates = getClassificationTemplate.data.map(
      (item) => ({
        ...item,
        createTime: item.create_time,
        updateTime: item.update_time,
      }),
    );
    const total = getClassificationTemplate.total;
    const classificationTemplatesResult = {
      data: classificationTemplates,
      total,
    };
    return classificationTemplatesResult;
  }

  /**
   * 创新一个新的模版,伴随着会建立分类跟分级
   * @param args
   * @returns
   */
  @Mutation('createClassificationTemplate')
  async create(
    @Args('createClassificationTemplateInput')
    args: CreateClassificationTemplateDto,
  ): Promise<ClassificationTemplate> {
    // console.log(args);
    const createclassificationTemplate =
      await this.classificationTemplateService.createOne({
        name: args.name,
        describe: args.describe,
        type: args.type,
        is_use: args.isUse,
        create_time: TransferDate.parseISOLocal(),
        update_time: TransferDate.parseISOLocal(),
      });
    return createclassificationTemplate;
  }

  /**
   * 删除指定模版
   * @param id
   * @returns 返回是否删除成功
   */
  @Mutation('deleteClassificationTemplate')
  async deleteOne(
    @Args('id')
    id: number,
  ): Promise<DeleteClassificationTemplateResult> {
    const isDeleteTemplate = await this.classificationTemplateService.deleteOne(
      {
        id,
      },
    );
    return { isSuccess: isDeleteTemplate };
  }
  /**
   *  更新模版
   * @param id
   * @param data
   * @returns
   */
  @Mutation('updateClassificationTemplate')
  async updateOne(
    @Args('id')
    id: number,
    @Args('updateClassificationTemplateInput')
    data: CreateClassificationTemplateDto,
  ): Promise<ClassificationTemplate> {
    // console.log(id, data);

    const createSensitive = await this.classificationTemplateService.updateOne(
      {
        id,
      },
      {
        name: data.name,
        describe: data.describe,
        is_use: data.isUse,
        update_time: TransferDate.parseISOLocal(),
      },
    );

    return createSensitive;
  }
}
