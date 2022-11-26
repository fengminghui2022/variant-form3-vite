<template>
  <el-form-item :label="i18nt('designer.setting.widgetSize')">
    <el-select v-model="optionModel.size">
      <el-option v-for="item in widgetSizes" :key="item.value" :label="item.label"
                 :value="item.value">
      </el-option>
    </el-select>
  </el-form-item>
</template>

<script>
  import { reactive, toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "size-editor",
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    setup(props){
     const { i18nt }=useI18n();
     const data=reactive({
       widgetSizes: [
          {label: 'default', value: ''},
          {label: 'large', value: 'large'},
          {label: 'small', value: 'small'},
        ],
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
