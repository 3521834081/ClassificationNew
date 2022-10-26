import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
// import { Prisma } from '@prisma/client';
import {
  CreatManyPayload,
  DeleteSensitiveClassificationResult,
  RulePathResult,
  SensitiveClassification,
  SensitiveClassificationResultNoTotal,
  // SensitiveClassificationResult,
} from 'src/graphql.schema';
import { SensitiveRuleservice } from '../sensitiveRules/service';
// import { CreatSensitiveClassificationDto } from './dto/dto';

import { classification, Prisma } from '@prisma/client';
import { SensitiveClassificationService } from './service';

/**
 * 敏感模型的Resolver
 *
 * @export
 * @class SensitiveClassificationResolver
 */
@Resolver('sensitiveClassification')
export class SensitiveClassificationResolver {
  constructor(
    private sensitiveClassificationService: SensitiveClassificationService,
  ) { }

  @Query('getRulePath')
  async getRulePath(
    @Args('ruleId')
    ruleId,
  ): Promise<RulePathResult> {
    const res = await this.sensitiveClassificationService.findRulePath(ruleId);
    const rulePathResult: RulePathResult = {
      PathIds: res.pathIdArr,
      PathNames: res.pathName,
    };
    return rulePathResult;
  }

  /**
   * 根据当前分类的id删除,该分类下的子分类以及所有的规则
   * @param id ：当前分类id
   * @returns
   */
  @Mutation('deleteSensitiveClassification')
  async deleteSensitiveClassification(
    @Args('key')
    id: number,
  ): Promise<DeleteSensitiveClassificationResult> {
    const deleteSuccess = await this.sensitiveClassificationService.deleteById(
      id,
    );
    return { deleteSuccess };
  }

