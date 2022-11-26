<template>
  <div>
    <el-form-item label-width="0">
      <el-divider class="custom-divider">{{i18nt('designer.setting.inputButton')}}</el-divider>
    </el-form-item>
    <el-form-item :label="i18nt('designer.setting.appendButton')">
      <el-switch v-model="optionModel.appendButton"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
	import { toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "appendButton-editor",
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
