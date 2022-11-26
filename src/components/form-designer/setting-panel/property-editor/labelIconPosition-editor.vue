<template>
  <el-form-item :label="i18nt('designer.setting.labelIconPosition')">
    <el-select v-model="optionModel.labelIconPosition">
      <el-option v-for="item in labelIconPosition" :key="item.value" :label="item.label"
                 :value="item.value">
      </el-option>
    </el-select>
  </el-form-item>
</template>

<script>
	import { reactive,toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "labelIconPosition-editor",
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    
    setup(props){
      const { i18nt }=useI18n();

      const data=reactive({
        labelIconPosition: [
          {label: 'front', value: 'front'},
          {label: 'rear', value: 'rear'},
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
