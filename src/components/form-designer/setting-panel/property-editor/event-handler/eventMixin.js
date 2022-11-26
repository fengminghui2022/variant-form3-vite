import emitter from '@/utils/emitter'

import { useEmitter } from '@/utils/emitter'
export default {
  mixins: [emitter],
  created() {},
  methods: {
    editEventHandler(eventName, eventParams) {
      this.dispatch('SettingPanel', 'editEventHandler', [eventName, [...eventParams]])
    },

  }
}


export function useEmitterMixin(){
  const emitter= useEmitter();
  const editEventHandler=(eventName, eventParams)=> {
    this.dispatch('SettingPanel', 'editEventHandler', [eventName, [...eventParams]])
  }

  return {
    ...emitter,
    editEventHandler
  }
}