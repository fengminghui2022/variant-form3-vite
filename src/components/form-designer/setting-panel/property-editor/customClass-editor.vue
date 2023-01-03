<template>
  <el-form-item :label="i18nt('designer.setting.customClass')">
    <el-select v-model="optionModel.customClass" multiple filterable allow-create
               default-first-option>
      <el-option v-for="(item, idx) in cssClassList" :key="idx" :label="item" :value="item"></el-option>
    </el-select>
  </el-form-item>
</template>

<script>
	import { reactive,toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'
  import { deepClone } from "@/utils/util";

  export default {
    name: "customClass-editor",
    componentName: 'PropertyEditor',
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    setup(props){
      const { i18nt }=useI18n();

      const data=reactive ({
        cssClassList: [],
      })

      data.cssClassList = deepClone(props.designer.getCssClassList())
      //监听表单css代码改动事件并重新加载！
      props.designer.handleEvent('form-css-updated', (cssClassList) => {
        data.cssClassList = cssClassList
      })

      return {
        i18nt,
        ...toRefs(props),
        ...toRefs(data)
      }
    }
  }
</script>

<style scoped>

</style>
