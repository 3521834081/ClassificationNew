// 并且返回指定的字符串,以,为分割服
export default class ArrTool {
  static ArrUnique(arr, symbol) {
    try {
      let arrWill: any[] = Array.from(new Set(arr));

      let arrToString: string;
      // console.log(
      //   'arrToStringarrToStringarrToStringarrToStringarrToStringarrWillarrWillarrWillarrWill',
      //   arrWill,
      // );

      if (arrWill.length !== 0) {
        let i = 1;
        for (const item of arrWill) {
          if (i === 1) {
            arrToString = item;
          } else {
            arrToString = arrToString + symbol + item;
          }
          i++;
        }
      } else {
        arrWill = [];
        arrToString = '[]';
      }
      if (typeof arrToString === 'number') return String(arrToString);

      return arrToString;
    } catch (error) {
      console.log('自定义处理数组出现问题', error);
    }
  }
  //数组去重
  static ArrDuplicateRemoval(arr) {
    const arrWill: any[] = Array.from(new Set(arr));

    return arrWill;
  }
}
