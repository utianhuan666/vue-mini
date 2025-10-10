import { ReactiveEffect } from 'vue'

/**
 * 依赖项
 */
interface Dependency {
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
  dep: Dependency
  //下一个依赖项节点
  nextDep: Link | undefined
}

//保存已经被清理掉的节点，留着复用
let linkPool: Link
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
  let newLink

  /**
   * 看一下linkPool有没有,如果有就复用
   */
  if (linkPool) {
    newLink = linkPool
    linkPool = linkPool.nextDep
    newLink.nextDep = nextDep
    newLink.sub = sub
    newLink.dep = dep
  } else {
    //如果没有就创建新的
    newLink = {
      sub,
      dep,
      nextDep,
      nextSub: undefined,
      prevSub: undefined,
    }
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
    const sub = link.sub
    if (!sub.tracking) {
      queuedEffect.push(sub)
    }
    link = link.nextSub
  }

  queuedEffect.forEach(effect => effect.notify())
}

/**
 * 开始追踪依赖，将depsTail尾节点设置成undefind
 * @param sub
 */
export function startTrack(sub) {
  sub.tracking = true
  sub.depsTail = undefined
}

/**
 * 结束追踪，找到需要清理的依赖，断开关联关系
 * @param sub
 */
export function endTrack(sub) {
  sub.tracking = false
  const depsTail = sub.depsTail
  /**
   * depsTail有,并且depsTail还有nextDep,我们应该把他们的依赖关系清理掉
   * depsTail没有,并且头节点有,那么就把所有都清理掉
   */
  if (depsTail) {
    if (depsTail.nextDep) {
      clearTracking(depsTail.nextDep)
      depsTail.nextDep = undefined
    }
  } else if (sub.deps) {
    clearTracking(sub.deps)
    sub.deps = undefined
  }
}

/**
 * 清理依赖关系
 * @param fn
 * @param options
 * @returns
 */
export function clearTracking(link: Link) {
  while (link) {
    const { prevSub, nextSub, nextDep, dep } = link

    /**
     * 如果prevSub有,那就把prevSub的下一个节点,指向当前节点的下一个
     * 如果没有,那就是头节点，那就把当前dep的头节点指向下一个节点
     */
    if (prevSub) {
      prevSub.nextSub = nextSub
      link.nextSub = undefined
    } else {
      dep.subs = nextSub
    }

    /**
     * 如果下一个有，那就把nextSub的上一个节点，指向节点的上一个节点
     * 如果没有,那就是尾节点,那就把当前dep的尾节点`指向上一个节点
     */
    if (nextSub) {
      nextSub.prevSub = prevSub
      link.prevSub = undefined
    } else {
      dep.subsTail = prevSub
    }

    link.dep = link.sub = undefined

    /**
     * 把不要的节点给linkPool,留着复用
     */
    link.nextDep = linkPool
    linkPool = link

    link = nextDep
  }
}
