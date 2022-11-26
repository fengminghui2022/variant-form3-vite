<template>
  <el-form-item :label="i18nt('designer.setting.minValue')">
    <el-input-number v-model="minValue" class="hide-spin-button" style="width: 100%"></el-input-number>
  </el-form-item>
</template>

<script>
	import { computed,toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "min-editor",
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    setup(props){
      const { i18nt }=useI18n();

      const minValue=computed({
        get() {
          return props.optionModel['min']
        },

        set(newValue) {
          //if ((!newValue && (newValue !== 0)) || isNaN(newValue)) {
          if ((newValue === undefined) || (newValue === null) || isNaN(newValue)) {
            props.optionModel.min = null
          } else {
            props.optionModel.min = Number(newValue)
          }
        }
      })

      return {
        i18nt,
        ...toRefs(props),

        minValue
      }
    }  
  }
</script>

<style scoped>

</style>
