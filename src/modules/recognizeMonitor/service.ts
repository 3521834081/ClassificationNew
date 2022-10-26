import { Catch, Injectable } from '@nestjs/common';
import {
  column_info,
  Prisma,
  recognition_model,
  resources_info,
  self_db,
  sensitive_results,
  sensitive_rules,
} from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import filterRuleTool, {
  filterRuleToolUseMany,
} from 'src/modules/recognizeMonitor/tools/filterRuleTool';
import MysqlUntil from 'src/utils/MysqlUtil';
import ArrTool from 'src/utils/ArrTool';
import { RedisInstance } from 'src/utils/RedisInstance';
import { TransferDate } from 'src/utils/TransferDate';
import { SensitiveResultService } from '../sensitiveResult/service';
import {
  dbReturnData,
  scanStateService,
  sqlLoginInfo,
  tableDataInRedis,
  RulesInScan,
  ScanRangeType,
} from './dto/dto';
import { map } from 'rxjs';
import { table } from 'console';
import {
  countingTool,
  determineColumnType,
} from 'src/common/tools/judgeColumnType';
import { SensitiveClassificationService } from '../sensitiveClassification/service';

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
//规则范围的匹配方式
enum MatchingRules {
  Equal = 1, //当规则为相等匹配时
  Regular = 2, //当规则为正则匹配时
  Prefix = 3, //当规则为前缀匹配时
  Suffix = 4, // 当规则为后缀匹配时
}
//模型识别方式
enum Condition {
  UnContain = 1, //不包含
  Contain = 2, //包含
  Regular = 3, //当模型为正则匹配时
}
@Injectable()
export class RecognizeMonitorService {
  classificationTemplateId: number;
  dbUntil;
  constructor(
    private prisma: PrismaService,
    private sensitiveResultService: SensitiveResultService,
    private sensitiveClassificationService: SensitiveClassificationService,
  ) {
    this.dbUntil = new MysqlUntil();
  }

  /**
   *  得到数据库信息,并且得到db的连接池
   * @param id 需要扫描数据库的id
   */
  async getsqlInfo(id: number) {
    // 得到单条数据库的信息
    const data: sqlLoginInfo = await this.prisma.self_db.findUnique({
      where: { id: id },
    });
    //  存储服务器资源信息
    const rouseInfo: resources_info =
      await this.prisma.resources_info.findUnique({
        where: { id: data.resources_info_id },
      });

    const host = rouseInfo.instance;

    this.dbUntil.MysqlPoolsLogin(
      host,
      data.port,
      data.user,
      data.password,
      data.database,
    );

    //将所有数据存储到redes中
    const tableNames = await this.getTablesAndColumn(
      host,
      data.database,
      data.show_count,
    );

    //ToDo:更改扫描状态,这个地方是不是可以拿到函数外边
    //得到要扫描的id
    await this.prisma.self_db.update({
      data: {
        scan_state: 1,
      },
      where: { id: id },
    });

    //TODO:这里我先删除原先的记录再新加记录,就会好一些
    const sensitiveResultsIdObject =
      await this.prisma.sensitive_results.findMany({
        where: { database_id: data.id },
        select: { id: true },
      });

    const sensitiveResultsIdObjectArr: number[] = sensitiveResultsIdObject.map(
      (item) => {
        return item.id;
      },
    );

    //重新查询之前删除列表中的相关值
    const deleteColumnInfo = this.prisma.column_info.deleteMany({
      where: {
        sensitive_results_id: {
          in: sensitiveResultsIdObjectArr,
        },
      },
    });

    const deleteSensitiveResults = this.prisma.sensitive_results.deleteMany({
      where: { database_id: data.id },
    });
    //事物处理

    const transaction = await this.prisma.$transaction([
      deleteColumnInfo,
      deleteSensitiveResults,
    ]);

    //执行主扫描方法
    this.scanMain(id, tableNames, host, data.database)
      .then(async () => {
        //关闭连接池
        this.dbUntil.MysqlPoolsDel();
        /**
         * 更新self_db:数据库记录的最后扫描时间跟状态
         */
        //记录最后更新时间
        const scanTimeLeast = TransferDate.parseISOLocal();

        console.log(
          '更新扫描状态',
          await this.prisma.self_db.update({
            data: {
              scan_time: scanTimeLeast,
              scan_state: 3,
            },
            where: { id: id },
          }),
        );
      })
      .catch(async () => {
        //关闭连接池
        this.dbUntil.MysqlPoolsDel();
        /**
         * 更新self_db:数据库记录的最后扫描时间跟状态
         */
        //记录最后更新时间
        const scanTimeLeast = TransferDate.parseISOLocal();
        await this.prisma.self_db.update({
          data: {
            scan_time: scanTimeLeast,
            scan_state: 3,
          },
          where: { id: id },
        });
      });
  }

