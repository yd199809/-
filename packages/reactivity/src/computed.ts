import { isFunction } from "@vue/shared";
import { ReactiveFlags, trackRef } from "./ref";
import { Dependency, Sub, Link, startTrack, endTrack } from "./system";
import { activeSub, setActiveSub } from "./effect";
import { link } from "./system";
class ComputedRefImpl implements Dependency, Sub {
  // computed 也是一个 ref ，所以要标记为isRef=true
  [ReactiveFlags.IS_REF] = true;
  // 保存 fn 的返回值
  _value: unknown;

  /**
   * 订阅者链表的头节点
   */
  subs: Link | undefined;

  /**
   * 订阅者链表的尾节点
   */
  subsTail: Link | undefined;
  // 依赖项链表的头节点
  deps: Link | undefined;
  // 依赖项链表的尾节点
  depsTail: Link | undefined;
  tracking = false;
  constructor(
    public fn,
    private setter,
  ) {}

  get value() {
    this.update();

    return this._value;
  }
  set value(newValue) {
    if (this.setter) {
      this.setter(newValue);
    } else {
      console.warn("我是只读的");
    }
  }
  update() {
    // 实现 sub 的功能，为了在执行 fn 期间，收集 fn 执行过程中访问到的响应式数据
    // 建立 dep 和 sub 之间的关联关系
    // 先将当前的 effect 保存起来 用于处理嵌套的逻辑
    const prevSub = activeSub;
    // 每次执行fn之前 把this 放到 activeSub上
    setActiveSub(this);
    startTrack(this);
    try {
      this._value = this.fn();
    } finally {
      endTrack(this);
      // 执行完毕后 恢复
      setActiveSub(prevSub);
    }
    console.log(this);
  }
}

/**
 * 计算属性
 * @param getterOrOptions 有可能是一个函数，也有可能是一个对象，是对象的话里面有 get 和 set 属性
 */

export function computed(getterOrOptions) {
  let getter;
  let setter;

  if (isFunction(getterOrOptions)) {
    /**
     * const c = computed(() => {}
     */
    getter = getterOrOptions;
  } else {
    /**
     * const c = computed({
     *  get() {},
     *  set() {}
     * })
     */
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }

  return new ComputedRefImpl(getter, setter);
}
