export let activeSub

class ReactiveEffect {
  constructor(public fn: Function) {}

  run() {
    //先将当前的effect保存起来,用来处理嵌套的逻辑
    const prevSub = activeSub
    //每次执行fn之前,把this放到activeSub上
    activeSub = this

    try {
      return this.fn()
    } finally {
      //执行完成后,把activeSub置为undefined
      activeSub = prevSub
    }
  }
}

export function effect(fn: Function,options) {
  const e = new ReactiveEffect(fn)
  //scheduler
  Object.assign(e,options)
  e.run()
}
