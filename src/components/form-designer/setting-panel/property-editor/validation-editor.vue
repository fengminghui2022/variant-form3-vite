<template>
  <el-form-item>
    <template #label>
      <span>{{i18nt('designer.setting.validation')}}
        <el-tooltip effect="light" :content="i18nt('designer.setting.validationHelp')">
          <svg-icon icon-class="el-info" /></el-tooltip>
      </span>
    </template>
    <el-select v-model="optionModel.validation" filterable clearable allow-create default-first-option>
      <el-option v-for="(fv, fvIdx) in fieldValidators"
                 :key="fvIdx"
                 :label="fv.label"
                 :value="fv.value">
      </el-option>
    </el-select>
  </el-form-item>
</template>

<script>
  import SvgIcon from '@/components/svg-icon'
  import { reactive, toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "validation-editor",
    components: {
      SvgIcon
    },
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    setup(props){
     const { i18nt }=useI18n();

      const data = reactive({
         fieldValidators: [
          {value: 'number', label: i18nt('designer.hint.numberValidator')},
          {value: 'letter', label: i18nt('designer.hint.letterValidator')},
          {value: 'letterAndNumber', label: i18nt('designer.hint.letterAndNumberValidator')},
          {value: 'mobilePhone', label: i18nt('designer.hint.mobilePhoneValidator')},
          {value: 'email', label: i18nt('designer.hint.emailValidator')},
          {value: 'url', label: i18nt('designer.hint.urlValidator')},
          {value: 'noChinese', label: i18nt('designer.hint.noChineseValidator')},
          {value: 'chinese', label: i18nt('designer.hint.chineseValidator')},
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
