import { ReactiveEffect } from "./effect";

// 链表节点
export interface Link {
  // 保存 effect
  sub: ReactiveEffect;
  // 下一个节点
  nextSub: Link | undefined;
  // 上一个节点
  prevSub: Link | undefined;
}

/**
 *链接链表关系
 */
export function link(dependent: any, sub: ReactiveEffect) {
  // 如果有 就保存起来 更新时触发
  const newLink: Link = {
    sub,
    nextSub: undefined,
    prevSub: undefined,
  };
  /**
       关联链表关系
       1：如果有尾节点就在尾节点后面添加
       2：没有尾节点 就是头节点
       */
  if (dependent.subsTail) {
    dependent.subsTail!.nextSub = newLink;
    newLink.prevSub = dependent.subsTail;
    dependent.subsTail = newLink;
  } else {
    dependent.subs = newLink;
    dependent.subsTail = newLink;
  }
}

/**
 * 通知effect更新 触发subs 拿到最新的值
 * @param subs
 */
export function propagete(subs: Link | undefined) {
  //通知effect更新 触发subs 拿到最新的值
  let link = subs;
  let queuedEffects = [];
  while (link) {
    queuedEffects.push(link.sub);
    link = link.nextSub;
  }
  queuedEffects.forEach((effect) => effect.notify());
}
