import { hasChanged, isObject } from '@vue/shared'
import { isRef, reactive } from 'vue'
import { track, trigger } from './dep'

export const mutableHandlers = {
  get(target, key, receiver) {
    /**
     * target={ a:0}
     * 收集依赖，绑定target中某一个key和sub之间的关系
     */
    track(target, key)

    const res = Reflect.get(target, key, receiver)

    if (isRef(res)) {
      /**
       * target = {a:ref(0)}
       * 如果target.a是一个ref,那么就直接把值给它，不要让他.value
       */
      return res.value
    }

    if (isObject(res)) {
      /**
       * 如果res还是一个对象。那么就给他包装成reactive
       */
      return reactive(res)
    }

    /**
     * receiver用来保证访问器里this指向代理对象
     */
    return res
  },
  set(target, key, newValue, receiver) {
    const oldValue = target[key]
    /**
     * 触发更新，set的时候通知之前收集的依赖重新执行
     */
    const res = Reflect.set(target, key, newValue, receiver)

    /**
     * 如果更新了state.a,他之前是一个ref，那么会修改原始的ref.value的值等于newValue
     * 如果newValue是一个ref,那就算了
     */
    if (isRef(oldValue) && !isRef(newValue)) {
      /**
       * const a = ref(0)
       * target = { a }
       * 更新target.a = 1 他就等于更新了a.value
       * a.value = 1
       */
      oldValue.value = newValue
      return res
    }

    if (hasChanged(newValue, oldValue)) {
      /**
       * 如果新值和老值不同，触发更新
       * 先set在通知sub重新执行
       */
      trigger(target, key)
    }

    return res
  },
}
