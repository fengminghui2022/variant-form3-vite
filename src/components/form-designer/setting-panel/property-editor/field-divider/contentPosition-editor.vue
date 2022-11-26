<template>
  <el-form-item :label="i18nt('designer.setting.contentPosition')">
    <el-select v-model="optionModel.contentPosition">
      <el-option label="center" value="center"></el-option>
      <el-option label="left" value="left"></el-option>
      <el-option label="right" value="right"></el-option>
    </el-select>
  </el-form-item>
</template>

<script>
	import { toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "contentPosition-editor",
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
