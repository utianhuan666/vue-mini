import { isObject } from '@vue/shared'
import { mutableHandlers } from './baseHandlers'

export function reactive(target) {
  return createReactiveObject(target)
}

/**
 * 保存target和响应式对象之间的关联关系
 * target => proxy
 * @returns
 */
const reactiveMap = new WeakMap()

/**
 * 保存所有使用reactive创建出来的代理对象
 */
const reactiveSet = new WeakSet()

function createReactiveObject(target) {
  /**
   * reactive 必须接受一个对象
   */
  if (!isObject(target)) {
    /**
     * target 不是对象,直接返回
     */
    return target
  }

  /**
   * 看一下这个target在不在reactiveSet里面，如果在，就证明target是响应式的，直接返回
   */
  if (reactiveSet.has(target)) {
    return target
  }
  /**
   * 获取到之前这个target创建的代理对象
   */
  const existingProxy = reactiveMap.get(target)

  if (existingProxy) {
    /**
     * 如果这个target之前使用reactive创建过响应式对象，那么就直接返回这个响应式对象
     */
    return existingProxy
  }

  /**
   * 创建target的代理对象
   */
  const proxy = new Proxy(target, mutableHandlers)

  /**
   * 保存target和proxy之间的关联关系
   */
  reactiveMap.set(target, proxy)

  /**
   * 保存响应式对象到reactiveSet中
   */
  reactiveSet.add(proxy)

  return proxy
}

/**
 * 判断target是不是响应式对象，只要在reactiveSet中，他就是响应式的
 * @param target
 * @returns
 */
export function isReactive(target) {
  return reactiveSet.has(target)
}
