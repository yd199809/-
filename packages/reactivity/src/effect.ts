// 用来保存当前正在执行的effect
export let activeSub;

export class ReactiveEffect {
  constructor(public fn: () => void) {}
  run() {
    // 先将当前的 effect 保存起来 用于处理嵌套的逻辑
    const prevSub = activeSub;
    // 每次执行fn之前 把this 放到 activeSub上
    activeSub = this;
    try {
      return this.fn();
    } finally {
      // 执行完毕后 恢复
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
}

export function effect(fn: () => void, options?: any) {
  const e = new ReactiveEffect(fn);
  // scheduler
  Object.assign(e, options);

  e.run();

  const runner = e.run.bind(e);

  // 把 effect 的属性放到函数的属性中
  runner.effect = e;

  return runner;
}
