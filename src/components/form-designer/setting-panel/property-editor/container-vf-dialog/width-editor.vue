<template>
  <el-form-item :label="i18nt('designer.setting.dialogWidth')">
    <el-input type="text" v-model="optionModel.width"></el-input>
  </el-form-item>
</template>

<script>
	import { toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "width-editor",
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
