import Redis from 'ioredis';

//这里待解决的问题
// import  {redisConfig}  from '@/config/redis.cofig';

// redis单节点配置
const redisConfig = {
  port: 6379,
  host: '127.0.0.1',
  password: '', // 没有可不填
};
export class RedisInstance {
  static redis: Redis;
  static async initRedis(connectType?: string) {
    // if (connectType && connectType === 'cluster') {
    //   const cluster = new Redis.Cluster(redisClusterConfig);
    //   cluster.on('error', (err) => console.log('Redis cluster Error', err));
    //   cluster.on('connect', () => console.log('redis集群连接成功'));
    //   return cluster;
    // } else {

    //单个redis的使用
    const redisObject = new Redis(redisConfig);
    this.redis = redisObject;
    return redisObject;

    // }
  }
}
export function redisGetValue(key: string, redis: any) {
  return new Promise<any>((resolve, reject) => {
    redis.get(key).then((res) => {
      const tableDate = JSON.parse(res);
      resolve(tableDate);
    });
  });
}
