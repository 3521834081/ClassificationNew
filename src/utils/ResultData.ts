import { Int } from '@nestjs/graphql';

export interface ResultData {
  success: boolean;
  code: number;
  message: string;
  data?: JSON;
}

export class ResultDataUtILS {
  public static ok(
    success?: boolean,
    code?: number,
    message?: string,
    data?: JSON,
  ): ResultData {
    return {
      success: success === undefined ? true : success,
      code: code === undefined ? 20000 : code,
      message: message === undefined ? 'ok' : message,
      data: data,
    };
  }
  public static error(
    success?: boolean,
    code?: number,
    message?: string,
    data?: JSON,
  ): ResultData {
    return {
      success: success === undefined ? false : success,
      code: code === undefined ? 20001 : code,
      message: message === undefined ? 'error' : message,
      data: data,
    };
  }
}
