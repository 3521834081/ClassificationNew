enum MatchingRules {
  Equal = 1, //当规则为相等匹配时
  Regular = 2, //当规则为正则匹配时
  Prefix = 3, //当规则为前缀匹配时
  Suffix = 4, // 当规则为后缀匹配时
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
export default function filterRuleTool(
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
 *  当传入的tag是数组形式的时候我们执行的方式
 * @param isTagFlag  :该条范围是否已经被命中
 * @param condition ：匹配条件
 * @param content ：范围内容
 * @param tag ：匹配 可以为tableNames，column
 * @param isRetain ：初始值为ture，为保留
 * @returns  返回是否保留
 */
export function filterRuleToolUseMany(
  isTagFlag: boolean,
  condition,
  content,
  tagArr: any[],
  isRetain: boolean,
) {
  //当已经被命中，则直接跳出下边的匹配

  if (isTagFlag) return { isRetain, isTagFlag };
  //  condition:匹配条件

  switch (condition) {
    //相等匹配时
    case MatchingRules.Equal:
      const patt1 = new RegExp(content);
      const result1 = tagArr.find((item) => {
        return patt1.test(item);
      });

      if (result1 !== undefined) {
        //为真：此时说明在扫描范围中，将命中标志设置为true
        isTagFlag = true;
        isRetain = true;
      } else {
        isRetain = false;
      }

      break;

    //正则匹配时
    case MatchingRules.Regular:
      //新建正则匹配对象
      const patt2 = new RegExp(content);
      const result2 = tagArr.find((item) => {
        return patt2.test(item);
      });

      if (result2 !== undefined) {
        //为真：此时说明在扫描范围中，将命中标志设置为true
        isTagFlag = true;
        isRetain = true;
      } else {
        isRetain = false;
      }

      break;

    //前缀匹配时
    case MatchingRules.Prefix:
      //进行数组切割,得到多个值
      const contentArr3: [] = content.split('|');
      const patt3 = new RegExp(`^${content}`);

      const inScanRange3 = contentArr3.find((element) => {
        //这条匹配规则在当前的数组里是否匹配到了
        const result = tagArr.find((item) => {
          return patt3.test(item);
        });
        //如果匹配到了
        if (result !== undefined) {
          return true;
        }
      });

      if (inScanRange3 !== undefined) {
        //为真：此时说明在扫描范围中，将命中标志设置为true
        isTagFlag = true;
        isRetain = true;
      } else {
        isRetain = false;
      }

      break;

    //后缀匹配时
    case MatchingRules.Suffix:
      //进行数组切割,得到多个值
      const contentArr4: [] = content.split('|');
      const patt4 = new RegExp(`${content}$`);

      const inScanRange4 = contentArr4.find((element) => {
        //这条匹配规则在当前的数组里是否匹配到了
        const result = tagArr.find((item) => {
          return patt4.test(item);
        });
        //如果匹配到了
        if (result !== undefined) {
          return true;
        }
      });
      if (inScanRange4 !== undefined) {
        //为真：此时说明在扫描范围中，将命中标志设置为true
        isTagFlag = true;
        isRetain = true;
      } else {
        isRetain = false;
      }

      break;
  }

  isTagFlag = isTagFlag;
  return { isRetain, isTagFlag };
}
