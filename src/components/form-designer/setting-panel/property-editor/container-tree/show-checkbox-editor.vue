<template>
  <el-form-item :label="i18nt('designer.setting.showTreeCheckBox')">
    <el-switch v-model="optionModel.showCheckBox"></el-switch>
  </el-form-item>
</template>

<script>
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "show-checkbox-editor",
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    setup(props){
      const { i18nt }=useI18n();
      return {
        i18nt
      }
    }
  }
</script>

<style scoped>

</style>
