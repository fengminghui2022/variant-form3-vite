<template>
  <el-form-item :label="i18nt('designer.setting.maxLength')">
    <el-input type="number" @input="inputNumberHandler" class="hide-spin-button"
              min="1" v-model="maxLength" style="width: 100%"></el-input>
  </el-form-item>
</template>

<script>
	import { computed, toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'
  import { useProperty } from "@/components/form-designer/setting-panel/property-editor/propertyMixin"

  export default {
    name: "maxLength-editor",
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    setup(props){
      const { i18nt }=useI18n();
      const properyMixins=useProperty(props)


      const maxLength=computed({
        get() {
          return props.optionModel['maxLength']
        },

        set(newValue) {
          if (!newValue || isNaN(newValue)) {
            props.optionModel.maxLength = null
          } else {
            props.optionModel.maxLength = Number(newValue)
          }
        }
      })

      return {
        i18nt,
        ...toRefs(props),
        ...properyMixins,

        maxLength
      }
    }  
  }
</script>

<style scoped>

</style>
