import { ResourceInfo, SqlInfo } from 'src/graphql.schema';

/**
 *
 *
 * @export
 * @class CreateDataAssetAuthDto
 * @implements {CreateDataAssetAuthDto}
 */
// 创建数据库信息时的数据格式
export class CreateDataAssetAuthDto implements SqlInfo {
  id?: number;
  show_count?: number;
  identify_permissions?: number;
  create_time?: string;
  update_time?: string;
  resourceInfo: ResourceInfo;
  resources_info_id: number;
  db_type: string;
  database: string;
  port: number;
  user: string;
  password: string;
  describe: string;
}
// 更新数据库信息时的数据格式
export class UpdataDataAssetAuthDto implements SqlInfo {
  resources_info_id?: number;
  db_type?: string;
  port?: number;
  database?: string;
  create_time?: string;
  update_time?: string;
  resourceInfo: ResourceInfo;
  id: number;
  identify_permissions?: number;
  show_count?: number;
  user?: string;
  password?: string;
  describe?: string;
}
