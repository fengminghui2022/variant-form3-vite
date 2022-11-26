<template>
  <el-form-item :label="i18nt('designer.setting.format')">
    <el-select v-model="optionModel.format" filterable allow-create>
      <el-option label="HH:mm:ss" value="HH:mm:ss"></el-option>
      <el-option label="HH时mm分ss秒" value="HH时mm分ss秒"></el-option>
      <el-option label="hh:mm:ss" value="hh:mm:ss"></el-option>
    </el-select>
  </el-form-item>
</template>

<script>
	import { toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "time-range-format-editor",
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
