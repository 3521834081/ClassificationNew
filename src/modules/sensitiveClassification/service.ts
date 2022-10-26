import { Injectable } from '@nestjs/common';
import { classification, Prisma } from '@prisma/client';
import { title } from 'process';
import { CreateSensitiveClassificationInput } from 'src/graphql.schema';
import { PrismaService } from 'src/prisma.service';
import ArrTool from 'src/utils/ArrTool';
import { TransferDate } from 'src/utils/TransferDate';
import { NewExpression } from 'ts-morph';

@Injectable()
export class SensitiveClassificationService {
  constructor(private prisma: PrismaService) { }
  // deleteByTemplateId(templateId, id) {
  //   throw new Error('Method not implemented.');
  // }
  async findRulePath(
    ruleId: number,
  ): Promise<{ pathIdArr: number[]; pathName: string }> {
    let pathIdArr: number[] = [];
    let pathName: string[] = [];
    // 得到规则的父节点，将其放入pathIdArr
    const rule = await this.prisma.sensitive_rules.findUnique({
      where: { id: ruleId },
    });
    if (!rule) throw new Error('规则为空');
    const classificationId = rule.sensitive_classification_id;

    const ruleFatherClassification =
      await this.prisma.classification.findUnique({
        where: { id: classificationId },
      });
    if (!ruleFatherClassification) throw new Error('该规则没有父节点');
    //得到其父节点的层次，只用遍历其父节点以上的depth就可以了
    const ruleFatherClassificationDepth = ruleFatherClassification.depth;
    let classificationParentId = ruleFatherClassification.parent_id;
    pathIdArr.push(classificationId);
    pathName.push(ruleFatherClassification.title);
    //得到所有分类，并且将其分类按照深度进行处理
    const templateObject = await this.prisma.classification_template.findFirst({
      where: { is_use: 1 },
    });
    const classifications = await this.prisma.classification.findMany({
      where: {
        AND: [
          { classification_template_id: templateObject.id },
          {
            depth: { lt: ruleFatherClassificationDepth },
          },
        ],
      },
      orderBy: {
        depth: 'asc',
      },
    });

    //建立map用来存储每一层的分类
    const childrenIdMap = new Map<number, classification[] | []>();
    //将所有的分类按照深度进行分层，并存储到childrenIdMap
    for (let i = 1; i < ruleFatherClassificationDepth; i++) {
      const childrenIdArr: number[] = [];
      const childrenIdObject: classification[] = [];
      //将符合层级的id放入childrenArr
      for (const iterator of classifications) {
        if (i == iterator.depth) {
          childrenIdObject.push(iterator);
        }
      }

      childrenIdMap.set(i, childrenIdObject);
    }

    //从最后一层开始取值
    for (let i = ruleFatherClassificationDepth - 1; i >= 1; i--) {
      const depthClassificationArr = childrenIdMap.get(i);

      let depthClassification: classification | undefined | null;
      if (depthClassificationArr.length !== 0) {
        depthClassification = depthClassificationArr.find(
          (item: classification) => {
            return item.id === classificationParentId;
          },
        );

        //如果这一层就有规则的父节点
        if (depthClassification) {
          pathIdArr.push(depthClassification.id);
          if (depthClassification.title) {
            pathName.push(depthClassification.title);
          }

          classificationParentId = depthClassification.parent_id;
        }
      } else {
      }
    }

    pathIdArr = pathIdArr.reverse();
    pathName = pathName.reverse();
    const pathNameString = ArrTool.ArrUnique(pathName, '/');
    return { pathIdArr, pathName: pathNameString };
  }
  /**
   *
   * @param id 要删除的分类的id
   * @param TemplateId : 可以为空 模版的id
   * @returns
   */
  async deleteById(
    id: number,
    TemplateId?: number | null | undefined,
  ): Promise<boolean> {
    let deleteSuccess = true;
    //1.找到当前id的记录，以及他的层级

    //将要删除的数组
    let willDeleteIdArr: number[] | [] = [id];
    //得到当前节点的对象，以方便得到深度
    const classificationParent = await this.prisma.classification.findUnique({
      where: { id: id },
    });
    if (!classificationParent) {
      throw new Error('当前模版不存在');
    }
    //  当传入templateId进来的时候，得到内容
    if (!TemplateId) {
      const templateObject =
        await this.prisma.classification_template.findFirst({
          where: { is_use: 1 },
        });
      TemplateId = templateObject.id;
    }
    // 得到所有比当前父节点深度大的点
    const groupDepthsClassification = await this.prisma.classification.findMany(
      {
        where: {
          AND: [
            { depth: { gt: classificationParent.depth } },
            {
              classification_template_id: TemplateId,
            },
          ],
        },
        orderBy: {
          depth: 'asc',
        },
      },
    );

    //ToDo：还有下一层级的时候，当前节点不是叶子节点时
    if (groupDepthsClassification.length !== 0) {
      //因为倒序得到的数据，这样能知道最后一级是多少
      const lastClassification =
        groupDepthsClassification[groupDepthsClassification.length - 1];

      const depthLength = lastClassification.depth;

      //将所有的分类按照深度进行分层
      for (let i = classificationParent.depth + 1; i <= depthLength; i++) {
        let childrenIdArr: number[] = [];
        let childrenIdObject: classification[] = [];
        //将符合层级的id放入childrenArr
        for (const iterator of groupDepthsClassification) {
          if (i == iterator.depth) {
            childrenIdObject.push(iterator);
          }
        }

        // 当这一层没有内容的时候下边就没有数据了，跳出循环，不进行执行了;
        if (childrenIdObject.length === 0) {
          break;
        }
        //如果当前层级还有节点那就看当前节点是挂载在哪棵树的
        for (const iterator of willDeleteIdArr) {
          childrenIdObject.map((item) => {
            if (item.parent_id === iterator) {
              childrenIdArr.push(item.id);

              return true;
            }
          });
        }

        childrenIdObject = [];
        //当前边节点在当前层没有子节点了
        if (childrenIdArr.length === 0) {
          break;
        } else {
          willDeleteIdArr = willDeleteIdArr.concat(childrenIdArr);
          childrenIdArr = [];
        }
      }
    }

    //得到要删除的规则id数组
    const ruleObjects = await this.prisma.sensitive_rules.findMany({
      where: { sensitive_classification_id: { in: willDeleteIdArr } },
    });
    const ruleIds: number[] = ruleObjects.map((item) => item.id);

    //没有 处理删除事务
    const deleteModelAndRules = this.prisma.modelandrules.deleteMany({
      where: { sensitive_rules_id: { in: ruleIds } },
    });
    const deleteRules = this.prisma.sensitive_rules.deleteMany({
      where: { id: { in: ruleIds } },
    });
    const deleteClassification = this.prisma.classification.deleteMany({
      where: { id: { in: willDeleteIdArr } },
    });
    const transactionRes = await this.prisma.$transaction([
      deleteModelAndRules,
      deleteRules,
      deleteClassification,
    ]);

    if (transactionRes[2].count === 0) {
      deleteSuccess = false;
    }
    return deleteSuccess;
  }
  async createManys(
    data: CreateSensitiveClassificationInput[],
  ): Promise<{ count: number }> {
    //获取模板id,is_use为1的
    const templateObject = await this.prisma.classification_template.findFirst({
      where: { is_use: 1 },
    });
    const newClassificationArr: Prisma.classificationCreateInput[] = [];
    for (const item of data) {
      const newClassification: Prisma.classificationCreateInput = {
        depth: 0,
        create_time: '',
        update_time: '',
      };
      const parentClassificationObject =
        await this.prisma.classification.findFirst({
          where: { id: item.parentKey },
        });
      newClassification.parent_id = item.parentKey;
      newClassification.title = item.title;
      newClassification.classification_template_id = templateObject.id;
      newClassification.depth = parentClassificationObject.depth + 1;
      newClassification.create_time = TransferDate.parseISOLocal();
      newClassification.update_time = TransferDate.parseISOLocal();

      newClassificationArr.push(newClassification);
    }
    const result = await this.prisma.classification.createMany({
      data: newClassificationArr,
    });

    return result;
  }

