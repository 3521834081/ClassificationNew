import { dbReturnData } from 'src/modules/recognizeMonitor/dto/dto';

const mysql = require('mysql');

export default class MysqlUntil {
  pool: any;

  constructor() {}
  //执行单挑查询方法
  MysqlUtilLogin(host, port, user, password, database, sql): any {
    const connection = mysql.createConnection({
      host: host,
      user: user,
      password: password,
      database: database,
      port: port,
    });

    connection.connect();

    //执行sql语句：

    return new Promise((resolve, reject) => {
      //执行sql语句：
      connection.query(sql, (err, data) => {
        //需求：返回data
        if (err) {
          //失败
          resolve([false, err]);
        } else {
          //成功
          resolve([true, data]);
          if (sql === 'SELECT 1') {
            connection.end();
          }
        }
      });
    });
  }

  //    执行sql查询方法
  MysqlQuery(sql: string) {
    return new Promise<dbReturnData>((resolve) => {
      this.pool.getConnection((err, conn) => {
        if (err) {
          resolve(err);
        } else {
          conn.query(sql, (eerr, result, fields) => {
            //释放连接
            conn.release();
            let res: dbReturnData;
            if (eerr) {
              switch (eerr.code) {
                case 'ER_DUP_ENTRY': {
                  res = {
                    code: eerr.sqlState,
                    msg: '字段值重复',
                  };
                  break;
                }
                default: {
                  res = {
                    code: eerr.sqlState,
                    msg: eerr.message,
                  };
                  break;
                }
              }
              resolve(res);
            } else {
              const dataR = JSON.parse(JSON.stringify(result));

              const res = {
                code: 0,
                msg: 'SUCCESS',
                data: dataR,
              };
              resolve(res);
            }
          });
        }
      });
    });
  }

  //创建连接池
  MysqlPoolsLogin(host, port, user, password, database) {
    this.pool = mysql.createPool({
      host: host,
      port: port,
      user: user,
      password: password,
      database: database,
    });
  }

  //删除连接池
  MysqlPoolsDel() {
    this.pool.end((err, res) => {});
  }
}
