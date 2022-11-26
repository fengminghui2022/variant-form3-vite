<template>
  <el-form-item :label="i18nt('designer.setting.multipleLimit')">
    <el-input-number v-model="optionModel.multipleLimit" :min="0"
                     class="hide-spin-button" style="width: 100%"></el-input-number>
  </el-form-item>
</template>

<script>
	import { toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "multipleLimit-editor",
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
