import { activeSub } from '@vue/reactivity'
import { link, propagate, Link } from './system'

/**
 * 绑定target的key关联的所有Dep
 * obj = { a:0,b:1}
 * targetMap = {
 *  [obj]: {
 *    a: Dep,
 *    b: Dep
 *  }
 * }
 */
const targetMap = new WeakMap()

export function track(target, key) {
  if (!activeSub) {
    return
  }
  /**
   * 找depsMap = {
   *  a: Dep,
   *  b: Dep
   * }
   */
  let depsMap = targetMap.get(target)

  if (!depsMap) {
    /**
     * 没有depsMap,就是之前没有收集过这个对象的任何key
     * 那就创建一个新的，保存target和depsMap之间的关联关系
     */
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  /**
   * 找dep=>Dep
   */
  let dep = depsMap.get(key)

  if (!dep) {
    /**
     * 第一次收集这个对象没找到创建一个新的，并且保存到depsMap
     */
    dep = new Dep()
    depsMap.set(key, dep)
  }

  /**
   * 绑定dep和sub之间的关联关系
   */
  link(dep, activeSub)
}

export function trigger(target, key) {
  /**
   * 找depsMap = {
   *  a: Dep,
   *  b: Dep
   * }
   */
  const depsMap = targetMap.get(target)

  if (!depsMap) {
    /**
     * depsMap不存在，表示这个对象，从来没有任何属性在sub中访问过
     */
    return
  }

  /**
   * 找到key对应的 Dep
   * dep=>Dep
   */
  const dep = depsMap.get(key)

  if (!dep) {
    //dep不存在，说明这个key从来没有在sub中访问过
    return
  }

  /**
   * 找到dep的subs通知他们重新执行
   */
  propagate(dep.subs)
}

class Dep {
  /**
   * 订阅者链表的头节点,理解为head
   */
  subs: Link

  /**
   * 订阅者链表的尾节点,理解为tail
   */
  subsTail: Link
  constructor() {}
}
