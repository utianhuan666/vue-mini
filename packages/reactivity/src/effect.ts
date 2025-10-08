import { endTrack, Link, startTrack } from './system'

export let activeSub

class ReactiveEffect {
  /**
   * 依赖项链表的头节点
   */
  deps: Link | undefined
  /**
   * 依赖项链表的尾节点
   */
  depsTail: Link | undefined

  constructor(public fn: Function) {}

  run() {
    //先将当前的effect保存起来,用来处理嵌套的逻辑
    const prevSub = activeSub
    //每次执行fn之前,把this放到activeSub上
    activeSub = this

    startTrack(this)

    try {
      return this.fn()
    } finally {
      endTrack(this)
      //执行完成后,把activeSub置为undefined
      activeSub = prevSub
    }
  }

  /**
   * 通知更新的方法,如果依赖的数据发生了变化,会调用这个函数
   */
  notify() {
    this.scheduler()
  }
  /**
   * 默认调用run(),如果用户传了,那已用户的为主,实例属性的优先级优于原型属性
   */
  scheduler() {
    this.run()
  }
}

export function effect(fn: Function, options) {
  const e = new ReactiveEffect(fn)
  //scheduler
  Object.assign(e, options)

  e.run()

  /**
   * 绑定函数的this
   */
  const runner = e.run.bind(e)

  /**
   * 把effect的实例放到函数属性中
   */
  runner.effect = e

  return runner
}
