import { Prisma } from '@prisma/client';
/**
 * 分类树相关工具函数
 *
 * @export
 * @class ClassTreeTools
 */
export class ClassTreeTools {
  /**
   * 递归处理所有树节点，传入树节点根节点数组，和处理函数。
   * 其中处理函数参数为树节点元素，返回值为处理后的树节点元素
   * @static
   * @param {Prisma.JsonValue} treeNode 树根节点数组，json格式
   * @param {(value: Prisma.JsonValue) => Prisma.JsonValue} [fn] 处理函数,
   * 参数为当前节点，返回处理后的节点
   * @return {Prisma.JsonValue} treeNode 处理后的树，json格式
   * @memberof ClassTreeTools
   */
  public static dealWithNode(
    treeNode: Prisma.JsonValue,
    fn: (value: Prisma.JsonValue) => Prisma.JsonValue,
  ): Prisma.JsonValue {
    const list: any[] = [];
    (treeNode as any[]).forEach((element) => {
      if (element['children']) {
        element['children'] = this.dealWithNode(element['children'], fn);
      }
      const getElement = fn(element);
      list.push(getElement);
    });
    return list;
  }
  /**
   * 递归判断所有树节点，传入树节点根节点数组，和判断函数。
   * 自顶向下递归判断，只要出现符合函数要求的节点则直接返回此节点
   *
   * @static
   * @param {Prisma.JsonValue} treeNode 树根节点数组，json格式
   * @param {(value: Prisma.JsonValue) => boolean} fn 处理函数,
   * 参数为当前节点，返回是否符合条件
   * @return {boolean} 是否存在符合条件节点
   * @memberof ClassTreeTools
   */
  public static findNode(
    treeNode: Prisma.JsonValue,
    fn: (value: Prisma.JsonValue) => boolean,
  ): Prisma.JsonValue {
    for (const element of treeNode as any[]) {
      if (fn(element)) {
        return element;
      }
      if (element['children']) {
        return this.findNode(element['children'], fn);
      }
    }
    return null;
  }
}
