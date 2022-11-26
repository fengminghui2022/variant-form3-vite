<template>
  <el-form-item :label="i18nt('designer.setting.labelWidth')">
    <el-input type="number" v-model="optionModel.labelWidth" @input="inputNumberHandler"
              min="0" class="hide-spin-button"></el-input>
  </el-form-item>
</template>

<script>
	import { toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'
  import { useProperty } from "@/components/form-designer/setting-panel/property-editor/propertyMixin"

  export default {
    name: "labelWidth-editor",
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    setup(props){
     const { i18nt }=useI18n();

     const properyMixins=useProperty(props)

      return {
        i18nt,
        ...toRefs(props),
        ...properyMixins
      }
    }
  }
</script>

<style scoped>

</style>