  /**
   * 得到所有表的行列,将其存入到redis中,在遍历时应用
   * @returns 表的名字
   */

  async getTablesAndColumn(host: string, database: string, show_count: number) {
    //得到数据库中所有表

    const data: dbReturnData = await this.dbUntil.MysqlQuery(
      'SELECT   table_name  FROM  information_schema.tables where table_schema = (select database()) order by create_time desc ',
    );

    //表的数量
    const tableNums = data.data.length;

    //表的名字,这是个数字 ,数据形式 { table_name: 'sensitive_level' }
    const tableNames = data.data;
    // console.log('tableNames', tableNames);

    //得到redis对象，得到每个表的行跟列数,这里试一下,redis
    const redis = await RedisInstance.initRedis();

    //得到根据表名,得到列名跟行数
    //tableName,每次执行都得到一个名字.根据这个名字去取得表里所有的数据,存储起来
    for (const item of tableNames) {
      const rowLengthObjectArr: dbReturnData = await this.dbUntil.MysqlQuery(
        `SELECT   COUNT(*) as rowLength        FROM  ${item.table_name};`,
      );
      let res;
      try {
        // res = await this.dbUntil.MysqlQuery(`SELECT  * FROM ${item.table_name}
        // WHERE id >= ( SELECT floor( RAND() * ( SELECT MAX( id ) FROM ${item.table_name} ) ) )
        //  ORDER BY id  LIMIT ${show_count};`);
        res = await this.dbUntil.MysqlQuery(
          `SELECT * FROM ${item.table_name} ORDER BY  RAND() LIMIT  ${show_count};`,
        );
      } catch (error) {
        console.log('得到数据库里边的随机数据出现的问题', error);
      }

      //求有多少列,并且把列的名字聚集在一块
      if (res.data[0]) {
        //  得到key值
        const keys = Object.keys(res.data[0]);

        //  设置column对象,存储列的长度跟内容
        const column: { lengthOfColumn: number; columnTitles: string[] } = {
          lengthOfColumn: keys.length,
          columnTitles: keys,
        };
        res = {
          ...res,
          column: column,
          rowLength: rowLengthObjectArr.data[0].rowLength,
        };
        this.dbUntil;
        redis.set(
          `${host}_${database}_${item.table_name}`,
          JSON.stringify(res),
        );
      } else {
        //当数组不为0时
        const column: { lengthOfColumn: number; columnTitles: string[] } = {
          lengthOfColumn: 0,
          columnTitles: [],
        };

        res = {
          ...res,
          column: column,
          rowLength: rowLengthObjectArr.data[0].rowLength,
        };
        redis.set(
          `${host}_${database}_${item.table_name}`,
          JSON.stringify(res),
        );
      }
    }

    //返回表的名字
    return tableNames;
  }

  /**
   * 得到该模板下,所有的匹配规则
   * @returns 返回 rules数组
   */
  async getRecognitionRules() {
    //获取模板id,is_use为1的
    const templateObject = await this.prisma.classification_template.findFirst({
      where: { is_use: 1 },
    });

    this.classificationTemplateId = templateObject.id;

    //遍历reuls中的数据得到,通过templateObject的id得到所有的相关数据
    const rules = await this.prisma.sensitive_rules.findMany({
      where: {
        status: 1,
        classification_template_id: templateObject.id,
      },
    });

    //解析rule中的json对象
    const rulesObject = rules.map((item) => {
      const itemObject = JSON.parse(JSON.stringify(item));
      return itemObject;
    });

    return rulesObject;
  }

  /**
   * 处理传入的规则数组,使得得到所有的规则带有规则模型跟级别
   * @param rules:得到规则数组
   * @returns :返回带有模型
   */
  async getModelsAndLevel(rules: RulesInScan[]) {
    const ruleWithModelAndLevelArr: RulesInScan[] = [];

    for (const iterator of rules) {
      const modelAndRules = await this.prisma.modelandrules.findMany({
        where: { sensitive_rules_id: iterator.id },
      });

      //得到模板id的数组
      const recognitionModelIds = modelAndRules.map((item) => {
        const recognition_model_id = item.recognition_model_id;

        return recognition_model_id;
      });
      //得到该条规则的所有规则所有识别规则
      const recognitionModel = await this.prisma.recognition_model.findMany({
        where: { id: { in: recognitionModelIds } },
      });
      const models: recognition_model[] = recognitionModel;
      const level = await this.prisma.sensitive_level.findFirst({
        where: { id: iterator.sensitive_level_id },
      });
      const ruleWithModelAndLevel = {
        ...iterator,
        models: models,
        level: level,
      };

      ruleWithModelAndLevelArr.push(ruleWithModelAndLevel);
    }
    return ruleWithModelAndLevelArr;
  }

