import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RecognitionModelService } from './service';
import { CreateRecognitionModelDto } from './dto/dto';
import { RecognitionModel, RecognitionModelResult } from 'src/graphql.schema';

/**
 * 识别模型的Resolver
 *
 * @export
 * @class RecognitionModelResolver
 */
@Resolver('RecognitionModel')
export class RecognitionModelResolver {
  constructor(private recognitionModelService: RecognitionModelService) { }

  /**
   * 按id查询一条识别模型，
   * 返回识别模型
   * @param {number} id
   * @return {*}  {Promise<RecognitionModel>}
   * @memberof RecognitionModelResolver
   */
  @Query('recognitionModel')
  async getById(
    @Args('id')
    id: number,
  ): Promise<RecognitionModel> {
    const getRecognitionModel = await this.recognitionModelService.findById({
      id,
    });
    const recognitionModel = {
      ...getRecognitionModel,
      createTime: getRecognitionModel.create_time,
      updateTime: getRecognitionModel.update_time,
    };
    return recognitionModel;
  }

  /**
   * 按分页查询符合条件的识别模型，
   * 返回分页指定数量及符合条件的识别模型总数
   * @param {*} id
   * @param {*} name
   * @param {*} classificationTemplateId
   * @param {*} type
   * @param {*} sensitiveLevelId
   * @param {*} rule
   * @param {*} describe
   * @param {*} skip
   * @param {*} take
   * @return {*}  {Promise<RecognitionModelResult>}
   * @memberof RecognitionModelResolver
   */
  @Query('recognitionModels')
  async getByOutId(
    @Args('id')
    id,
    @Args('name')
    name,
    @Args('classificationTemplateId')
    classificationTemplateId,
    @Args('type')
    type,
    @Args('sensitiveLevelId')
    sensitiveLevelId,
    @Args('rule')
    rule,
    @Args('describe')
    describe,
    @Args('skip')
    skip,
    @Args('take')
    take,
  ): Promise<RecognitionModelResult> {
    const getModel = await this.recognitionModelService.findByOutId(
      {
        id,
        name,
        type,
        rule,
        describe,
      },
      { skip, take },
    );
    const recognitionModels = getModel.data.map((item) => {
      let rule;
      if (item.type === 0) {
        rule = [{ content: '', condition: 0 }];
      } else {
        rule = item.rule;
      }
      return {
        ...item,
        rule: rule,
        sensitiveLevelId: item.sensitive_level_id,
        recognitionModelId: item.recognition_model_id,
        sensitiveClassificationId: item.sensitive_classification_id,
        scanRange: item.scan_range,
      };
    });
    const total = getModel.total;
    const recognitionModelsResult = {
      data: recognitionModels,
      total,
    };
    return recognitionModelsResult;
  }

  /**
   * 创建一个识别模型，
   * 返回创建后的识别模型
   * @param {CreateRecognitionModelDto} args
   * @return {*}  {Promise<RecognitionModel>}
   * @memberof RecognitionModelResolver
   */
  @Mutation('createRecognitionModel')
  async createOne(
    @Args('createRecognitionModelInput')
    args: CreateRecognitionModelDto,
  ): Promise<RecognitionModel> {
    const createOneInstance = await this.recognitionModelService.createOne({
      name: args.name,
      type: args.type,
      describe: args.describe,
      rule: args.rule,
      create_time: new Date(),
      update_time: new Date(),
    });
    return createOneInstance;
  }

  /**
   * 删除指定id的识别模型，
   * 返回删除后的识别模型
   * @param {number} id
   * @return {*}  {Promise<RecognitionModel>}
   * @memberof RecognitionModelResolver
   */
  @Mutation('deleteRecognitionModel')
  async deleteOne(
    @Args('id')
    id: number,
  ): Promise<RecognitionModel> {
    const deleteOneInstance = await this.recognitionModelService.deleteOne({
      id,
    });
    await this.recognitionModelService.deleteModelAndRules(id);
    return deleteOneInstance;
  }

  /**
   * 更新指定id的识别模型，
   * 返回更新后的识别模型
   * @param {number} id
   * @param {CreateRecognitionModelDto} data
   * @return {*}  {Promise<RecognitionModel>}
   * @memberof RecognitionModelResolver
   */
  @Mutation('updateRecognitionModel')
  async updateOne(
    @Args('id')
    id: number,
    @Args('updateRecognitionModelInput')
    data: CreateRecognitionModelDto,
  ): Promise<RecognitionModel> {
    // console.log(data);
    const updateOneOneInstance = await this.recognitionModelService.updateOne(
      { id },
      data,
    );
    return updateOneOneInstance;
  }
}
