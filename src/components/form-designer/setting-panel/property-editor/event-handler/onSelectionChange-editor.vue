<template>
  <el-form-item label="onSelectionChange" label-width="150px">
    <el-button type="info" icon="el-icon-edit" plain round :class="[eventHandled ? 'button-text-highlight' : '']"
               @click="editEventHandler('onSelectionChange', eventParams)">
      {{i18nt('designer.setting.addEventHandler')}}</el-button>
  </el-form-item>
</template>

<script>
	import { reactive, toRefs } from 'vue'

  import { useI18n } from '@/utils/i18n'
  import { useEmitterMixin } from "@/components/form-designer/setting-panel/property-editor/event-handler/eventMixin"
  
  export default {
    name: "onSelectionChange-editor",
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

      const emitterMixin= useEmitterMixin()

      const data=reactive({
          eventParams: ['selection', 'selectedIndices'],
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
