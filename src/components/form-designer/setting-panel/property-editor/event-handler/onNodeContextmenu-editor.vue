<template>
  <el-form-item label="onNodeContextmenu" label-width="150px">
    <el-button type="info" icon="el-icon-edit" plain round @click="editEventHandler('onNodeContextmenu', eventParams)">
      {{i18nt('designer.setting.addEventHandler')}}</el-button>
  </el-form-item>
</template>

<script>
	import { reactive, toRefs, getCurrentInstance } from 'vue'

  import { useI18n } from '@/utils/i18n'
  import { useEmitter } from '@/utils/emitter'
  import { useEmitterMixin } from "@/components/form-designer/setting-panel/property-editor/event-handler/eventMixin"

  export default {
    name: "onNodeContextmenu-editor",
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },    
    setup(props){
      const { i18nt }=useI18n();
      const { proxy } = getCurrentInstance()

      const emitter=useEmitter();
      const emitterMixin= useEmitterMixin(emitter)

      const data=reactive({
          eventParams: ['event','data','node','el'],
      })

      return {
        i18nt,
        ...toRefs(props),
        ...toRefs(data),
        ...emitterMixin
      }
    }
  }
</script>

<style scoped>

</style>
