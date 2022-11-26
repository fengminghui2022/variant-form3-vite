<template>
  <el-form-item :label="i18nt('designer.setting.minLength')">
    <el-input type="number" @input="inputNumberHandler" class="hide-spin-button"
              min="0" v-model="minLength" style="width: 100%"></el-input>
  </el-form-item>
</template>

<script>
	import { computed,toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "minLength-editor",
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    setup(props){
      const { i18nt }=useI18n();
      const minLength= computed({
          get() {
            return props.optionModel['minLength']
          },

          set(newValue) {
            if (!newValue || isNaN(newValue)) {
              props.optionModel.minLength = null
            } else {
              props.optionModel.minLength = Number(newValue)
            }
          }
      })

      return {
        i18nt,
        ...toRefs(props),
        minLength
      }
    }  
  }
</script>

<style scoped>

</style>
