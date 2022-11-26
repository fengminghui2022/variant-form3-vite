<template>
  <el-form-item :label="i18nt('designer.setting.drawSize')">
    <el-input type="text" v-model="optionModel.size"></el-input>
  </el-form-item>
</template>

<script>
	import { toRefs } from 'vue'

  import { useI18n } from '@/utils/i18n'
  import { useProperty } from "@/components/form-designer/setting-panel/property-editor/propertyMixin"

  export default {
    name: "vf-drawer-size-editor",
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
