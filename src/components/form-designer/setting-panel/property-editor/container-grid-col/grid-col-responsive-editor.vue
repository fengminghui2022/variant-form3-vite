<template>
  <el-form-item :label="i18nt('designer.setting.responsive')">
    <el-switch v-model="optionModel.responsive"></el-switch>
  </el-form-item>
</template>

<script>
	import { toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "grid-col-responsive-editor",
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

<style lang="scss" scoped>

</style>
