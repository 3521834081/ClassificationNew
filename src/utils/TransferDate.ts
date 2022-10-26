export class TransferDate {
  //将UTC时间转化为东八区时间
  public static parseISOLocal = (s?: any): Date => {
    let date: Date;
    if (s) {
      date = new Date(s);
      if (date.getHours() >= 0) {
        date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
      }
      const str = new Date(date).getTime();
      const str1 = new Date(str);
      return str1;
    } else {
      date = new Date();
      if (date.getHours() >= 0) {
        date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
      }
      const str = new Date(date).getTime();
      const str1 = new Date(str);
      return str1;
    }
    // return str1;
  };

  //将 中国时间date转化为时间字符串
  public static dataToTime(dateData) {
    const date = new Date(dateData);
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const h = date.getHours();
    const hm = date.getMinutes();
    const hs = date.getSeconds();
    const month = m >= 10 ? '' + m : '0' + m;
    const day = d >= 10 ? '' + d : '0' + d;
    const hour = h >= 10 ? '' + h : '0' + h;
    const minute = hm >= 10 ? '' + hm : '0' + hm;
    const second = hs >= 10 ? '' + hs : '0' + hs;
    const time =
      y + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    return time;
  }

  //将 UTC时间转化为时间字符串
  public static dataToUTCTime(dateData) {
    const date = new Date(dateData);
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getUTCDate();
    const h = date.getUTCHours();
    const hm = date.getUTCMinutes();
    const hs = date.getUTCSeconds();
    const month = m >= 10 ? '' + m : '0' + m;
    const day = d >= 10 ? '' + d : '0' + d;
    const hour = h >= 10 ? '' + h : '0' + h;
    const minute = hm >= 10 ? '' + hm : '0' + hm;
    const second = hs >= 10 ? '' + hs : '0' + hs;
    const time =
      y + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    return time;
  }
  //将时间转化为日期
  public static dateFormat(dateData: Date) {
    const y = dateData.getFullYear();
    const m = dateData.getMonth() + 1;
    const d = dateData.getUTCDate();
    const time = y + '-' + m + '-' + d;
    return time;
  }

  //减少八小时
  // public static parseISO = (s?: any) => {
  //   let date = undefined;
  //   if (s) {
  //     date = new Date(s);
  //   } else {
  //     date = new Date();
  //   }

  //   if (date.getHours() >= 0) {
  //     date.setHours(date.getHours() + date.getTimezoneOffset() / 60);
  //   }
  //   const str = new Date(date).getTime();
  //   const str1 = new Date(str);
  //   return str1;
  // };
}
