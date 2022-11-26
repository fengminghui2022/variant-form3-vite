<template>
  <el-form-item :label="i18nt('designer.setting.label')" v-if="!noLabelSetting">
    <el-input type="text" v-model="optionModel.label"></el-input>
  </el-form-item>
</template>

<script>
	import { computed,toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "label-editor",
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    setup(props){
      const { i18nt }=useI18n();

      const noLabelSetting=computed(()=> {
        return (props.selectedWidget.type === 'static-text') || (props.selectedWidget.type === 'html-text')
        //|| (this.selectedWidget.type === 'divider')
      })

      return {
        i18nt,
        ...toRefs(props),
        noLabelSetting
      }
    }  
  }
</script>

<style lang="scss" scoped>

</style>
