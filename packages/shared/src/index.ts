export function isObject(value) {
  return typeof value === 'object' && value !== null
}

/**
 * 判断值有没有发生过变化
 * @param newValue 新值
 * @param oldValue 老值
 * @returns 如果发生了变化返回true否则返回false
 */
export function hasChanged(newValue, oldValue) {
  return !Object.is(newValue, oldValue)
}