  async updataOne(input: {
    id: number;
    title: string;
  }): Promise<classification> {
    const updataResult = await this.prisma.classification.update({
      where: { id: input.id },
      data: { title: input.title },
    });
    const updataReturn = await this.prisma.classification.findUnique({
      where: { id: input.id },
    });
    return updataReturn;
  }
  async createOne(data: {
    parentKey: number;
    title: string;
  }): Promise<classification> {
    const newClassification: Prisma.classificationCreateInput = {
      depth: 0,
      create_time: '',
      update_time: '',
    };
    //获取模板id,is_use为1的
    const templateObject = await this.prisma.classification_template.findFirst({
      where: { is_use: 1 },
    });

    const parentClassificationObject =
      await this.prisma.classification.findFirst({
        where: { id: data.parentKey },
      });

    newClassification.parent_id = data.parentKey;
    newClassification.title = data.title;
    newClassification.classification_template_id = templateObject.id;
    newClassification.depth = parentClassificationObject.depth + 1;
    newClassification.create_time = TransferDate.parseISOLocal();
    newClassification.update_time = TransferDate.parseISOLocal();

    const createReturnData = await this.prisma.classification.create({
      data: newClassification,
    });

    return createReturnData;
  }
  /**
   * 根据模版id找到模型
   * @param id
   * @returns
   */
  async findByTemplateIsUse(): Promise<classification[] | []> {
    const classificationTemplate =
      await this.prisma.classification_template.findFirst({
        where: {
          is_use: 1,
        },
      });
    return this.prisma.classification.findMany({
      where: { classification_template_id: classificationTemplate.id },
    });
  }
}