  /**
   * 扫描主方法
   * @param id :database_id,即self__db中的id
   * @param tableNames :表名
   * @param host :服务器ip
   * @param mysqlName :数据库名
   */
  async scanMain(id, tableNames, host, mysqlName) {
    //在该方法中得到redis对象
    const redis = await RedisInstance.initRedis();
    // 得到所有的敏感规则

    const rules = await this.getRecognitionRules();

    //得到数组名字
    const tableNamesArr: string[] = tableNames.map((item) => {
      // 每条item数据:{ table_name: 'self_db' }
      return item.table_name;
    });

    //筛选规则：首选过滤一下地址,跟名称,以及表名
    let willUseRules = await this.filterRules(
      rules,
      redis,
      host,
      mysqlName,
      tableNamesArr,
    );

    //ToDo:如果在之后取规则的模型跟级别不方便，那么可以在这里添加下边的函数
    willUseRules = await this.getModelsAndLevel(willUseRules);

    /**
     *    初始化要存的表结构
     */
    //记录有几个表
    let n = 0;
    //新建db扫描记录
    const dbResult: Prisma.db_sensitive_resultCreateInput = {
      self_db_id: id,
      total_tables: tableNames.length,
      sensitive_tables: 0, //这里是没有用上的
      create_time: undefined,
      update_time: undefined,
    };

    //关键代码：扫描表数据
    for (const tableName of tableNamesArr) {
      /**
       * 初始化
       */
      //新建结果记录（一次存一条）：sensitive_result
      const tableResult: Prisma.sensitive_resultsCreateInput = {
        classification_template_id: this.classificationTemplateId,
        table_name: tableName,
        database_id: id,
        total_row: 0,
        total_column: 0,
        sensitive_column: 0,
        number_cell: 0,
        create_time: undefined,
        update_time: undefined,
        hit_data: '',
      };
      //新建列数组记录（一次存一个数组）：column_info
      let columnInfoArr: Prisma.column_infoCreateInput[] = [];

      //ToDo: 这里留一种情况: 当ruleName出现重复的时候，那个时候应当存的书rule的id，最后取出名字来分类
      //现在默认不会出现重复

      //新建暂时存储hit_data的数组
      const hitRuleNameArr: string[] = [];
      //新建hit_data对象，这个是需要返回给前端的
      let hitDataArr: { rule_name: string; count: number }[] = [];

      /**
       * 过滤规则相关操作
       */

      //为了使用原先的传入数组名的方法，这里写一个数组
      const tableNameToArr: string[] = [tableName];

      //记录每个表是否被命中，用于统计该表中敏感表数量
      let tableFlag = false;

      const thisColumnRules = await this.filterRules(
        willUseRules,
        redis,
        host,
        mysqlName,
        tableNameToArr,
      );

      //这里应当考虑，,mysqlName即为数据库名字
      const dataString = await redis.get(`${host}_${mysqlName}_${tableName}`);
      const tableDate: tableDataInRedis = JSON.parse(dataString);

      //填入result结果数据，已经确定的数据 对应表：sensitive_results
      tableResult.total_column = tableDate.column.lengthOfColumn;
      tableResult.total_row = tableDate.rowLength;
      tableResult.classification_template_id = this.classificationTemplateId; //对应的模版id
      tableResult.database_id = id; //是哪个数据库的
      tableResult.number_cell =
        tableDate.rowLength * tableDate.column.lengthOfColumn; //总单元数

      /******************************************************************************************************************************************************************
       *  当规则为空的时候
       */
      if (thisColumnRules.length === 0) {
        console.log('没走最上边规则为空的情况');

        tableResult.hit_data = hitDataArr;
        tableResult.create_time = TransferDate.parseISOLocal();
        tableResult.update_time = TransferDate.parseISOLocal();
        //未命中敏感总列数为0
        tableResult.sensitive_column = 0;
        //得到当前表的列的所有名称
        const columnTitles = tableDate.column.columnTitles;

        const addresult = await this.prisma.sensitive_results.create({
          data: tableResult,
        });

        for (const columnTitle of columnTitles) {
          //记录列详情的id
          let i = 1;
          //ToDo:完成类型判断
          //新建column_info
          const columnInfo: Prisma.column_infoCreateInput = {
            hit_rule: '未命中',
            before_hit_rule: '未命中',
            before_hit_level: 'N/A',
            sensitive_level: 'N/A',
            column_name: columnTitle,
            revision_status: 0,
            attribute_type: 'Insensitive',
            classification_name: '未命中',
            create_time: undefined,
            update_time: undefined,
            data_type: 'String',
          };
          columnInfo.column_id = i++;
          //ToDo:这里primsma没有自动去生成有点问题
          columnInfo.sensitive_results_id = addresult.id;

          //识别内容
          const samplingResultsArr: string[] = [];
          //得到每一个表中取到的数据
          const data: any[] = tableDate.data;
          for (const item of data) {
            const value: string = item[columnTitle];
            samplingResultsArr.push(value);
          }
          columnInfo.sampling_results = JSON.parse(
            JSON.stringify(ArrTool.ArrUnique(samplingResultsArr, ',')),
          );
          columnInfo.data_type = determineColumnType(samplingResultsArr);

          columnInfo.update_time = TransferDate.parseISOLocal();
          columnInfo.create_time = TransferDate.parseISOLocal();
          columnInfoArr.push(columnInfo);
          // console.log('columnInfoArr', columnInfoArr);
        }

        await this.prisma.column_info.createMany({
          data: columnInfoArr,
        });
        //删除redis中该表的相关内容
        await redis.del(`${host}_${mysqlName}_${tableName}`);

        //终止此次循环,去扫描下一个表
        continue;
      }

      /******************************************************************************************************************************************************************
       *  当规则不为空的时候
       */
      console.log('执行规则不为空的时候');

      //得到每一个表中取到的数据
      const data: any[] = tableDate.data;
      //得到列名
      const columnTitles = tableDate.column.columnTitles;

      /**以列为基本单位,遍历所有取出来的数据
       * columnTitle:当前表每一列的列名
       */
      //记录列详情的id
      let i = 1;
      for (const columnTitle of columnTitles) {
        //每一列的属性，新建column_info
        const columnInfo: Prisma.column_infoCreateInput = {
          hit_rule: '未命中',
          before_hit_rule: '未命中',
          before_hit_level: 'N/A',
          sensitive_level: 'N/A',
          column_name: columnTitle,
          revision_status: 0,
          attribute_type: 'Insensitive',
          classification_name: '未命中',
          create_time: undefined,
          update_time: undefined,
          data_type: 'String',
        };

        columnInfo.column_id = i++;

        //该列是否已经命中了
        let columnFlag = false;
        //Todo:识别内容,这里要修改成一致的
        //识别内容
        const samplingResultsArr: string[] = [];
        //记录当前列选出来的所有记录的命中规则情况，进行判断最符合情况的
        const judgeRuleArrMax: number[] = [];
        // //当没有内容被识别到,直接显示所有的扫描数据
        // const samplingResultsArrWillNull: string[] = [];
        //存储当前列命中的规则
        let flagRule: RulesInScan;
        //首选需要明白当前规则匹配范围已经过滤掉 数据库实例，跟数据库名
        //找出符合当前列中适合遍历的rule
        let willUseColumnRules: RulesInScan[];
        try {
          willUseColumnRules = await this.filterRulesByColumn(
            thisColumnRules,
            redis,
            host,
            mysqlName,
            columnTitle,
          );
        } catch (error) {
          console.log(error);
        }

        //如果该列没有合适的规则，那么跳出该列往下一列进行
        if (willUseColumnRules.length === 0) {
          // console.log(
          //   '正在扫描表',
          //   tableName,
          //   '中的列',
          //   columnTitle,
          //   '没有合适的规则',
          // );
          //将该列取出来的样例数据存储在列数组中： columnInfo.sampling_results
          for (const item of data) {
            const value: string = item[columnTitle];
            samplingResultsArr.push(value);
            columnInfo.sampling_results = JSON.parse(
              JSON.stringify(ArrTool.ArrUnique(samplingResultsArr, ',')),
            );
          }
          columnInfo.data_type = determineColumnType(samplingResultsArr);
          columnInfo.update_time = TransferDate.parseISOLocal();
          columnInfo.create_time = TransferDate.parseISOLocal();
          columnInfoArr.push(columnInfo);
          continue;
        } else {
          // console.log('正在扫描表', tableName, '中的列', columnTitle);
        }
        try {
          //当该列中有合适的规则，以一个单元格为目标开始遍历.
          for (const item of data) {
            //每一个单元格的内容,这就是数据采样结果,其实我更想把这里改成命中数据
            const value: string = item[columnTitle];
            //获取到的数据：备用,当没有扫描结果的时候直接用这个
            samplingResultsArr.push(value);

            //解决json识别不准确的问题，因为之前带着字符串，将“test ”转成 test
            const valueObject = JSON.parse(JSON.stringify(value));

            //当该列下的该单元格不为空的情况

            //拿着这个单元格的内容去rule中的model中进行比较
            // 遍历该列符合的规则
            let ruleFlag = false;
            for (const rule of willUseColumnRules) {
              // 当一条规则被搞定了直接跳出
              if (ruleFlag) break;
              //得到models,注意models是非空的,这里的逻辑跟扫描范围很像
              const models: recognition_model[] = rule.models;

              //遍历识别模型（该规则下带着的正则）
              const modelFlag = false;
              for (const model of models) {
                //model已经被命中了直接跳出
                if (modelFlag) {
                  // console.log('model', model, '已经被命中了直接跳出');

                  break;
                }
                const modelRules = JSON.parse(JSON.stringify(model.rule));
                //正则集：

                //记录model下的匹配规则，只要有一条被匹配上了，不进行执行下一条
                let modelRuleFlag = false;
                for (const modelRule of modelRules) {
                  if (modelRuleFlag) {
                    break;
                  }

                  const content = modelRule.content;
                  const condition = modelRule.condition;
                  //三中匹配方式都可以用正则
                  let patt;
                  try {
                    patt = new RegExp(content);
                  } catch (error) {
                    continue;
                    console.log('正则出现了错误', error);
                  }

                  // console.log(
                  //   '表中',
                  //   tableName,
                  //   '列',
                  //   columnTitle,
                  //   '的内容',
                  //   value,
                  //   '正在执行',
                  //   '正则',
                  //   patt,
                  // );

                  switch (condition) {
                    //不包含
                    case Condition.UnContain:
                      const result1 = !patt.test(valueObject);
                      // 如果该单元格被命中,证明该列被命中,跳出当前model,执行下一个rule
                      if (result1) {
                        columnFlag = true;
                        ruleFlag = true;
                        tableFlag = true;
                        modelRuleFlag = true;
                        break;
                      }

                      break;

                    //包含
                    case Condition.Contain:
                      const result2 = patt.test(valueObject);
                      // 如果该单元格被命中,证明该列被命中,跳出当前model,执行下一个rule
                      if (result2) {
                        columnFlag = true;
                        ruleFlag = true;
                        tableFlag = true;
                        modelRuleFlag = true;
                        break;
                      }

                      break;
                    //正则
                    case Condition.Regular:
                      //这里需要注意之前这里因为带着字符串所以这里判断错了很多内容
                      const result3 = patt.test(valueObject);

                      // 如果该单元格被命中,证明该列被命中,跳出当前model,执行下一个rule
                      if (result3) {
                        columnFlag = true;
                        ruleFlag = true;
                        tableFlag = true;
                        modelRuleFlag = true;
                        break;
                      }

                      break;
                  }
                }
              }

              //当该规则被命中,不在执行其余规则,转去验证当前规则
              if (ruleFlag) {
                //记录当前命中规则
                judgeRuleArrMax.push(rule.id);
                break;
              }
            }
          }
        } catch (error) {
          console.log('正规则这里出了错误error', error);
        }

        //当命中的该列,才能将命中的列详情,放在要存储的对象中
        if (columnFlag) {
          try {
            //当该列的所有取出的内容遍历完成，进行判断该列到底符合哪个规则
            const { result, index } = countingTool(judgeRuleArrMax);
            flagRule = willUseColumnRules.find(
              (item) => result[index].key === item.id,
            );
            // console.log('我是', columnTitle, '中命中最多的规则', flagRule);
          } catch (error) { }
          // console.log('符合条件的规则', flagRule);

          const path = await this.sensitiveClassificationService.findRulePath(
            flagRule.id,
          );
          // console.log(path);

          columnInfo.classification_name = path.pathName;
          columnInfo.hit_rule = flagRule.name;
          columnInfo.before_hit_rule = flagRule.name;
          columnInfo.before_hit_level = flagRule.level.name;
          columnInfo.sensitive_level = flagRule.level.name;
          columnInfo.attribute_type = flagRule.attribute_type;
          hitRuleNameArr.push(flagRule.name);
          tableResult.sensitive_column = tableResult.sensitive_column + 1;
        }
        //判定该列有没有命中数据,如果命中,则sampling_results中显示命中的值,如果没命中显示没命中的值

        try {
          (columnInfo.sampling_results = JSON.parse(
            JSON.stringify(ArrTool.ArrUnique(samplingResultsArr, ',')),
          )),
            (columnInfo.data_type = determineColumnType(samplingResultsArr));
          columnInfoArr.push(columnInfo);
        } catch (error) {
          console.log(error);
        }
      }

      tableResult.create_time = TransferDate.parseISOLocal();
      tableResult.update_time = TransferDate.parseISOLocal();

      //处理
      if (hitRuleNameArr.length != 0) {
        // hitDataObject.hit_data = ArrTool.ArrUnique(hitDateArr, ";")
        const { result } = countingTool(hitRuleNameArr);

        hitDataArr = result.map((item: { key: any; count: number }) => {
          const hitData: { rule_name: string; count: number } = {
            rule_name: '',
            count: 0,
          };
          hitData.rule_name = item.key;
          hitData.count = item.count;
          return hitData;
        });

        // console.log('  我是处理以后的hitDataArr', hitDataArr);
      }

      tableResult.hit_data = JSON.parse(JSON.stringify(hitDataArr));

      const addResult = await this.prisma.sensitive_results.create({
        data: tableResult,
      });
      columnInfoArr = columnInfoArr.map((item) => {
        return {
          ...item,
          sensitive_results_id: addResult.id,
          create_time: TransferDate.parseISOLocal(),
          update_time: TransferDate.parseISOLocal(),
        };
      });
      // console.log('columnInfoArr执行了', columnInfoArr);
      let columnResult;
      try {
        columnResult = await this.prisma.column_info.createMany({
          data: columnInfoArr,
        });
      } catch (error) {
        console.log('error', error);
      }

      // console.log('我是', tableName, '结果表:', addResult);

      if (tableFlag === true) {
        n++;
      }
      await redis.del(`${host}_${mysqlName}_${tableName}`);
      // }

      //更新数据库结果表的结果
      dbResult.sensitive_tables = n;
      const resultDb = await this.prisma.db_sensitive_result.findFirst({
        where: { self_db_id: dbResult.self_db_id },
      });
      if (resultDb === null) {
        //每次扫描完表以后增加记录l
        dbResult.create_time = TransferDate.parseISOLocal();
        dbResult.update_time = TransferDate.parseISOLocal();
        await this.prisma.db_sensitive_result.create({
          data: dbResult,
        });
      } else {
        dbResult.update_time = TransferDate.parseISOLocal();
        await this.prisma.db_sensitive_result.updateMany({
          where: { self_db_id: id },
          data: dbResult,
        });
      }
    }
  }

