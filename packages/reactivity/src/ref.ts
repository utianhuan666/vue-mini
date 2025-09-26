import { activeSub } from './effect'

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

  //保存和effect之间的关联关系
  subs

  constructor(value) {
    this._value = value
  }

  get value() {
    if (activeSub) {
      //如果activeSub存在，说明当前有函数在执行，等待更新的时候触发
      this.subs = activeSub
    }
    //收集依赖
    return this._value
  }

  set value(newValue) {
    //触发更新
    this._value = newValue
    //通知effect重新执行,获取到最新的值
    this.subs?.()
  }
}

export function ref(value) {
  return new RefImpl(value)
}

export function isRef(value) {
  return !!(value && value[ReactiveFlags.IS_REF])
}
