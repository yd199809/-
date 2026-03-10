import { track, trigger } from "./dep";
import { hasChanged, isObject } from "@vue/shared";
import { isRef, reactive } from "vue";
export const mutableHandles = {
  get(target, key, receiver) {
    /**
     * 收集依赖 绑定 target 中某一个 key 和 sub 之间的关系
     */

    track(target, key);
    const res = Reflect.get(target, key, receiver);
    if (isRef(res)) {
      // 如果 target.a 是一个 ref 就直接把值赋给它，不要让它.value

      return res.value;
    }
    if (isObject(res)) {
      return reactive(res);
    }

    return res;
  },
  set(target, key, newValue, receiver) {
    const oldValue = target[key];
    /**
     *触发更新 set 的时候，通知之前收集的依赖 重新执行
     */
    const res = Reflect.set(target, key, newValue, receiver);
    // 如果更新了 state.a 就会修改原始的 ref.value 的值 就是newValue
    // 如果 newValue 是一个 ref 那就算了
    if (isRef(oldValue) && !isRef(newValue)) {
      oldValue.value = newValue;
      return res;
    }

    if (hasChanged(newValue, oldValue)) {
      /**
       * 新值老值不一样才触发更新
       * 先 set 再通知 sub 重新执行
       */
      trigger(target, key);
    }
    return res;
  },
};
