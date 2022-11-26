<template>
  <el-form-item prop="name" :rules="nameRequiredRule">
    <template #label>
      <span>{{i18nt('designer.setting.uniqueName')}}
        <el-tooltip effect="light" :content="i18nt('designer.setting.editNameHelp')">
          <svg-icon icon-class="el-info" /></el-tooltip>
      </span>
    </template>
    <template v-if="!!selectedWidget.category || noFieldList">
      <el-input type="text" v-model="optionModel.name" :readonly="widgetNameReadonly" @change="updateWidgetNameAndRef"></el-input>
    </template>
    <template v-else>
      <el-select v-model="optionModel.name" allow-create filterable :disabled="widgetNameReadonly" @change="updateWidgetNameAndRef"
                 :title="i18nt('designer.setting.editNameHelp')">
        <el-option v-for="(sf, sfIdx) in serverFieldList" :key="sfIdx" :label="sf.label" :value="sf.name"></el-option>
      </el-select>
    </template>
  </el-form-item>
</template>

<script>
  import SvgIcon from '@/components/svg-icon'
	import { inject,reactive, computed, toRefs, getCurrentInstance } from 'vue'
  import { useI18n } from '@/utils/i18n'
  import { isEmptyStr } from "@/utils/util"

  export default {
    name: "name-editor",
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
      
      const { proxy } = getCurrentInstance()

      const serverFieldList=inject("serverFieldList")
      const getDesignerConfig=inject("getDesignerConfig")

      const data=reactive({
          nameRequiredRule: [{required: true, message: 'name required'}],
      })

      const noFieldList=computed(()=> {
        return !serverFieldList || (serverFieldList.length <= 0)
      })

      const widgetNameReadonly=computed(()=> {
        return !!getDesignerConfig().widgetNameReadonly
      })

      const updateWidgetNameAndRef=(newName)=> {
        let oldName = props.designer.selectedWidgetName
        if (isEmptyStr(newName)) {
          props.selectedWidget.options.name = oldName
          proxy.$message.info(i18nt('designer.hint.nameRequired'))
          return
        }

        if (!!props.designer.formWidget) {
          let foundRef = props.designer.formWidget.getWidgetRef(newName) // 检查newName是否已存在！！
          if (!!foundRef) {
            props.selectedWidget.options.name = oldName
            proxy.$message.info(i18nt('designer.hint.duplicateName') + newName)
            return
          }

          let widgetInDesign = props.designer.formWidget.getWidgetRef(oldName)
          if (!!widgetInDesign && !!widgetInDesign.registerToRefList) {
            widgetInDesign.registerToRefList(oldName)  //注册组件新的ref名称并删除老的ref！！
            let newLabel = getLabelByFieldName(newName)
            props.designer.updateSelectedWidgetNameAndLabel(props.selectedWidget, newName, newLabel)
          }
        }
      }

      const getLabelByFieldName=(fieldName)=> {
        for (let i = 0; i < serverFieldList.length; i++) {
          if (serverFieldList[i].name === fieldName) {
            return serverFieldList[i].label
          }
        }

        return null
      }


      return {
        i18nt,
        ...toRefs(props),
        ...toRefs(data),

        serverFieldList,
        getDesignerConfig,

        noFieldList,
        widgetNameReadonly,

        updateWidgetNameAndRef,
        getLabelByFieldName
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
