import { Prisma } from '@prisma/client';
import { RecognitionModel } from 'src/graphql.schema';

export class CreateRecognitionModelDto implements RecognitionModel {
  /**
   * 创建或更新识别模型的数据接口定义
   *
   * @type {string}
   * @memberof CreateRecognitionModelDto
   */
  id: number;
  name: string;
  type: number;
  rule: Prisma.JsonNullValueInput | Prisma.InputJsonValue;
  describe: string;
  create_time: Date;
  update_time: Date;
  is_delete: boolean;
}
