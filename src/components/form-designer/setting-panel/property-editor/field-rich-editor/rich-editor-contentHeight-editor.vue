<template>
  <div>
    <el-form-item :label="i18nt('designer.setting.contentHeight')">
      <el-input type="text" v-model="optionModel.contentHeight"></el-input>
    </el-form-item>
  </div>
</template>

<script>
	import { toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "rich-editor-contentHeight-editor",
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