  /**
   *创建多个敏感分类
   * @param parentKey  分类父级id
   * @param title  分类名称
   * @returns
   */
  @Mutation('createSensitiveClassifications')
  async createSensitiveClassifications(
    @Args('CreateSensitiveClassificationInputs')
    inputs,
  ): Promise<CreatManyPayload> {
    const count = this.sensitiveClassificationService.createManys(inputs);
    return count;
  }
  /**
   *创建单个敏感分类
   * @param parentKey  分类父级id
   * @param title  分类名称
   * @returns
   */
  @Mutation('createSensitiveClassification')
  async createSensitiveClassification(
    @Args('parentKey')
    parentKey,
    @Args('title')
    title,
  ): Promise<SensitiveClassification> {
    return this.sensitiveClassificationService.createOne({ parentKey, title });
  }
  /**
   * 更新分类名称
   * @param id 分类的id
   * @param title 分类的名称
   * @returns
   */
  @Mutation('updateSensitiveClassification')
  async updateOne(
    @Args('key')
    id: number,
    @Args('title')
    title: string,
  ): Promise<SensitiveClassification> {
    const result = await this.sensitiveClassificationService.updataOne({
      id,
      title,
    });
    // console.log('result', result);

    const data: SensitiveClassification = {
      key: result.id,
      parentKey: result.parent_id,
      sort: result.sort,
      depth: result.depth,
      title: result.title,
      classification_template_id: result.classification_template_id,
    };
    // console.log('data', data);
    return data;
  }
  /**
   *根据模版id得到所有的分类数据
   * @param id :模版的id
   * @returns
   */
  @Query('sensitiveClassification')
  async getByClassificationId(): Promise<SensitiveClassificationResultNoTotal> {
    const sensitiveClassification =
      await this.sensitiveClassificationService.findByTemplateIsUse();

    const data: SensitiveClassification[] = sensitiveClassification.map(
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

    return { data };
  }

  /**
   * 按key查询指定id分类模板下的敏感分类，
   * 返回敏感分类
   * @param {number} id
   * @param {string} key
   * @return {*}  {Promise<SensitiveClassification>}
   * @memberof SensitiveClassificationResolver
   */
  // 旧版
  // @Query('sensitiveClassification')
  // async getByKey(
  //   @Args('classificationTemplateId')
  //   id: number,
  //   @Args('key')
  //   key: string,
  // ): Promise<SensitiveClassification> {
  //   const getClassificationTemplate =
  //     await this.classificationTemplateService.findById({
  //       id,
  //     });
  //   const getResult = ClassTreeTools.findNode(
  //     getClassificationTemplate.content,
  //     (element) => {
  //       if (element['key']) {
  //         return element['key'] === key;
  //       }
  //       return false;
  //     },
  //   );
  //   return getResult as SensitiveClassification;
  // }

  /**
   * 在指定id的分类模板下创建一个敏感分类，
   * 返回创建后变化了的分类模板
   * @param {number} id
   * @param {CreatSensitiveClassificationDto} sensitiveClassificationData
   * @return {*}  {Promise<SensitiveClassification>}
   * @memberof SensitiveClassificationResolver
   */
  // 旧版，在指定id的分类模板下创建一个敏感分类，后可删除
  // @Mutation('createSensitiveClassification')
  // async creatone(
  //   @Args('classificationTemplateId')
  //   id: number,
  //   @Args('createSensitiveClassificationInput')
  //   sensitiveClassificationData: CreatSensitiveClassificationDto,
  // ): Promise<SensitiveClassification> {
  //   const getClassificationTemplate =
  //     await this.classificationTemplateService.findById({
  //       id,
  //     });
  //   if (
  //     sensitiveClassificationData.children !== undefined &&
  //     (sensitiveClassificationData.children as any[]).length === 0
  //   ) {
  //     delete sensitiveClassificationData.children;
  //   }
  //   const getNewJson = ClassTreeTools.dealWithNode(
  //     getClassificationTemplate.content,
  //     (element) => {
  //       if (element['key'] === sensitiveClassificationData.parentKey) {
  //         if (!element['children']) {
  //           element['children'] = [];
  //         }
  //         (element['children'] as any[]).push(sensitiveClassificationData);
  //       }
  //       return element;
  //     },
  //   );
  //   await this.classificationTemplateService.updateOne(
  //     {
  //       id,
  //     },
  //     { content: getNewJson },
  //   );
  //   return getNewJson as SensitiveClassification;
  // }

  /**
   * 在指定id的分类模板下更新一个敏感分类，
   * 返回更新后变化了的分类模板
   * @param {number} id
   * @param {CreatSensitiveClassificationDto} sensitiveClassificationData
   * @return {*}  {Promise<SensitiveClassification>}
   * @memberof SensitiveClassificationResolver
   */
  // 旧版，在指定id的分类下更新一个敏感分类，后可删除
  // @Mutation('updateSensitiveClassification')
  // async updateOne(
  //   @Args('classificationTemplateId')
  //   id: number,
  //   @Args('createSensitiveClassificationInput')
  //   sensitiveClassificationData: CreatSensitiveClassificationDto,
  // ): Promise<SensitiveClassification> {
  //   const getClassificationTemplate =
  //     await this.classificationTemplateService.findById({
  //       id,
  //     });
  //   const getNewJson = ClassTreeTools.dealWithNode(
  //     getClassificationTemplate.content,
  //     (element) => {
  //       if (element['key'] === sensitiveClassificationData.key) {
  //         if (sensitiveClassificationData.categoryLevel) {
  //           element['categoryLevel'] =
  //             sensitiveClassificationData.categoryLevel;
  //         }
  //         // if (sensitiveClassificationData.key) {
  //         //   element['key'] = sensitiveClassificationData.key;
  //         // }
  //         // if (sensitiveClassificationData.parentKey) {
  //         //   element['parentKey'] = sensitiveClassificationData.parentKey;
  //         // }
  //         if (sensitiveClassificationData.title) {
  //           element['title'] = sensitiveClassificationData.title;
  //         }
  //       }
  //       return element;
  //     },
  //   );
  //   await this.classificationTemplateService.updateOne(
  //     {
  //       id,
  //     },
  //     { content: getNewJson },
  //   );
  //   return getNewJson as SensitiveClassification;
  // }

  // /**
  //  * 在指定id的分类模板下删除一个敏感分类，
  //  * 返回是否可删除和分类模板
  //  * @param {number} id
  //  * @param {string} key
  //  * @param {string} parentKey
  //  * @return {*}  {Promise<{ deleteSuccess: number; data: SensitiveClassification }>}
  //  * @memberof SensitiveClassificationResolver
  //  */
  // // 旧版，在指定id的分类模板下删除一个敏感分类，后可删除
  // // @Mutation('deleteSensitiveClassification')
  // async deleteOne(
  //   @Args('classificationTemplateId')
  //   id: number,
  //   @Args('key')
  //   key: string,
  //   @Args('parentKey')
  //   parentKey: string,
  // ): Promise<{ deleteSuccess: number; data: SensitiveClassification }> {
  //   const getClassificationTemplate =
  //     await this.classificationTemplateService.findById({
  //       id,
  //     });
  //   let deleteSuccess = 0;
  //   const getNewJson = ClassTreeTools.dealWithNode(
  //     getClassificationTemplate.content,
  //     (element) => {
  //       if (element['key'] === parentKey) {
  //         const target = (element['children'] as any[]).find(
  //           (item) => item['key'] === key,
  //         );
  //         if (target) {
  //           if (
  //             !target.hasOwnProperty('children') ||
  //             (target['children'] as any[]).length === 0
  //           ) {
  //             deleteSuccess = 1;
  //             element['children'] = (element['children'] as any[]).filter(
  //               (item) => item['key'] !== key,
  //             );
  //             if ((element['children'] as any[]).length === 0) {
  //               delete (
  //                 element as {
  //                   key: string;
  //                   title: string;
  //                   parentKey: string;
  //                   categoryLevel: number;
  //                   children: any[];
  //                 }
  //               ).children;
  //             }
  //           }
  //         }
  //       }
  //       return element;
  //     },
  //   );
  //   await this.classificationTemplateService.updateOne(
  //     {
  //       id,
  //     },
  //     { content: getNewJson },
  //   );
  //   return { deleteSuccess, data: getNewJson as SensitiveClassification };
  // }
}
