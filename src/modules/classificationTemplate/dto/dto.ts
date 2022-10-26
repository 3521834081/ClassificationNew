import { Prisma, sensitive_level } from '@prisma/client';
import { ClassificationTemplate } from 'src/graphql.schema';
/**
 * 创建或更新分类模板的数据接口定义
 * @export
 * @class CreateClassificationTemplateDto
 * @implements {ClassificationTemplate}
 * @param type: number;
 * @param isUse: number;
 * @param name: string;
 * @param describe: string;
 * @param content: Prisma.JsonNullValueInput | Prisma.InputJsonValue;
 * @param createTime: number;
 */
export class CreateClassificationTemplateDto implements ClassificationTemplate {
  type: number;
  isUse: number;
  name: string;
  describe: string;
}
// 记录分类的中间值:
export interface ClassificationMidType {
  beforeId: number;
  beforeParentId: number;
  id: number;
  parent_id: number;
  depth: number;
  classification_template_id: number;
  title: string;
  create_time: Date;
  update_time: Date;
}
//记录等级的中间值
export interface LevelMidType {
  beforeId: number;
  id: number;
  name: string;
  classification_template_id: number;
  create_time: Date;
  update_time: Date;
  color: string;
  count: number;
  describe: string;
  type: number;
}
// 记录规则的中间值
export interface RulesMidType {
  id: number;
  beforeId: number;
}
