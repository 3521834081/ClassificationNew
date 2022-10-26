import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  modelandrules,
  Prisma,
  recognition_model as recognitionModel,
} from '@prisma/client';
import { idText } from '@ts-morph/common/lib/typescript';

/**
 * 识别模型的service
 *
 * @export
 * @class RecognitionModelService
 */
@Injectable()
export class RecognitionModelService {
  constructor(private prisma: PrismaService) { }

  /**
   * 根据id查找recognition_model表内记录
   *
   * @param {Prisma.recognition_modelWhereUniqueInput} input
   * @return {*}  {(Promise<recognitionModel | null>)}
   * @memberof RecognitionModelService
   */
  async findById(
    input: Prisma.recognition_modelWhereUniqueInput,
  ): Promise<recognitionModel | null> {
    return await this.prisma.recognition_model.findUnique({
      where: input,
    });
  }

  /**
   * 根据字段条件按分页查找recognition_model表内记录
   *
   * @param {Prisma.recognition_modelWhereInput} input
   * @param {{ skip: number; take: number }} [pagination]
   * @return {*}  {(Promise<{ data: recognitionModel[] | []; total: number }>)}
   * @memberof RecognitionModelService
   */
  async findByOutId(
    input: Prisma.recognition_modelWhereInput,
    pagination?: { skip: number; take: number },
  ): Promise<{ data: recognitionModel[] | []; total: number }> {
    const data = await this.prisma.recognition_model.findMany({
      where: input,
      skip: pagination.skip,
      take: pagination.take,
    });
    const total = await this.prisma.recognition_model.count({
      where: input,
    });
    return { data, total };
  }

  /**
   * 在recognition_model表内插入一条记录
   *
   * @param {Prisma.recognition_modelCreateInput} data
   * @return {*}  {Promise<recognitionModel>}
   * @memberof RecognitionModelService
   */
  async createOne(
    data: Prisma.recognition_modelCreateInput,
  ): Promise<recognitionModel> {
    return await this.prisma.recognition_model.create({
      data,
    });
  }

  /**
   * 删除recognition_model表内指定条件的一条记录
   *
   * @param {Prisma.recognition_modelWhereUniqueInput} input
   * @return {*} {Promise<recognitionModel>}
   * @memberof RecognitionModelService
   */
  async deleteOne(
    input: Prisma.recognition_modelWhereUniqueInput,
  ): Promise<recognitionModel> {
    return await this.prisma.recognition_model.delete({
      where: input,
    });
  }

  async deleteModelAndRules(
    recognition_model_id: number,
  ): Promise<modelandrules> {
    const data = await this.prisma.modelandrules.deleteMany({
      where: {
        recognition_model_id: { in: recognition_model_id },
      },
    });
    return null;
  }

  /**
   * 更新recognition_model表内指定条件的一条记录
   *
   * @param {Prisma.recognition_modelWhereUniqueInput} input
   * @param {Prisma.recognition_modelUpdateInput} data
   * @return {*} {Promise<recognitionModel>}
   * @memberof RecognitionModelService
   */
  async updateOne(
    input: Prisma.recognition_modelWhereUniqueInput,
    data1: Prisma.recognition_modelUpdateInput,
  ): Promise<recognitionModel> {
    // console.log(data1);
    return await this.prisma.recognition_model.update({
      where: input,
      data: data1,
    });
  }
}
