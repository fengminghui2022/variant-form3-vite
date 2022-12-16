<template>
  <el-form-item label="onDisableOperationButton" title="onDisableOperationButton" label-width="150px">
    <el-button type="info" icon="el-icon-edit" plain round :class="[eventHandled ? 'button-text-highlight' : '']"
               @click="editEventHandler('onDisableOperationButton', eventParams)">
      {{i18nt('designer.setting.addEventHandler')}}</el-button>
  </el-form-item>
</template>

<script>
	import { reactive, toRefs, getCurrentInstance} from 'vue'

  import { useI18n } from '@/utils/i18n'
  import { useEmitterMixin } from "@/components/form-designer/setting-panel/property-editor/event-handler/eventMixin"

  export default {
    name: "onDisableOperationButton-editor",
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
      eventHandled: {
        type: Boolean,
        default: false,
      },
    },
    setup(props){
      const { i18nt }=useI18n();
      const { proxy } = getCurrentInstance()

      const emitterMixin= useEmitterMixin(proxy)

      const data=reactive({
           eventParams: ['buttonConfig', 'rowIndex', 'row'],
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
