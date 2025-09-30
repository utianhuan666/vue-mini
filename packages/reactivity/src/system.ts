import { ReactiveEffect } from "vue"

/**
 * 链表节点
 */
export interface Link {
  /**
   * 保存effect
   */
  sub: ReactiveEffect
  //下一个节点
  nextSub: Link | undefined
  //上一个节点
  prevSub: Link | undefined
}

/**
 * 链接链表关系
 * @param dep Ref实例
 * @param sub effect函数,订阅者
 */
export function link(dep, sub) {
  //如果activeSub存在，说明当前有函数在执行，等待更新的时候触发
  const newLink = {
    sub,
    nextSub: undefined,
    prevSub: undefined,
  }

  /**
   * 关联链表关系,分两种情况
   * 1、尾节点有,那就往尾节点后面加
   * 2、尾节点没有,说明是第一个节点
   */
  if (dep.subsTail) {
    dep.subsTail.nextSub = newLink
    newLink.prevSub = dep.subsTail
    dep.subsTail = newLink
  } else {
    dep.subs = newLink
    dep.subsTail = newLink
  }
}

/**
 * 传播更新的函数
 * @param subs
 */
export function propagate(subs) {
  //通知effect重新执行,获取到最新的值
  let link = subs
  let queuedEffect = []

  while (link) {
    queuedEffect.push(link.sub)
    link = link.nextSub
  }

  queuedEffect.forEach(effect => effect.run())
}
