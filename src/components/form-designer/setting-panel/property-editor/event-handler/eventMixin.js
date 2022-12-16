import { useEmitter } from '@/utils/emitter'

export function useEmitterMixin(proxy){
  const editEventHandler=(eventName, eventParams)=> {
    const emitter= useEmitter(proxy);
    
    emitter.dispatch('SettingPanel', 'editEventHandler', [eventName, [...eventParams]])
  }

  return {
    editEventHandler
  }
}