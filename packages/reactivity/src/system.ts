import { ReactiveEffect } from "./effect";
// 依赖项
interface Dependency {
  // 订阅者链表的头节点
  subs: Link | undefined;
  // 订阅者链表的尾节点
  subsTail: Link | undefined;
}

interface Sub {
  tracking: any;
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
  dep: Dependency;
  // 下一个依赖项节点
  nextDep: Link | undefined;
}
let linkPool: Link;
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

  // 如果 activeSub有 就保存起来 更新时触发

  let newLink: Link;
  /**
   * 看一下 linkPool 有没有，如果有，就复用
   */
  if (linkPool) {
    newLink = linkPool;
    linkPool = linkPool.nextDep;
    newLink.nextDep = nextDep;
    newLink.dep = dep;
    newLink.sub = sub;
  } else {
    // 如果没有，就创建新的
    newLink = {
      sub,
      dep,
      nextDep,
      nextSub: undefined,
      prevSub: undefined,
    };
  }

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
 * 开始追踪依赖，将depsTail，尾节点设置为undefin
 * @param sub
 */
export function startTrack(sub) {
  sub.tracking = true;
  sub.depsTail = undefined;
}

/**
 * 结束追踪，找到需要清理的依赖，断开关联关系
 * @param sub
 */
export function endTrack(sub) {
  sub.tracking = false;
  const depsTail = sub.depsTail;
  /**
   * depsTail有，并且depsTail还有nextDep，应该把它们的依赖关系清理掉
   * depsTail没有，并且还有头节点，那就全部清理
   */
  if (depsTail) {
    if (depsTail.nextDep) {
      clearTracking(depsTail.nextDep);
      depsTail.nextDep = undefined;
    }
  } else if (sub.deps) {
    clearTracking(sub.deps);
    sub.deps = undefined;
  }
}
/**
 * 清理依赖关系
 * @param link
 */
export function clearTracking(link: Link) {
  while (link) {
    const { prevSub, nextSub, nextDep, dep } = link;

    /**
     * 如果 prevSub 有，那就把 prevSub 的下一个节点，指向当前节点的下一个
     * 如果没有，那就是头节点，那就把 dep.subs 指向当前节点的下一个
     */

    if (prevSub) {
      prevSub.nextSub = nextSub;
      link.nextSub = undefined;
    } else {
      dep.subs = nextSub;
    }

    /**
     * 如果下一个有，那就把 nextSub 的上一个节点，指向当前节点的上一个节点
     * 如果下一个没有，那它就是尾节点，把 dep.depsTail 指向上一个节点
     */
    if (nextSub) {
      nextSub.prevSub = prevSub;
      link.prevSub = undefined;
    } else {
      dep.subsTail = prevSub;
    }

    link.dep = link.sub = undefined;
    /**
     * 不要的节点给 linkPool 让它去复用
     */
    link.nextDep = linkPool;
    linkPool = link;
    link = nextDep;
  }
}

/**
 * 通知effect更新 触发subs 拿到最新的值
 * @param subs
 */
export function propagate(subs: Link | undefined) {
  //通知 effect 更新 触发subs 拿到最新的值
  let link = subs;
  let queuedEffects = [];
  while (link) {
    const sub = link.sub;
    if (!sub.tracking) {
      queuedEffects.push(link.sub);
    }

    link = link.nextSub;
  }
  queuedEffects.forEach((effect) => effect.notify());
}
