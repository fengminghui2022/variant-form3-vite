<template>
  <el-form-item :label="i18nt('designer.setting.dividerDirection')">
    <el-select v-model="optionModel.direction">
      <el-option label="horizontal" value="horizontal"></el-option>
      <el-option label="vertical" value="vertical"></el-option>
    </el-select>
  </el-form-item>
</template>

<script>
	import { toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "divider-direction-editor",
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
