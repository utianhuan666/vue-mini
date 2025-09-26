export let activeSub

export function effect(fn: Function) { 
    activeSub = fn
    activeSub()
    
    activeSub = undefined
}