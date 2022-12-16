<template>
  <el-form-item :label="i18nt('designer.setting.defaultValue')">
    <el-date-picker :type="optionModel.type" v-model="optionModel.defaultValue" @change="emitDefaultValueChange"
                    :format="optionModel.format" :value-format="optionModel.valueFormat" style="width: 100%">
    </el-date-picker>
  </el-form-item>
</template>

<script>
	import { toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'
  import { useProperty } from "@/components/form-designer/setting-panel/property-editor/propertyMixin"

  export default {
    name: "date-range-defaultValue-editor",
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
