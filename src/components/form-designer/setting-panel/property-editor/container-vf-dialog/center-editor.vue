<template>
  <el-form-item :label="i18nt('designer.setting.center')" :title="i18nt('designer.setting.center')">
    <el-switch v-model="optionModel.center"></el-switch>
  </el-form-item>
</template>

<script>

	import { toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "center-editor",
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    setup(props){
     const { i18nt }=useI18n();

      return {
        i18nt,
        ...toRefs(props)
      }
    }
  }
</script>

<style scoped>

</style>
