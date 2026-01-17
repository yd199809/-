import { activeSub } from "./effect";
import { link, propagete, Link } from "./system";

enum ReactiveFlags {
  IS_REF = "__v_isRef",
}

/**
 *  Ref 的类
 */
class RefImpl {
  //保存实际的值
  _value: unknown;
  // ref标记 证明是一个ref
  __v_isRef = true;

  /**
   * 订阅者链表的头节点
   */
  subs: Link | undefined;

  /**
   * 订阅者链表的尾节点
   */
  subsTail: Link | undefined;

  constructor(value) {
    this._value = value;
  }

  get value() {
    // 收集依赖
    if (activeSub) {
      trackRef(this);
    }
    return this._value;
  }
  set value(newValue) {
    this._value = newValue;
    triggerRef(this);
  }
}

export function ref(value) {
  return new RefImpl(value);
}

/**
 * 判断是不是一个ref
 */
export function isRef(value) {
  return !!(value && value[ReactiveFlags.IS_REF]);
}

/**
 * 收集依赖 建立 effect 与 ref 之间的链表关系
 * @param dep
 */
export function trackRef(dep: RefImpl) {
  if (activeSub) {
    link(dep, activeSub);
  }
}

/**
 * 触发依赖 ref 关联的 effect 重新执行
 * @param dep
 */
export function triggerRef(dep: RefImpl) {
  if (dep.subs) {
    propagete(dep.subs);
  }
}
