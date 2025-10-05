import { ReactiveEffect } from 'vue'

/**
 * 依赖项
 */
interface Dep {
  //订阅者链表的头节点
  subs: Link | undefined
  //订阅者链表的尾节点
  subsTail: Link | undefined
}

/**
 * 订阅者
 */
interface Sub {
  //订阅者链表的头节点
  deps: Link | undefined
  //订阅者链表的尾节点
  depsTail: Link | undefined
}

/**
 * 链表节点
 */
export interface Link {
  //订阅者
  sub: Sub
  //下一个订阅者节点
  nextSub: Link | undefined
  //上一个订阅者节点
  prevSub: Link | undefined
  //依赖项
  dep: Dep
  //下一个依赖项节点
  nextDep: Link | undefined
}

/**
 * 链接链表关系
 * @param dep Ref实例
 * @param sub effect函数,订阅者
 */
export function link(dep, sub) {
  // #region 尝试复用链表节点
  /**
   * 分两种情况
   * 1、如果头节点有,尾节点没有,那么尝试复用头节点
   * 2、如果尾节点还有nextDep,尝试复用尾节点的nextDep
   */
  const currentDep = sub.depsTail
  const nextDep = currentDep === undefined ? sub.deps : currentDep.nextDep

  if (nextDep && nextDep.dep === dep) {
    sub.depsTail = nextDep
    return
  }
  // #endregion

  //如果activeSub存在，说明当前有函数在执行，等待更新的时候触发
  const newLink = {
    sub,
    dep,
    nextDep: undefined,
    nextSub: undefined,
    prevSub: undefined,
  }

  // #region 将链表节点和dep建立关联关系
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
  // #endregion

  // #region 将链表节点和sub建立关联关系
  /**
   * 关联链表关系,分两种情况
   * 1、尾节点有,那就往尾节点后面加
   * 2、尾节点没有,说明是第一个节点
   */
  if (sub.depsTail) {
    sub.depsTail.nextDep = newLink
    sub.depsTail = newLink
  } else {
    sub.deps = newLink
    sub.depsTail = newLink
  }
  // #endregion
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

  queuedEffect.forEach(effect => effect.notify())
}
