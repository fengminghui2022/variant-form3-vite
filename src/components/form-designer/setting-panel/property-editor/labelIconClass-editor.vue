<template>
  <div>
    <el-form-item label-width="0">
      <el-divider class="custom-divider">{{i18nt('designer.setting.customLabelIcon')}}</el-divider>
    </el-form-item>
    <el-form-item :label="i18nt('designer.setting.labelIconClass')">
      <el-input type="text" v-model="optionModel.labelIconClass"></el-input>
    </el-form-item>
  </div>
</template>

<script>
	import { toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "labelIconClass-editor",
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
