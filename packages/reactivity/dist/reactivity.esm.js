// packages/reactivity/src/effect.ts
var activeSub;
var ReactiveEffect = class {
  constructor(fn) {
    this.fn = fn;
  }
  run() {
    const prevSub = activeSub;
    activeSub = this;
    try {
      return this.fn();
    } finally {
      activeSub = prevSub;
    }
  }
  // 通知更新的方法 如果依赖的数据发生了变化 会调用这个函数
  notify() {
    this.scheduler();
  }
  // 默认调用 run 如果用户传了 就以用户的为准 示例属性优先级高于原型属性
  scheduler() {
    this.run();
  }
};
function effect(fn, options) {
  const e = new ReactiveEffect(fn);
  Object.assign(e, options);
  e.run();
  const runner = e.run.bind(e);
  runner.effect = e;
  return runner;
}

// packages/reactivity/src/system.ts
function link(dependent, sub) {
  const newLink = {
    sub,
    nextSub: void 0,
    prevSub: void 0
  };
  if (dependent.subsTail) {
    dependent.subsTail.nextSub = newLink;
    newLink.prevSub = dependent.subsTail;
    dependent.subsTail = newLink;
  } else {
    dependent.subs = newLink;
    dependent.subsTail = newLink;
  }
}
function propagete(subs) {
  let link2 = subs;
  let queuedEffects = [];
  while (link2) {
    queuedEffects.push(link2.sub);
    link2 = link2.nextSub;
  }
  queuedEffects.forEach((effect2) => effect2.notify());
}

// packages/reactivity/src/ref.ts
var RefImpl = class {
  //保存实际的值
  _value;
  // ref标记 证明是一个ref
  __v_isRef = true;
  /**
   * 订阅者链表的头节点
   */
  subs;
  /**
   * 订阅者链表的尾节点
   */
  subsTail;
  constructor(value) {
    this._value = value;
  }
  get value() {
    console.log("\u6709\u4EBA\u8BBF\u95EE\u4E86", activeSub);
    if (activeSub) {
      trackRef(this);
    }
    return this._value;
  }
  set value(newValue) {
    console.log("\u89E6\u53D1\u4FEE\u6539\u4E86");
    this._value = newValue;
    triggerRef(this);
  }
};
function ref(value) {
  return new RefImpl(value);
}
function isRef(value) {
  return !!(value && value["__v_isRef" /* IS_REF */]);
}
function trackRef(dependent) {
  if (activeSub) {
    link(dependent, activeSub);
  }
}
function triggerRef(dependent) {
  if (dependent.subs) {
    propagete(dependent.subs);
  }
}
export {
  ReactiveEffect,
  activeSub,
  effect,
  isRef,
  ref,
  trackRef,
  triggerRef
};
//# sourceMappingURL=reactivity.esm.js.map
