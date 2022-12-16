<template>
  <el-form-item label-width="0">
    <el-divider class="custom-divider-margin-top">{{i18nt('designer.setting.optionsSetting')}}</el-divider>
  </el-form-item>
  <el-form-item :label="i18nt('designer.setting.labelKeyName')">
    <el-input v-model="optionModel.labelKey"></el-input>
  </el-form-item>
  <el-form-item :label="i18nt('designer.setting.valueKeyName')">
    <el-input v-model="optionModel.valueKey"></el-input>
  </el-form-item>
  <el-form-item v-if="designer.hasConfig('childrenKey')" :label="i18nt('designer.setting.childrenKeyName')">
    <el-input v-model="optionModel.childrenKey"></el-input>
  </el-form-item>
  <el-form-item :label="i18nt('designer.setting.dsEnabled')">
    <el-switch v-model="optionModel.dsEnabled"></el-switch>
  </el-form-item>
  <el-form-item v-if="!!optionModel.dsEnabled" :label="i18nt('designer.setting.dsName')">
    <el-select v-model="optionModel.dsName" filterable clearable @change="getDataSetList">
      <el-option v-for="(item, idx) in dataSourceList" :key="idx" :title="item.description"
                 :label="item.uniqueName" :value="item.uniqueName"></el-option>
    </el-select>
  </el-form-item>
  <el-form-item v-if="!!optionModel.dsEnabled" :label="i18nt('designer.setting.dataSetName')">
    <el-select v-model="optionModel.dataSetName" filterable clearable>
      <el-option v-for="(item, idx) in dataSetList" :key="idx" :title="item.remark"
                 :label="item.name" :value="item.name"></el-option>
    </el-select>
  </el-form-item>
  <el-form-item v-if="!optionModel.dsEnabled" label-width="0">
    <option-items-setting :designer="designer" :selected-widget="selectedWidget"></option-items-setting>
  </el-form-item>
</template>

<script>
	import { reactive, computed , toRefs,watch  } from 'vue'
  import { useI18n } from '@/utils/i18n'
  import { useProperty } from "@/components/form-designer/setting-panel/property-editor/propertyMixin"

  import OptionItemsSetting from "@/components/form-designer/setting-panel/option-items-setting"
  import {getDSByName} from "@/utils/util"

  export default {
    name: "optionItems-editor",
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    components: {
      OptionItemsSetting,
    },
    setup(props){
      const { i18nt }=useI18n();
      const data=reactive({
        dataSetList: [],
      })

      const dataSourceList=computed(()=>{
          if (!props.designer.formConfig || !props.designer.formConfig.dataSources) {
            return []
          } else {
            return props.designer.formConfig.dataSources
          }
      })

      const loadDataSet=(dsName)=> {
        data.dataSetList.length = 0
        if (!dsName) {
          return
        }

        let dsModel = getDSByName(props.designer.formConfig, dsName)
        if (!!dsModel && !!dsModel.dataSets) {
          dsModel.dataSets.forEach(dSet => {
            dataSetList.push({
              name: dSet.name,
              remark: dSet.remark
            })
          })
        }
      }

      const getDataSetList=()=> {
        props.optionModel.dataSetName = ''
        loadDataSet(props.optionModel.dsName)
      }

      watch(()=>props.selectedWidget, {
        handler(val, oldVal) {
          if (!val) {
            return
          }

          loadDataSet(val.options.dsName)
        }},
        { immediate: true }
      )


      return {
        i18nt,
        ...toRefs(props),
        ...toRefs(data),

        dataSourceList,

        loadDataSet,
        getDataSetList
      }
    }
  }
</script>

<style scoped>

</style>
