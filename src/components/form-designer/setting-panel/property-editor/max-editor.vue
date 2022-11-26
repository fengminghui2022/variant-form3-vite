<template>
  <el-form-item :label="i18nt('designer.setting.maxValue')">
    <el-input-number v-model="maxValue" class="hide-spin-button" style="width: 100%"></el-input-number>
  </el-form-item>
</template>

<script>
	import { toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "max-editor",
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    setup(props){
      const { i18nt }=useI18n();

      const maxValue=computed( {
        get() {
          return props.optionModel['max']
        },

        set(newValue) {
          if (!newValue || isNaN(newValue)) {
            props.optionModel.max = null
          } else {
            props.optionModel.max = Number(newValue)
          }
        }
      })

      return {
        i18nt,
        ...toRefs(props),

        maxValue
      }
    }  
  }
</script>

<style scoped>

</style>
