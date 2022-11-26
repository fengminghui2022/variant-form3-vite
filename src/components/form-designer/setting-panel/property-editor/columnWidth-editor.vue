<template>
  <div>
    <el-form-item :label="i18nt('designer.setting.widgetColumnWidth')" v-show="!!isSubFormChildWidget()">
      <el-input type="text" v-model="optionModel.columnWidth"></el-input>
    </el-form-item>
  </div>
</template>

<script>
	import { inject,toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "columnWidth-editor",
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    inject: ['isSubFormChildWidget'],
    setup(props){
      const { i18nt }=useI18n();
      const isSubFormChildWidget=inject("isSubFormChildWidget")

      return {
        i18nt,
        ...toRefs(props),
        
        isSubFormChildWidget
      }
    }  
  }
</script>

<style scoped>

</style>
