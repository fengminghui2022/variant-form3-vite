<template>
  <el-form-item :label="i18nt('designer.setting.lowThreshold')">
    <el-input-number v-model="optionModel.lowThreshold" :min="1" :max="optionModel.highThreshold"
                     class="hide-spin-button" style="width: 100%"></el-input-number>
  </el-form-item>
</template>

<script>
	import { toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'
  
  export default {
    name: "lowThreshold-editor",
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
