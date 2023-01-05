<template>
  <div>
    <el-form-item :label="i18nt('designer.setting.customClass')">
      <el-select v-model="optionModel.customClass" multiple filterable allow-create
                 default-first-option>
        <el-option v-for="(item, idx) in cssClassList" :key="idx" :label="item" :value="item"></el-option>
      </el-select>
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
  </div>
</template>

<script>
  import { computed, toRefs, ref, watch, inject, reactive, getCurrentInstance, nextTick, onBeforeUnmount, onMounted } from 'vue'

  import { useI18n } from '@/utils/i18n'
  import {deepClone, getDSByName} from "@/utils/util";

  export default {
    name: "tree-customClass-editor",
    componentName: 'PropertyEditor',
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    setup(props){      
      const { i18nt }=useI18n();

      const dataSourceList=computed(()=>{
          if (!props.designer.formConfig || !props.designer.formConfig.dataSources) {
            return []
          } else {
            return props.designer.formConfig.dataSources
          }
      })

      const data=reactive({
        cssClassList: [],
        dataSetList: []
      })

      const loadDataSet=(dsName)=> {
        data.dataSetList.length = 0
        if (!dsName) {
          return
        }

        let dsModel = getDSByName(props.designer.formConfig, dsName)
        if (!!dsModel && !!dsModel.dataSets) {
          dsModel.dataSets.forEach(dSet => {
            data.dataSetList.push({
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

      

      watch(()=>props.selectedWidget,(val,oldVal)=> {
          if (!val) {
            return
          }
          loadDataSet(val.options.dsName)
        },
        {immediate: true}
      )




      data.cssClassList = deepClone(props.designer.getCssClassList())
      //监听表单css代码改动事件并重新加载！
      props.designer.handleEvent('form-css-updated', (cssClassList) => {
        data.cssClassList = cssClassList
      })

      return {
        i18nt,
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
