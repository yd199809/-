import { ReactiveEffect } from "./effect";
// 依赖项
interface Dep {
  // 订阅者链表的头节点
  subs: Link | undefined;
  // 订阅者链表的尾节点
  subsTail: Link | undefined;
}

interface Sub {
  // 依赖项链表的头节点
  deps: Link | undefined;
  // 依赖项链表的尾节点
  depsTail: Link | undefined;
}

// 链表节点
export interface Link {
  // 保存 effect
  sub: Sub;

  // 下一个订阅者节点
  nextSub: Link | undefined;
  // 上一个订阅者节点
  prevSub: Link | undefined;
  // 依赖项
  dep: Dep;
  // 下一个依赖项节点
  nextDep: Link | undefined;
}

/**
 *链接链表关系
 */
export function link(dep: any, sub: ReactiveEffect) {
  // 尝试复用链表节点
  const currentDep = sub.depsTail;
  // 分两种情况
  // 如果 sub.depsTail 没有 如果头节点sub.deps 有 尝试复用头节点
  // sub.depsTail 如果尾节点还有 nextDep 尝试复用尾节点的 nextDep
  const nextDep = currentDep === undefined ? sub.deps : currentDep.nextDep;
  // 尾节点没有 头节点有
  if (nextDep && nextDep.dep === dep) {
    sub.depsTail = nextDep;
    return;
  }

  // 如果有 就保存起来 更新时触发
  const newLink: Link = {
    sub,
    dep,
    nextSub: undefined,
    prevSub: undefined,
    nextDep: undefined,
  };

  /**
    将链表节点和 dep 建立关联关系   
    关联链表关系
    1：如果有尾节点就在尾节点后面添加
    2：没有尾节点 就是头节点
  */
  if (dep.subsTail) {
    dep.subsTail!.nextSub = newLink;
    newLink.prevSub = dep.subsTail;
    dep.subsTail = newLink;
  } else {
    dep.subs = newLink;
    dep.subsTail = newLink;
  }

  /**
    将链表节点和 sub 建立关联关系   
    关联链表关系
    1：如果有尾节点就在尾节点后面添加
    2：没有尾节点 就是头节点
  */

  if (sub.depsTail) {
    sub.depsTail.nextDep = newLink;
    sub.depsTail = newLink;
  } else {
    sub.deps = newLink;
    sub.depsTail = newLink;
  }
}

/**
 * 通知effect更新 触发subs 拿到最新的值
 * @param subs
 */
export function propagete(subs: Link | undefined) {
  //通知 effect 更新 触发subs 拿到最新的值
  let link = subs;
  let queuedEffects = [];
  while (link) {
    queuedEffects.push(link.sub);
    link = link.nextSub;
  }
  queuedEffects.forEach((effect) => effect.notify());
}
