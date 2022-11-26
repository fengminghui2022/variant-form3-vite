<template>
  <el-form-item :label="i18nt('designer.setting.displayType')">
    <el-select v-model="optionModel.type">
      <el-option label="datetime" value="datetime"></el-option>
      <el-option label="date" value="date"></el-option>
      <el-option label="dates" value="dates"></el-option>
      <el-option label="year" value="year"></el-option>
      <el-option label="month" value="month"></el-option>
      <el-option label="week" value="week"></el-option>
    </el-select>
  </el-form-item>
</template>

<script>
	import { toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "date-type-editor",
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
