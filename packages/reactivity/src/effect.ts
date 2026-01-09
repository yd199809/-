// 用来保存当前正在执行的effect
export let activeSub;

export class ReactiveEffect {
  constructor(public fn: () => void) {}
  run() {
    // 每次执行fn之前 把this 放到 activeSub上
    activeSub = this;
    try {
      return this.fn();
    } finally {
      // 执行完毕后 把activeSub置为undefined
      activeSub = undefined;
    }
  }
}

export function effect(fn: () => void) {
  const e = new ReactiveEffect(fn);
  e.run();
}
