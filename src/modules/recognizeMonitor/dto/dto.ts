import { Prisma, recognition_model, sensitive_level } from '@prisma/client';

// service轮询查询状态返回的结果
export class scanStateService {
  id?: number;
  scan_state?: number;
}
//定义数据库返回的固定内容
export interface dbReturnData {
  code: number;
  msg: string;
  data?: any;
  column?: any;
}
// 列在redis中存储
type columnInInRedis = {
  lengthOfColumn: number;
  columnTitles: any[];
};
//定义缓存中每个表所带有的属性

export interface tableDataInRedis {
  code: number;
  msg: string;
  data?: any;
  column?: columnInInRedis;
  rowLength: number;
}

//符合条件的敏感规则,带model对象跟level
export interface RulesInScan {
  attribute_type: string;
  id?: number;
  uuid?: string;
  name: string;
  sensitive_level_id: number;
  recognition_model_id: number;
  classification_template_id: number;
  sensitive_classification_id: string;
  status: number;
  scan_range: Prisma.JsonValue;
  models?: recognition_model[];
  create_time: Date;
  update_time: Date;
  level?: sensitive_level;
}
//数据库连接的相关信息
export interface sqlLoginInfo {
  instance?: string;
  db_type?: string;
  port?: number;
  user?: string;
  database?: string;
  password?: string;
  describe?: string;
  resources_info_id?: number;
  show_count?: number;
  id?: number; //database_id
}

// 扫描规则接口
export interface ScanRangeType {
  assetTypes: number; //扫描类型：对数据库扫描 对oss扫描
  matchingConditions: MatchingConditiosType[] | [];
}
/**
 * 扫描规则
 */
export interface MatchingConditiosType {
  object: number; //扫描对象，数据库，表，列等
  content: string; //规则
  condition: number; //匹配方法 ：相等 前置匹配等等
}
