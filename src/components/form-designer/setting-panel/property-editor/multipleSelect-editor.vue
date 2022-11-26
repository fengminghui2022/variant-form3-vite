<template>
  <el-form-item :label="i18nt('designer.setting.multipleSelect')">
    <el-switch v-model="optionModel.multipleSelect"></el-switch>
  </el-form-item>
</template>

<script>
	import { toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "multipleSelect-editor",
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    setup(props){
      const { i18nt }=useI18n();

      return {
        i18nt,
        ...toRefs(props),
      }
    }  

  }
</script>

<style scoped>

</style>
