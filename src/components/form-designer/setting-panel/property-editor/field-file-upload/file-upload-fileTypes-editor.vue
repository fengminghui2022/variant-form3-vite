<template>
  <el-form-item>
    <template #label>
      <span>{{i18nt('designer.setting.fileTypes')}}
        <el-tooltip effect="light" :content="i18nt('designer.setting.fileTypesHelp')">
          <svg-icon icon-class="el-info" /></el-tooltip>
      </span>
    </template>
    <el-select multiple allow-create filterable default-first-option
               v-model="optionModel.fileTypes" style="width: 100%">
      <el-option v-for="(ft, ftIdx) in uploadFileTypes"
                 :key="ftIdx"
                 :label="ft.label"
                 :value="ft.value">
      </el-option>
    </el-select>
  </el-form-item>
</template>

<script>
  import SvgIcon from '@/components/svg-icon'
	import { reactive,toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "file-upload-fileTypes-editor",
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
      const data=reactive({
        uploadPictureTypes: [
          {value: 'doc', label: 'doc'},
          {value: 'xls', label: 'xls'},
          {value: 'docx', label: 'docx'},
          {value: 'xlsx', label: 'xlsx'},
        ],
      })

      return {
        i18nt,
        ...toRefs(props),
        ...toRefs(data),
      }
    }
  }
</script>

<style scoped>

</style>
