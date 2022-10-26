import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DbSensitiveResultModel, SensitiveResult } from 'src/graphql.schema';
import { ServerResourceService } from 'src/server-resource/server-resource.service';
import { DataAssetAuthorizationResolver } from '../dataAssetAuthorization/resolver';
import { DataAssetAuthorizationService } from '../dataAssetAuthorization/service';
import { SensitiveResultService } from '../sensitiveResult/service';
import { DbSensitiveResultService } from './service';

@Resolver('DbSensitiveResult')
export class DbSensitiveResultResolver {
  constructor(
    private dbSensitiveResultService: DbSensitiveResultService,
    private dataAssetAuthorizationResolver: DataAssetAuthorizationResolver,
    private serverResourceService: ServerResourceService,
    private dataAssetAuthorizationService: DataAssetAuthorizationService,
    private sensitiveResultService: SensitiveResultService,
  ) { }
  @Query('dbSensitiveResult')
  async getAll(
    @Args('region')
    region?,
    @Args('instance')
    instance?,
    @Args('db_type')
    db_type?,
    @Args('starttime')
    starttime?,
    @Args('endtime')
    endtime?,
    @Args('skip')
    skip?,
    @Args('take')
    take?,
  ): Promise<DbSensitiveResultModel> {
    const resource_info = await this.serverResourceService.findByOutId(
      { region, instance },
      { skip, take },
    );
    const resource_info_id = resource_info.data.map((item) => item.id);
    const self_db1 =
      await this.dataAssetAuthorizationService.findByResourceInfoId(
        resource_info_id,
      );
    const self_db2 = await this.dataAssetAuthorizationService.findByDbType(
      db_type,
    );
    const self_db_id1 = self_db1.data.map((item) => item.id);
    const self_db_id2 = self_db2.data.map((item) => item.id);
    const intersection = (nums1, nums2) => {
      const arr = [];
      for (let i = 0; i < nums1.length; i++) {
        for (let j = 0; j < nums2.length; j++) {
          if (nums1[i] === nums2[j]) {
            arr.push(nums1[i]);
          }
        }
      }
      return [...new Set(arr)];
    };
    if ((region || instance) && db_type) {
      const self_db_id = intersection(self_db_id1, self_db_id2);
      const dataModel =
        await this.dbSensitiveResultService.findDbSensitiveResult(
          { skip, take },
          { starttime, endtime },
          self_db_id,
        );
      const sensitiveResult = dataModel.data.map((item) => ({
        ...item,
        sqlInfoResult:
          this.dataAssetAuthorizationResolver.getSqlInfosByOriginzd(
            item.self_db_id,
            item.skip,
            item.take,
          ),
      }));
      const total = dataModel.total;
      const Result = {
        data: sensitiveResult,
        total,
      };
      return Result;
    } else if (region || instance) {
      const dataModel =
        await this.dbSensitiveResultService.findDbSensitiveResult(
          { skip, take },
          { starttime, endtime },
          self_db_id1,
        );
      const sensitiveResult = dataModel.data.map((item) => ({
        ...item,
        sqlInfoResult:
          this.dataAssetAuthorizationResolver.getSqlInfosByOriginzd(
            item.self_db_id,
            item.skip,
            item.take,
          ),
      }));
      const total = dataModel.total;
      const Result = {
        data: sensitiveResult,
        total,
      };
      return Result;
    } else if (db_type) {
      const dataModel =
        await this.dbSensitiveResultService.findDbSensitiveResult(
          { skip, take },
          { starttime, endtime },
          self_db_id2,
        );
      const sensitiveResult = dataModel.data.map((item) => ({
        ...item,
        sqlInfoResult:
          this.dataAssetAuthorizationResolver.getSqlInfosByOriginzd(
            item.self_db_id,
            item.skip,
            item.take,
          ),
      }));
      const total = dataModel.total;
      const Result = {
        data: sensitiveResult,
        total,
      };
      return Result;
    } else {
      const dataModel =
        await this.dbSensitiveResultService.findDbSensitiveResult(
          { skip, take },
          { starttime, endtime },
        );

      const sensitiveResult = dataModel.data.map((item) => ({
        ...item,
        sqlInfoResult:
          this.dataAssetAuthorizationResolver.getSqlInfosByOriginzd(
            item.self_db_id,
            item.skip,
            item.take,
          ),
      }));
      const total = dataModel.total;
      const Result = {
        data: sensitiveResult,
        total,
      };
      return Result;
    }
  }
  @Query('tablesDetail')
  async getTablesDetail(
    @Args('database_id') database_id: number,
    @Args('skip') skip,
    @Args('take') take,
    @Args('table_name') table_name?: string,
    @Args('sensitive_level') sensitive_level?,
    @Args('hit_rule') hit_rule?,
  ): Promise<{ data: SensitiveResult[] | []; arr: number[]; total: number }> {
    const dataModel = await this.sensitiveResultService.getTablesDetail(
      database_id,
      table_name,
      { skip, take },
    );
    // console.log(dataModel);
    // const column = await this.sensitiveResultService.getColumnInfo(
    //   dataModel.data[0].id,
    // );
    // const column_info = [];
    // console.log('shuchu' + dataModel.data);
    // console.log(column);
    const data = [];
    let x = 0;
    if (hit_rule && sensitive_level) {
      const a: number[] = [];
      const arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (let i = 0; i < dataModel.data.length; i++) {
        const column = await this.sensitiveResultService.getColumnInfo(
          dataModel.data[i].id,
        );
        for (let j = 0; j < column.data.length; j++) {
          if (
            column.data[j].hit_rule == hit_rule &&
            column.data[j].sensitive_level == sensitive_level
          ) {
            data[x] = dataModel.data[i];
            x++;
            break;
          }
        }
        if (dataModel.data.length === 0) {
          break;
        } else {
          for (let l = 0; l < column.data.length; l++) {
            switch (column.data[l].sensitive_level) {
              case 'N/A': {
                a.push(0);
                break;
              }
              case 'S1': {
                a.push(1);
                break;
              }
              case 'S2': {
                a.push(2);
                break;
              }
              case 'S3': {
                a.push(3);
                break;
              }
              case 'S4': {
                a.push(4);
                break;
              }
              case 'S5': {
                a.push(5);
                break;
              }
              case 'S6': {
                a.push(6);
                break;
              }
              case 'S7': {
                a.push(7);
                break;
              }
              case 'S8': {
                a.push(8);
                break;
              }
              case 'S9': {
                a.push(9);
                break;
              }
              case 'S10': {
                a.push(10);
                break;
              }
            }
          }
          arr[Math.max(...a)]++;
          a.splice(0);
        }
      }
      // for (let i = 0; i < dataModel.data.length; i++) {
      //   for (let j = 0; j < column_info[i].length; j++) {
      //     if (
      //       column_info[i][j].hit_rule == hit_rule &&
      //       column_info[i][j].sensitive_level == sensitive_level
      //     ) {
      //       data[x] = dataModel.data[i];
      //       x++;
      //       break;
      //     }
      //   }
      // }
      const total = data.length;
      return { data, arr, total };
    } else if (hit_rule) {
      const a: number[] = [];
      const arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      for (let i = 0; i < dataModel.data.length; i++) {
        const column = await this.sensitiveResultService.getColumnInfo(
          dataModel.data[i].id,
        );
        if (i == 2) {
          console.log('22222222222222');
        }
        for (let j = 0; j < column.data.length; j++) {
          if (column.data[j].hit_rule == hit_rule) {
            data[x] = dataModel.data[i];
            x++;
            break;
          }
        }
        if (dataModel.data.length === 0) {
          break;
        } else {
          for (let l = 0; l < column.data.length; l++) {
            switch (column.data[l].sensitive_level) {
              case 'N/A': {
                a.push(0);
                break;
              }
              case 'S1': {
                a.push(1);
                break;
              }
              case 'S2': {
                a.push(2);
                break;
              }
              case 'S3': {
                a.push(3);
                break;
              }
              case 'S4': {
                a.push(4);
                break;
              }
              case 'S5': {
                a.push(5);
                break;
              }
              case 'S6': {
                a.push(6);
                break;
              }
              case 'S7': {
                a.push(7);
                break;
              }
              case 'S8': {
                a.push(8);
                break;
              }
              case 'S9': {
                a.push(9);
                break;
              }
              case 'S10': {
                a.push(10);
                break;
              }
            }
          }
          arr[Math.max(...a)]++;
          a.splice(0);
        }
      }
      // for (let i = 0; i < dataModel.data.length; i++) {
      //   for (let j = 0; j < column_info[i].length; j++) {
      //     console.log(column_info[i][j]);
      //     if (column_info[i][j].hit_rule == hit_rule) {
      //       data[x] = dataModel.data[i];
      //       x++;
      //       break;
      //     }
      //   }
      // }
      const total = data.length;
      // console.log(data);
      return { data, arr, total };
    } else if (sensitive_level) {
      // for (let i = 0; i < dataModel.data.length; i++) {
      //   for (let j = 0; j < column_info[i].length; j++) {
      //     if (column_info[i][j].sensitive_level == sensitive_level) {
      //       data[x] = dataModel.data[i];
      //       x++;
      //       break;
      //     }
      //   }
      // }
      const a: number[] = [];
      const arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (let i = 0; i < dataModel.data.length; i++) {
        const column = await this.sensitiveResultService.getColumnInfo(
          dataModel.data[i].id,
        );
        for (let j = 0; j < column.data.length; j++) {
          if (column.data[j].sensitive_level == sensitive_level) {
            data[x] = dataModel.data[i];
            x++;
            break;
          }
        }
        if (dataModel.data.length === 0) {
          break;
        } else {
          for (let l = 0; l < column.data.length; l++) {
            switch (column.data[l].sensitive_level) {
              case 'N/A': {
                a.push(0);
                break;
              }
              case 'S1': {
                a.push(1);
                break;
              }
              case 'S2': {
                a.push(2);
                break;
              }
              case 'S3': {
                a.push(3);
                break;
              }
              case 'S4': {
                a.push(4);
                break;
              }
              case 'S5': {
                a.push(5);
                break;
              }
              case 'S6': {
                a.push(6);
                break;
              }
              case 'S7': {
                a.push(7);
                break;
              }
              case 'S8': {
                a.push(8);
                break;
              }
              case 'S9': {
                a.push(9);
                break;
              }
              case 'S10': {
                a.push(10);
                break;
              }
            }
          }
          arr[Math.max(...a)]++;
          a.splice(0);
        }
      }
      const total = data.length;
      return { data, arr, total };
    } else {
      const a: number[] = [];
      const arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (let i = 0; i < dataModel.data.length; i++) {
        const column = await this.sensitiveResultService.getColumnInfo(
          dataModel.data[i].id,
        );
        if (dataModel.data.length === 0) {
          break;
        } else {
          for (let l = 0; l < column.data.length; l++) {
            switch (column.data[l].sensitive_level) {
              case 'N/A': {
                a.push(0);
                break;
              }
              case 'S1': {
                a.push(1);
                break;
              }
              case 'S2': {
                a.push(2);
                break;
              }
              case 'S3': {
                a.push(3);
                break;
              }
              case 'S4': {
                a.push(4);
                break;
              }
              case 'S5': {
                a.push(5);
                break;
              }
              case 'S6': {
                a.push(6);
                break;
              }
              case 'S7': {
                a.push(7);
                break;
              }
              case 'S8': {
                a.push(8);
                break;
              }
              case 'S9': {
                a.push(9);
                break;
              }
              case 'S10': {
                a.push(10);
                break;
              }
            }
            // if (column.data[l].sensitive_level === 'N/A') {
            //   a.push(0);
            // } else if (column.data[l].sensitive_level === 'S1') {
            //   a.push(1);
            // } else if (column.data[l].sensitive_level === 'S2') {
            //   a.push(2);
            // } else if (column.data[l].sensitive_level === 'S3') {
            //   a.push(3);
            // } else if (column.data[l].sensitive_level === 'S4') {
            //   a.push(4);
            // } else if (column.data[l].sensitive_level === 'S5') {
            //   a.push(5);
            // } else if (column.data[l].sensitive_level === 'S6') {
            //   a.push(6);
            // } else if (column.data[l].sensitive_level === 'S7') {
            //   a.push(7);
            // } else if (column.data[l].sensitive_level === 'S8') {
            //   a.push(8);
            // } else if (column.data[l].sensitive_level === 'S9') {
            //   a.push(9);
            // } else if (column.data[l].sensitive_level === 'S10') {
            //   a.push(10);
            // }
          }
          arr[Math.max(...a)]++;
          a.splice(0);
        }
      }
      return { data: dataModel.data, arr, total: dataModel.total };
      // return { data: dataModel.data, arr, total: dataModel.total };
    }
  }
}
//   @Query('tablesDetail')
//   async getTablesDetail(
//     @Args('database_id') database_id: number,
//     @Args('skip') skip,
//     @Args('take') take,
//     @Args('table_name') table_name?: string,
//     @Args('sensitive_level') sensitive_level?,
//     @Args('hit_rule') hit_rule?,
//   ): Promise<{ data: sensitive_results[] | []; total: number }> {
//     const dataModel = await this.sensitiveResultService.getTablesDetail(
//       database_id,
//       table_name,
//       { skip, take },
//     );
//     const column_info = dataModel.data.map((item) => item.column_info);
//     console.log(column_info);
//     console.log(column_info[0]);
//     const data = [];
//     let x = 0;
//     if (hit_rule && sensitive_level) {
//       for (let i = 0; i < dataModel.data.length; i++) {
//         for (let j = 0; j < column_info[i].length; j++) {
//           if (
//             column_info[i][j].hit_rule == hit_rule &&
//             column_info[i][j].sensitive_level == sensitive_level
//           ) {
//             data[x] = dataModel.data[i];
//             x++;
//             break;
//           }
//         }
//       }
//       const total = data.length;
//       return { data, total };
//     } else if (hit_rule) {
//       for (let i = 0; i < dataModel.data.length; i++) {
//         for (let j = 0; j < column_info[i].length; j++) {
//           console.log(column_info[i][j]);
//           if (column_info[i][j].hit_rule == hit_rule) {
//             data[x] = dataModel.data[i];
//             x++;
//             break;
//           }
//         }
//       }
//       console.log(data);
//       const total = data.length;
//       return { data, total };
//     } else if (sensitive_level) {
//       for (let i = 0; i < dataModel.data.length; i++) {
//         for (let j = 0; j < column_info[i].length; j++) {
//           if (column_info[i][j].sensitive_level == sensitive_level) {
//             data[x] = dataModel.data[i];
//             x++;
//             break;
//           }
//         }
//       }
//       const total = data.length;
//       return { data, total };
//     } else {
//       return dataModel;
//     }
//   }
//   @Query('columnDetail')
//   async getColumnDetail(
//     @Args('database_id') database_id,
//     @Args('table_name') table_name,
//     @Args('skip') skip,
//     @Args('take') take,
//   ): Promise<{ data: Column[] | []; total: number }> {
//     const dataModel = await this.sensitiveResultService.getTablesDetail(
//       database_id,
//       table_name,
//     );
//     const column_info = dataModel.data.map((item) => item.column_info);
//     if (skip && take) {
//       const column: Column[] = column_info[0];
//       const column1: Column[] = [];
//       let x = 0;
//       for (let i = 0; i < column.length; i++) {
//         if (i >= skip && i < skip + take) {
//           column1[x] = column[i];
//           x++;
//         }
//       }
//       const data = column1;
//       const total = column_info[0].length;
//       return { data, total };
//     } else {
//       const data: Column[] = column_info[0];
//       const total = column_info[0].length;
//       return { data, total };
//     }
//   }
// }
