export function useEmitterMixin(emitter){
  const editEventHandler=(eventName, eventParams)=> {    
    emitter.dispatch('SettingPanel', 'editEventHandler', [eventName, [...eventParams]])
  }

  return {
    editEventHandler
  }
}