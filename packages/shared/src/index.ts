export function isObject(value) {
  return typeof value === "object" && value != null;
}

/**
 * 判断值也没有发生过变化
 * @param newValue 新值
 * @param oldValue 老值
 * @returns
 */
export function hasChanged(newValue, oldValue) {
  return !Object.is(newValue, oldValue);
}
