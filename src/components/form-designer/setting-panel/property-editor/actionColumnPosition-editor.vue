<template>
  <el-form-item :label="i18nt('designer.setting.actionColumnPosition')">
    <el-radio-group v-model="optionModel.actionColumnPosition" class="radio-group-custom">
      <el-radio-button label="left">
        {{i18nt('designer.setting.leftAlign')}}</el-radio-button>
      <el-radio-button label="right">
        {{i18nt('designer.setting.rightAlign')}}</el-radio-button>
    </el-radio-group>
  </el-form-item>
</template>

<script>
	import { toRefs,computed  } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "actionColumnPosition-editor",
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
  .radio-group-custom {
    :deep(.el-radio-button__inner) {
      padding-left: 12px;
      padding-right: 12px;
    }
  }
</style>
