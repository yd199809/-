import { isObject } from "@vue/shared";
import { activeSub } from "./effect";
import { Link, link } from "./system";

export function reactive(target) {
  return createReactiveObject(target);
}

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
  /**
   * 创建 target 的代理对象
   */
  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      /**
       * 收集依赖 绑定 target 中某一个 key 和 sub 之间的关系
       */
      // TODO receiver
      console.log("get", target, key);

      track(target, key);

      return Reflect.get(target, key);
    },
    set(target, key, newValue, receiver) {
      /**
       *触发更新 set 的时候，通知之前收集的依赖 重新执行
       */
      console.log("set", target, key, newValue);

      trigger(target, key);

      return Reflect.set(target, key, newValue);
    },
  });
  return proxy;
}

/**
 * 绑定 target 的 key 关联的所有的 Dep
 * obj= {a:0}
 * targetMap={
 *  [obj]:{
 *   a:Dep,
 *   b:Dep
 *  }
 * }
 */
const targetMap = new WeakMap();

function track(target, key) {
  if (!activeSub) {
    return;
  }

  /**
   * 找 depsMap={
   *   a:Dep,
   *   b:Dep
   * }
   */

  let depsMap = targetMap.get(target);

  if (!depsMap) {
    /**
     * 没有 depsMap 就是之前没有收集过这个对象的任何 key
     * 那就创建一个新的，保存 target 和 depsMap 之间的关联关系
     */
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  /**
   * 找 dep => Deps
   */
  let dep = depsMap.get(key);
  if (!dep) {
    /**
     * 第一次收集这个对象，没找到，创建一个新的，并且保存到 depsMap 中
     */
    dep = new Dep();
    depsMap.set(key, dep);
  }

  link(dep, activeSub);

  console.log("dep", dep);
}

function trigger(target, key) {}

class Dep {
  /**
   * 订阅者链表的头节点
   */
  subs: Link;

  /**
   * 订阅者链表的尾节点
   */
  subsTail: Link;
  constructor() {}
}
