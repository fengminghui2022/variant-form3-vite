<template>
  <el-form-item :label="i18nt('designer.setting.colOffsetTitle')">
    <el-input-number v-model.number="optionModel.offset" :min="0" :max="24"
                     style="width: 100%"></el-input-number>
  </el-form-item>
</template>

<script>
	import { toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "grid-col-offset-editor",
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
