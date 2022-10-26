import { Args, Query, Resolver } from '@nestjs/graphql';
import {
  ScanParameters,
  ScanStatusResult,
  SqlInfoResult,
} from 'src/graphql.schema';
import { ServerResourceResolver } from 'src/server-resource/server-resource.resolver';

import { RecognizeMonitorService } from './service';

@Resolver('recognizeMonitor')
export class RecognizeMonitorResolver {
  //全局变量,存储get内容

  error: any;

  // 将server服务注入进来
  constructor(
    private recognizeMonitorService: RecognizeMonitorService,

    private serverResourceResolver: ServerResourceResolver,
  ) { }

  /**
   * 显示识别权限为1的所有sql
   * @param id
   * @param skip
   * @param take
   * @param resources_info_id
   * @param startTime
   * @param endTime
   * @param identify_permissions
   * @returns
   */
  // 旧版
  @Query('sqlInfosAndScanState')
  async sqlInfosAndScanState(
    @Args('id') id,
    @Args('skip')
    skip?,
    @Args('take')
    take?,
    @Args('resources_info_id')
    resources_info_id?,
    @Args('instance')
    instance?,
    @Args('region')
    region?,
    @Args('startTime')
    startTime?,
    @Args('endTime')
    endTime?,
    @Args('identify_permissions')
    identify_permissions?,
  ): Promise<SqlInfoResult> {
    const dataModel =
      await this.recognizeMonitorService.getsqlInfosAndScanState(
        { id, resources_info_id, identify_permissions },
        { skip, take },
        startTime,
        endTime,
        { instance, region },
      );

    const sqlInfos = dataModel.data.map((item) => {
      const resourceInfo = this.serverResourceResolver.getById(
        item.resources_info_id,
      );

      return {
        ...item,
        resourceInfo: resourceInfo,
      };
    });

    const result = {
      data: sqlInfos,
      total: dataModel.total,
    };
    return result;
  }
  /**
   * 传入一个id的数组,进行定时轮询查询扫描状态
   * @param ids
   * @returns
   */
  @Query('getScanState')
  async getScanState(
    @Args('ids')
    ids: number[],
  ): Promise<ScanStatusResult> {
    //返回的data是id跟state
    const data = this.recognizeMonitorService.getScanStateByIds(ids);

    const result = (await data).map((item) => {
      let sacnStateMessageResult;

      switch (item.scan_state) {
        case 0:
          sacnStateMessageResult = '未扫描';
          break;
        case 1:
          sacnStateMessageResult = '正在扫描...';
          break;
        case 2:
          sacnStateMessageResult = '等待';
          break;
        case 3:
          sacnStateMessageResult = '扫描完成';
          break;
      }

      return {
        id: item.id,
        scanStateCode: item.scan_state,
        sacnStateMessage: sacnStateMessageResult,
      };
    });

    return { data: result };
  }

  /**
   * 点击扫描执行的方法,先执行一个扫描
   */
  @Query('scanById')
  async scanById(
    @Args('id')
    id: number,
  ) {
    //将逻辑写在service中
    //  1.根据id获取到数据库信息,将其链接
    const dataModel = await this.recognizeMonitorService.getsqlInfo(id);

    // (1)如果链接成功
    //  @1得到识别采样数

    //  @2得到表的数量,行列,以及单元格数
    // 如果为0扫描结束

    //  如果不为0,遍历temolate,查看is_use的状态,得到模板id

    // 得到模板以后,扫描sensitive下的 status为1且template为模板id的规则,形成list
    //获取表中的所有的内容,依次进行匹配,这是个for循环
    //每次循环都遍历一遍list,如果当前表或者列或者单元格不在 list中的scan_range,则跳出当前规则,向下一个规则进军
    //如果在当前扫描的范围内.取list中的关联的modle,进行匹配

    //(2)如果链接失败,往扫描状态里边存入扫描失败
  }
}
