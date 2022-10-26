import { Prisma } from '@prisma/client';
import { SensitiveRule } from 'src/graphql.schema';

/**
 * 创建或更新敏感规则的数据接口定义
 *
 * @export
 * @class CreateSensitiveRuleDto
 * @implements {SensitiveRule}
 */
export class CreateSensitiveRuleDto implements SensitiveRule {
  uuid: string;
  name: string;
  sensitiveLevelId: number;
  recognitionModelId: number;
  classificationTemplateId: number;
  sensitiveClassificationId: number;
  status: number;
  scanRange: Prisma.JsonNullValueInput | Prisma.InputJsonValue;
  recognitionModelIds: number[];
  attributeType: string;
  describe: string;
}
