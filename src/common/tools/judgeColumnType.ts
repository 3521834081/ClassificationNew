// 用来存储扫描的数据类型
enum DataType {
  STRING = 'String',
  DECIMAL = 'Decimal',
  DATE = 'Date/Time',
  INTEGER = 'Integer',
}
//用来存储正则，
//   因为时间的正则有一点问题所以写在下边了
enum Regular {
  STRING = `^[\u4E00-\u9FA5A-Za-z0-9_]+$`,
  DECIMAL = `^[0-9]*(\.?)[0-9]*$`,
  INTEGER = '^[0-9]+$',
}

/**
 * 判断传入取样数组是什么内容,进行打标
 * @param columnArr
 */

export function determineColumnType(columnArr: any[]): string {
  const resultArr: string[] = [];
  //of在数组中使用直接输出值
  for (const item of columnArr) {
    // const valueObject = JSON.parse(JSON.stringify(item))
    const valueObject = item;
    //   console.log(valueObject);

    if (isInteger(valueObject)) {
      // console.log("这是个整数");
      resultArr.push(DataType.INTEGER);
      continue;
    }
    if (isString(valueObject)) {
      // console.log("这是个String");
      resultArr.push(DataType.STRING);
      continue;
    }

    if (isDecimal(valueObject)) {
      // console.log("这是个小数");
      resultArr.push(DataType.DECIMAL);
      continue;
    }
    if (isDate(valueObject)) {
      // console.log("这是个时间");
      resultArr.push(DataType.DATE);
      continue;
    }

    //    console.log("都没命中");

    //都没命中时默认为string

    resultArr.push(DataType.STRING);
  }
  const returnData = countingTool(resultArr);
  console.log(returnData);
  return returnData.result[returnData.index].key;
  //是否为整形
  function isInteger(valueObject: any): boolean {
    const patt = new RegExp(Regular.INTEGER);
    return patt.test(valueObject);
  }
  //是否为小数 Decimal
  function isDecimal(valueObject: any): boolean {
    const patt = new RegExp(Regular.DECIMAL);

    return patt.test(valueObject);
  }
  //是否为string
  function isString(valueObject: any): boolean {
    const patt = new RegExp(Regular.STRING);
    return patt.test(valueObject);
  }
  //是否为Date
  function isDate(valueObject: any): boolean {
    const patt = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/;
    return patt.test(valueObject);
  }
}

/*
 *
 * @param Arr :传入需要统计的的数组 []
 * @returns  返回[{key:"",count:}]，i:最大值的下标
 */
export function countingTool(Arr: any[]): {
  result: { key: any; count: number }[] | [];
  index: number;
} {
  const result: { key: any; count: number }[] = [];

  //去重得到几种类别
  const newArr = new Set(Arr);
  let i = 0;
  //记录数组频率出现最多的下标
  let max = 0;
  let max_index = 0;
  //  循环这几个类别的
  for (const item of newArr) {
    let count = 0;
    // 统计类别的个数
    Arr.forEach((name) => {
      if (item === name) {
        count++;
      }
    });

    result.push({
      key: item,
      count: count,
    });
    if (count > max) {
      max = count;
      max_index = i;
    }
    i++;
  }

  return { result, index: max_index };
}