  /**
   * 轮询查找id存在的,并且id跟scan_state在的值
   * @param ids
   * @returns
   */
  async getScanStateByIds(ids: number[]): Promise<scanStateService[]> {
    const data = await this.prisma.self_db.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        id: true,
        scan_state: true,
      },
    });

    return data;
  }

  /**
   * 分页查询,获取全部数据或者组合条件数据库
   * @param input
   * @param pagination
   * @param startTime
   * @param endTime
   * @returns
   */
  async getsqlInfosAndScanState(
    input: Prisma.self_dbWhereInput,
    pagination?: { skip: number; take: number },
    startTime?: string,
    endTime?: string,
    region?: { instance: string; region: string },
  ): Promise<{ data: self_db[] | []; total: number }> {
    input.identify_permissions = 1;

    // 当时间不为空的时候执行此查询
    if (startTime !== undefined && endTime !== undefined) {
      //得到所有的数据
      const data = await this.prisma.self_db.findMany({
        where: {
          scan_time: {
            gte: TransferDate.parseISOLocal(startTime),
            lte: TransferDate.parseISOLocal(endTime),
          },
          AND: input,
        },
        skip: pagination.skip,
        take: pagination.take,
      });

      const total = await this.prisma.self_db.count({
        where: {
          scan_time: {
            gte: TransferDate.parseISOLocal(startTime),
            lte: TransferDate.parseISOLocal(endTime),
          },
          AND: input,
        },
      });
      return {
        data,
        total,
      };
    } else {
      //得到所有的数据
      const data = await this.prisma.self_db.findMany({
        where: input,
        skip: pagination.skip,
        take: pagination.take,
      });

      const total = await this.prisma.self_db.count({
        where: input,
      });
      return {
        data,
        total,
      };
    }
  }

  /**
   *传入的是单个内容时用，比如说数据库名，实例名
   * @param isTagFlag  :该条范围是否已经被命中，指的是 matchingConditionsArr中的一条
   * @param condition ：匹配条件
   * @param content ：范围内容
   * @param tag ：匹配 可以为host，数据库名
   * @param isRetain ：初始值为ture，为保留
   * @returns  返回是否保留
   */
  async filterRuleTool(
    isTagFlag: boolean,
    condition: number,
    content,
    tag,
    isRetain: boolean,
  ) {
    if (isTagFlag) return { isRetain, isTagFlag };

    //  condition:匹配条件
    switch (condition) {
      //相等匹配时
      case MatchingRules.Equal:
        const patt1 = new RegExp(`^${content}$`);
        const result1 = patt1.test(tag);
        if (result1) {
          //为真：此时说明在扫描范围中，将命中标志设置为true
          isTagFlag = true;
        } else {
          isRetain = false;
        }

        break;

      //正则匹配时
      case MatchingRules.Regular:
        //新建正则匹配对象
        const patt = new RegExp(content);
        const result = patt.test(tag);
        if (result) {
          //为真：此时说明在扫描范围中，将命中标志设置为true
          isTagFlag = true;
        } else {
          isRetain = false;
        }

        break;

      //前缀匹配时
      case MatchingRules.Prefix:
        //进行数组切割,得到多个值
        const contentArr3: [] = content.split('|');
        const hostInScanRange3 = contentArr3.find((element) => {
          const patt = new RegExp(`^${content}`);

          const result = patt.test(tag);

          return result;
        });
        if (hostInScanRange3 !== undefined) {
          //为真：此时说明在扫描范围中，将命中标志设置为true
          isTagFlag = true;
        } else {
          isRetain = false;
        }

        break;

      //后缀匹配时
      case MatchingRules.Suffix:
        //进行数组切割,得到多个值
        const contentArr4: [] = content.split('|');
        const hostInScanRange4 = contentArr4.find((element) => {
          const patt = new RegExp(`${content}$`);
          const result = patt.test(tag);

          return result;
        });

        if (hostInScanRange4 !== undefined) {
          //为真：此时说明在扫描范围中，将命中标志设置为true
          isTagFlag = true;
        } else {
          isRetain = false;
        }

        break;
    }

    return { isRetain, isTagFlag };
  }
  /**
   *
   * @param rules
   * @param redis
   * @param host
   * @param mysqlName
   * @param tableNamesArr
   * @returns
   */
  async filterRules(
    rules: RulesInScan[],
    redis: any,
    host,
    mysqlName,
    tableNamesArr: any[],
  ) {
    const ruleWillUse: RulesInScan[] = [];
    for (const item of rules) {
      //因为scanRange中包含多个范围,这里要遍历每个对象
      const scanRangeArr: ScanRangeType[] = JSON.parse(
        JSON.stringify(item.scan_range),
      );

      if (scanRangeArr.length !== 0) {
        /**
         * 这里记录两个内容，一个是为了最后保留这个规则吗，一个是为了，范围已经被命中过就不再使用了
         */
        //用来记录每条实例记录是否被保留-实例
        let isRetainInstance = true;
        //用来记录每条数据库名记录是否被保留
        let isRetainMysqlName = true;
        //用来记录每条表名名记录是否被保留
        let isRetainTableName = true;
        //用来记录每条列名记录是否被保留
        let isRetainColumn = true;

        //设置标志用来记录当前字段是否已经命中
        let isInstanceFlag = false;
        //设置标志用来记录当前字段是否已经命中-数据库名
        let isMysqlNameFlag = false;
        //设置标志用来记录当前字段是否已经命中-表名
        let isTableNamesFlag = false;
        //设置标志用来记录当前字段是否已经命中-列名
        let isColumnFlag = false;

        /**
         * item:{ assetTypes: 2,matchingConditions: [ { object: 1, content: 'sensitive_rules', condition: 1 } ]}
    }
         */
        // 用来便利一条规则中的所有内容
        for (const i in scanRangeArr) {
          //ToDo:先判断assetTypes,判断资产类型,其他的类型后续支持
          const item = scanRangeArr[i];

          const assetTypes = item.assetTypes;
          const matchingConditionsArr = item.matchingConditions;

          switch (assetTypes) {
            //此时是mysql数据库
            case ASSETTYPE.MYSQl:
              for (const iterator of matchingConditionsArr) {
                const object = iterator.object;
                const condition = iterator.condition;
                const content = iterator.content;

                switch (object) {
                  //实例名称
                  case OBJCTTYPE.INSTANCE:
                    const resData = filterRuleTool(
                      isInstanceFlag,
                      condition,
                      content,
                      host,
                      isRetainInstance,
                    );
                    //得到返回值，因为函数内没办法改变传入参数的值
                    isRetainInstance = resData.isRetain;
                    isInstanceFlag = resData.isTagFlag;
                    break;

                  //库名称
                  case OBJCTTYPE.SQL:
                    const resData1 = filterRuleTool(
                      isMysqlNameFlag,
                      condition,
                      content,
                      mysqlName,
                      isRetainMysqlName,
                    );

                    //得到返回值，因为函数内没办法改变传入参数的值
                    isRetainMysqlName = resData1.isRetain;
                    isMysqlNameFlag = resData1.isTagFlag;
                    break;
                  //表名称
                  case OBJCTTYPE.TABLE:
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
                  //列名称
                  case OBJCTTYPE.COLUMN:
                    // 遍历所有的数据
                    for (const i in tableNamesArr) {
                      const tableName = tableNamesArr[i];

                      const dataString = await redis.get(
                        `${host}_${mysqlName}_${tableName}`,
                      );
                      const tableDate = JSON.parse(dataString);

                      const columnArr = tableDate.column.columnTitles;
                      // console.log(columnArr);
                      // console.log('列扫描之前', isRetainColumn, isColumnFlag);

                      const resData3 = filterRuleToolUseMany(
                        isColumnFlag,
                        condition,
                        content,
                        columnArr,
                        isRetainColumn,
                      );

                      isRetainColumn = resData3.isRetain;
                      isColumnFlag = resData3.isTagFlag;
                      // console.log('列扫描之后', isRetainColumn, isColumnFlag);
                      if (isColumnFlag) {
                        break;
                      }
                    }
                    break;
                }
                //   console.log(
                //     iterator,
                //     isRetainInstance,
                //     isRetainMysqlName,
                //     isRetainTableName,
                //     isRetainColumn,
                //   );
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

        //当这条规则里边的范围走完，看是否满足里边的内容才能被保留
        if (
          isRetainInstance &&
          isRetainMysqlName &&
          isRetainTableName &&
          isRetainColumn
        ) {
          ruleWillUse.push(item);
        }
      } else {
        ruleWillUse.push(item);
      }
    }

    return ruleWillUse;
  }

  async filterRulesByColumn(
    rules: RulesInScan[],
    redis: any,
    host,
    mysqlName,
    column: string,
  ) {
    const ruleWillUse: RulesInScan[] = [];
    for (const item of rules) {
      //因为scanRange中包含多个范围,这里要遍历每个对象
      const scanRangeArr: ScanRangeType[] = JSON.parse(
        JSON.stringify(item.scan_range),
      );

      if (scanRangeArr.length !== 0) {
        /**
         * 这里记录两个内容，一个是为了最后保留这个规则吗，一个是为了，范围已经被命中过就不再使用了
         */

        //用来记录每条表名名记录是否被保留
        const isRetainTableName = true;
        //用来记录每条列名记录是否被保留
        let isRetainColumn = true;

        //设置标志用来记录当前字段是否已经命中-表名
        const isTableNamesFlag = false;
        //设置标志用来记录当前字段是否已经命中-列名
        let isColumnFlag = false;

        /**
           * item:{ assetTypes: 2,matchingConditions: [ { object: 1, content: 'sensitive_rules', condition: 1 } ]}
      }
           */
        // 用来便利一条规则中的所有内容
        for (const i in scanRangeArr) {
          //ToDo:先判断assetTypes,判断资产类型,其他的类型后续支持
          const item = scanRangeArr[i];
          const assetTypes = item.assetTypes;
          const matchingConditionsArr = item.matchingConditions;

          switch (assetTypes) {
            //此时是mysql数据库
            case ASSETTYPE.MYSQl:
              for (const iterator of matchingConditionsArr) {
                const object = iterator.object;
                const condition = iterator.condition;
                const content = iterator.content;

                switch (object) {
                  //列名称
                  case OBJCTTYPE.COLUMN:
                    // 遍历所有的数据

                    const resData3 = filterRuleTool(
                      isColumnFlag,
                      condition,
                      content,
                      column,
                      isRetainColumn,
                    );

                    isRetainColumn = resData3.isRetain;
                    isColumnFlag = resData3.isTagFlag;
                    // console.log('列扫描之后', isRetainColumn, isColumnFlag);
                    if (isColumnFlag) {
                      break;
                    }

                    break;
                }
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

        //当这条规则里边的范围走完，看是否满足里边的内容才能被保留
        if (isRetainTableName && isRetainColumn) {
          ruleWillUse.push(item);
        }
      } else {
        ruleWillUse.push(item);
      }
    }

    return ruleWillUse;
  }
}
