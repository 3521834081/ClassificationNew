// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { resources_info } from '@prisma/client';
import {
  CreateResourceInfoInput,
  DeleteCount,
  DeleteResourceInfosInput,
  ResourceInfo,
  ResourceInfoResult,
  UpdateResourceInfoInput,
} from 'src/graphql.schema';
import { ServerResourceService } from './server-resource.service';
import { TransferDate } from 'src/utils/TransferDate';

@Resolver('ResourceInfo')
export class ServerResourceResolver {
  constructor(private serverResourceService: ServerResourceService) { }
  /**
   * 按id查询一条服务器信息
   * 返回服务器信息
   * @param {number} id
   * @returns {*} {Promise<resources_info>}
   * @memberof ServerResourceResolver
   */
  @Query('resourceInfo')
  async getById(
    @Args('id')
    id: number,
  ): Promise<resources_info> {
    const getResourceInfo = await this.serverResourceService.findById({
      id,
    });
    const resources_info = {
      ...getResourceInfo,
      createTime: getResourceInfo.create_time,
      updateTime: getResourceInfo.update_time,
    };

    return resources_info;
  }
  /**
   * 按分页查询符合条件的服务器信息
   * 返回分页指定数量及符合条件的服务器信息
   * @param {*} id
   * @param {*} instance
   * @param {*} instanceAlias
   * @param {*} region
   * @param {*} province
   * @param {*} authorizedDatabase
   * @param {*} describe
   * @param {*} skip
   * @param {*} take
   * @returns {*} {Promise<ResourceInfoResult>}
   * @memberof ServerResourceResolver
   */
  @Query('resourceInfos')
  async getByOutId(
    @Args('id')
    id,
    @Args('instance')
    instance,
    @Args('instanceAlias')
    instanceAlias,
    @Args('region')
    region,
    @Args('province')
    province,
    @Args('authorizedDataBase')
    authorizedDatabase,
    @Args('describe')
    describe,
    @Args('skip')
    skip,
    @Args('take')
    take,
  ): Promise<ResourceInfoResult> {
    console.log('服务器资源执行了!');
    const getResources = await this.serverResourceService.findByOutId(
      {
        id,
        instance,
        instanceAlias,
        region,
        province,
        authorizedDatabase,
        describe,
      },
      { skip, take },
    );
    const resources = getResources.data.map((item) => ({
      ...item,
      sqlinfo: this.serverResourceService.getAuthorizedDb(item.id),
    }));
    const total = getResources.total;
    const resourceInfosResult = {
      data: resources,
      total,
    };
    return resourceInfosResult;
  }

  /**
   *创建一个服务器信息
   *返回创建后的服务器信息
   * @param {CreateResourceInfoInput} args
   * @returns {*} {Promise<ResourceInfo>}
   * @memberof ServerResourceResolver
   */
  @Mutation('createResourceInfo')
  async createOne(
    @Args('createResourceInfoInput')
    args: CreateResourceInfoInput,
  ): Promise<ResourceInfo> {
    const bool = await this.serverResourceService.findByOutId({
      instance: args.instance,
    });
    if (bool.data[0]) {
      throw new Error('服务器已存在');
    } else {
      const createOne = await this.serverResourceService.createOne({
        instance: args.instance,
        instanceAlias: args.instanceAlias,
        region: args.region,
        province: args.province,
        authorizedDatabase: args.authorizedDatabase,
        describe: args.describe,
        create_time: TransferDate.parseISOLocal(),
        update_time: TransferDate.parseISOLocal(),
      });
      return createOne;
    }
  }

  /**
   * 删除指定id的服务器信息
   * 返回删除后的服务器信息
   * @param {number} id
   * @returns {*} {Promise<ResourceInfo>}
   * @memberof ServerResourceResolver
   */
  @Mutation('deleteResourceInfo')
  async deleteOne(
    @Args('id')
    id: number,
  ): Promise<ResourceInfo> {
    const selfdb = await this.serverResourceService.findSelf_db({
      id,
    });
    if (selfdb.data.length == 0) {
      return await this.serverResourceService.deleteOne({
        id,
      });
    } else {
      throw new Error('服务器已被选用无法删除');
    }
  }
  /**
   * 更新指定id的服务器信息
   * 返回更新后的服务器信息
   * @param {number}id
   * @param {UpdateResourceInfoInput} args
   * @returns {*} {Promise<ResourceInfo>}
   * @memberof ServerResourceResolver
   */
  @Mutation('updateResourceInfo')
  async updateOne(
    @Args('id')
    id: number,
    @Args('updateResourceInfoInput')
    args: UpdateResourceInfoInput,
  ): Promise<ResourceInfo> {
    const updateOne = await this.serverResourceService.updateOne(
      {
        id,
      },
      {
        instance: args.instance,
        instanceAlias: args.instanceAlias,
        region: args.region,
        province: args.province,
        authorizedDatabase: args.authorizedDatabase,
        describe: args.describe,
        update_time: TransferDate.parseISOLocal(),
      },
    );
    return updateOne;
  }
  /**
   * 删除筛选后的服务器信息
   * 返回删除的服务器条数
   * @param {DeleteResourceInfosInput} args
   * @returns {*} {Promise<DeleteCount>}
   * @memberof ServerResourceResolver
   */
  @Mutation('deleteResourceInfos')
  async deleteMany(
    @Args('deleteResourceInfosInput')
    args: DeleteResourceInfosInput[],
  ): Promise<DeleteCount> {
    for (let i = 0; i < args.length; i++) {
      await this.serverResourceService.deleteMany({
        where: {
          id: args[i].id,
        },
      });
    }
    return { count: args.length };
  }
  /**
   * 批量删除选中的服务器信息
   * 返回删除的服务器条数
   * @param {number[]} id
   * @returns {*} {Promise<DeleteCount>}
   * @memberof ServerResourceResolver
   */
  @Mutation('deleteResources')
  async deleteManyR(
    @Args('id')
    id: number[],
  ): Promise<DeleteCount> {
    for (let i = 0; i < id.length; i++) {
      await this.serverResourceService.deleteOne({ id: id[i] });
    }
    return { count: id.length };
  }
}
