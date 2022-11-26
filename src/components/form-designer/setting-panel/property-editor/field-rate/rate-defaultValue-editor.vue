<template>
  <el-form-item :label="i18nt('designer.setting.defaultValue')">
    <el-input-number v-model="optionModel.defaultValue" :min="0" :max="optionModel.max" style="width: 100%"
                     @change="emitDefaultValueChange">
    </el-input-number>
  </el-form-item>
</template>

<script>
	import { toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'
  import useProperty from "@/components/form-designer/setting-panel/property-editor/propertyMixin"

  export default {
    name: "rate-defaultValue-editor",
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    setup(props){
      const { i18nt }=useI18n();
      const properyMixins= useProperty(props)

      return {
        i18nt,
        ...toRefs(props),
        ...toRefs(properyMixins)
      }
    }    
  }
</script>

<style scoped>

</style>
