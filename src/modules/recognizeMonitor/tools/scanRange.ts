import { Prisma, self_db } from '@prisma/client';
import filterRuleTool, {
  filterRuleToolUseMany,
} from 'src/modules/recognizeMonitor/tools/filterRuleTool';

import { RulesInScan, ScanRangeType } from '../dto/dto';

enum ASSETTYPE {
  MYSQl = 1,
  OTHER = 2,
}

enum OBJCTTYPE {
  INSTANCE = 0, //实例名称
  SQL = 1, //数据库名称
  TABLE = 2, //表名称
  COLUMN = 3, //列名称
}

//判断该表是否在扫描范围中，在返回数组
export async function tableIsScanRange(
  rules: RulesInScan[] | RulesInScan,
  tableNamesArr,
) {
  const returnRules: any[] = [];
  const isArray = Array.isArray(rules);
  if (isArray) {
    for (const item of rules) {
      //因为scanRange中包含多个范围,这里要遍历每个对象
      const scanRange: ScanRangeType[] = JSON.parse(
        JSON.stringify(item.scan_range),
      );

      //    上来先判断没有扫描范围的情况
      if (scanRange === null) {
        returnRules.push(item);
      }

      //用来记录每条表名名记录是否被保留
      let isRetainTableName = true;

      //设置标志用来记录当前字段是否已经命中-表名
      let isTableNamesFlag = false;

      //此时应该有两条路,如果在扫描范围中,则返回去掉实例匹配跟数据库名匹配以及没有的那些表名
      //如果不在扫描范围中,scan直接为空,rule这一条不用了
      /**
         * item:{ assetTypes: 2,matchingConditions: [ { object: 1, content: 'sensitive_rules', condition: 1 } ]}
      }
         */
      // 用来便利一条规则中的所有内容
      for (const i in scanRange) {
        //ToDo:先判断assetTypes,判断资产类型,其他的类型后续支持
        const item = scanRange[i];
        //   const matchingConditions
        const assetTypes = item.assetTypes;
        const object = item.matchingConditions[0].object;
        const condition = item.matchingConditions[0].condition;
        const content = item.matchingConditions[0].content;

        switch (assetTypes) {
          //此时是mysql数据库
          case ASSETTYPE.MYSQl:
            switch (object) {
              //表名称
              case 2:
                const resData2 = filterRuleToolUseMany(
                  isTableNamesFlag,
                  condition,
                  content,
                  tableNamesArr,
                  isRetainTableName,
                );
                //得到返回值，因为函数内没办法改变传入参数的值
                isRetainTableName = resData2.isRetain;
                isTableNamesFlag = resData2.isTagFlag;
                break;
            }
            break;
          //ToDo:扫描的是其他数据类型
          case ASSETTYPE.OTHER:
            console.log('此时扫描的是其他数据类型', assetTypes);
            break;

          default:
            break;
        }
      }

      if (isRetainTableName) {
        returnRules.push(item);
      }
    }

    return returnRules;
  }
}
