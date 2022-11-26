<template>
  <el-form-item :label="i18nt('designer.setting.valueFormat')">
    <el-select v-model="optionModel.valueFormat" filterable allow-create>
      <el-option label="YYYY-MM-DD" value="YYYY-MM-DD"></el-option>
      <el-option label="YYYY-MM-DD HH:mm:ss" value="YYYY-MM-DD HH:mm:ss"></el-option>
      <el-option label="YYYY-MM" value="YYYY-MM"></el-option>
      <el-option label="YYYY" value="YYYY"></el-option>
    </el-select>
  </el-form-item>
</template>

<script>
	import { toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "date-valueFormat-editor",
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
