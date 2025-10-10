import { hasChanged, isObject } from '@vue/shared'
import { activeSub } from './effect'
import { Link, link, propagate } from './system'
import { reactive } from './reactive'

enum ReactiveFlags {
  IS_REF = '__v_isRef',
}

/**
 * Ref类
 */
class RefImpl {
  //保存实际的值
  _value;

  //标识是ref类型
  [ReactiveFlags.IS_REF] = true

  /**
   * 订阅者链表的头节点,理解为head
   */
  subs: Link

  /**
   * 订阅者链表的尾节点,理解为tail
   */
  subsTail: Link

  constructor(value) {
    /**
     * 如果value是一个对象，那么使用reactive给它搞成响应式对象
     */
    this._value = isObject(value) ? reactive(value) : value
  }

  get value() {
    if (activeSub) {
      trackRef(this)
    }
    //收集依赖
    return this._value
  }

  set value(newValue) {
    if (hasChanged(newValue, this._value)) {
      //只有在值发生变化之后才触发更新
      //触发更新
      this._value = isObject(newValue) ? reactive(newValue) : newValue
      triggerRef(this)
    }
  }
}

export function ref(value) {
  return new RefImpl(value)
}

export function isRef(value) {
  return !!(value && value[ReactiveFlags.IS_REF])
}

/**
 * 收集依赖,建立ref和effect的关联联系
 * @param dep Ref实例
 */
export function trackRef(dep) {
  if (activeSub) {
    link(dep, activeSub)
  }
}

/**
 * 触发ref关联的effect重新执行
 * @param dep Ref实例
 */
export function triggerRef(dep) {
  if (dep.subs) {
    propagate(dep.subs)
  }
}
