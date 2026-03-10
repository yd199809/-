import { isObject } from "@vue/shared";

import { mutableHandles } from "./baseHandlers";
export function reactive(target) {
  return createReactiveObject(target);
}

/**
 * 保存 target 和响应式对象之间的关联关系
 * target => proxy
 */
const reactiveMap = new WeakMap();
// 保存所有 reactive 创建的代理对象
const reactiveSet = new WeakSet();
function createReactiveObject(target) {
  /**
   * reactive 必须接收一个对象
   */
  if (!isObject(target)) {
    /**
     * target不是对象
     */
    return target;
  }
  // 看一下这个 target 在不在reactiveSet 里面，如果在，就证明是一个代理对象，直接返回
  if (reactiveSet.has(target)) {
    return target;
  }
  // 获取到之前这个 target 创建的代理对象
  const existingProxy = reactiveMap.get(target);
  if (existingProxy) {
    // 如果这个 target 之前创建过代理对象，直接返回之前的
    return existingProxy;
  }

  /**
   * 创建 target 的代理对象
   */
  const proxy = new Proxy(target, mutableHandles);

  // 保存 target 和 proxy 之间的关联关系
  reactiveMap.set(target, proxy);
  // 保存所有 reactive 创建的代理对象到reactiveSet
  reactiveSet.add(proxy);
  return proxy;
}

// 判断 target 是不是响应式对象，只要在 reactiveSet 中，就证明是一个响应式对象
export function isReactive(target) {
  return reactiveSet.has(target);
}
