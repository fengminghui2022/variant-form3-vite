<template>
  <container-item-wrapper :widget="widget">

    <div :key="widget.id" class="sub-form-container"
         v-show="!widget.options.hidden">
      <el-row class="header-row">
        <div v-if="leftActionColumn" class="action-header-column">
          <span class="action-label">{{i18nt('render.hint.subFormAction')}}</span>
          <el-button v-if="!isReadMode" :disabled="actionDisabled || insertDisabled"
                     round type="primary" size="small"
                     class="action-button" @click="addSubFormRow" :title="i18nt('render.hint.subFormAddActionHint')">
            {{i18nt('render.hint.subFormAddAction')}}<svg-icon icon-class="el-plus" /></el-button>
        </div>
        <div v-if="!leftActionColumn && widget.options.showRowNumber" class="row-no-header-column">
          <span>{{i18nt('render.hint.subFormRowNo')}}</span>
        </div>
        <template v-for="(subWidget) in widget.widgetList" :key="subWidget.id + 'thc'">
          <div v-if="!subWidget.options.hidden" class="field-header-column"
               :class="[getLabelAlign(widget, subWidget), !!subWidget.options.required ? 'is-required' : '']"
               :style="{width: subWidget.options.columnWidth}">
            <span v-if="!!subWidget.options.labelIconClass" class="custom-label">
              <template v-if="subWidget.options.labelIconPosition === 'front'">
                <template v-if="!!subWidget.options.labelTooltip">
                  <el-tooltip :content="subWidget.options.labelTooltip" effect="light">
                    <svg-icon :icon-class="subWidget.options.labelIconClass" /></el-tooltip>{{subWidget.options.label}}</template>
                <template v-else>
                  <svg-icon :icon-class="subWidget.options.labelIconClass" />{{subWidget.options.label}}</template>
              </template>
              <template v-else-if="subWidget.options.labelIconPosition === 'rear'">
                <template v-if="!!subWidget.options.labelTooltip">
                  {{subWidget.options.label}}<el-tooltip :content="subWidget.options.labelTooltip" effect="light">
                  <svg-icon :icon-class="subWidget.options.labelIconClass" /></el-tooltip></template>
                <template v-else>
                  {{subWidget.options.label}}<svg-icon :icon-class="subWidget.options.labelIconClass" /></template>
              </template>
            </span>
            <template v-else>
              <span :title="subWidget.options.labelTooltip">{{subWidget.options.label}}</span></template>
          </div>
        </template>
        <div v-if="!leftActionColumn" class="action-header-column">
          <span class="action-label">{{i18nt('render.hint.subFormAction')}}</span>
          <el-button v-if="!isReadMode" :disabled="actionDisabled || insertDisabled"
                     round type="primary" size="small"
                     class="action-button" @click="addSubFormRow" :title="i18nt('render.hint.subFormAddActionHint')">
            {{i18nt('render.hint.subFormAddAction')}}<svg-icon icon-class="el-plus" /></el-button>
        </div>
      </el-row>
      <el-row v-for="(subFormRowId, sfrIdx) in rowIdData" class="sub-form-row" :key="subFormRowId">
        <div v-if="leftActionColumn" class="sub-form-action-column hide-label">
          <div class="action-button-column">
            <el-button :disabled="actionDisabled || insertDisabled"
                       circle @click="insertSubFormRow(sfrIdx)"
                       v-show="!isReadMode" :title="i18nt('render.hint.insertSubFormRow')"><svg-icon icon-class="el-plus" /></el-button>
            <el-button :disabled="actionDisabled || deleteDisabled"
                       circle @click="deleteSubFormRow(sfrIdx)"
                       v-show="!isReadMode" :title="i18nt('render.hint.deleteSubFormRow')"><svg-icon icon-class="el-delete" /></el-button>
            <span v-if="widget.options.showRowNumber" class="row-number-span">#{{sfrIdx+1}}</span>
          </div>
        </div>
        <div v-if="!leftActionColumn && widget.options.showRowNumber" class="row-no-column">
          <span v-if="widget.options.showRowNumber" class="row-number-span">#{{sfrIdx+1}}</span>
        </div>
        <template v-for="(subWidget, swIdx) in widget.widgetList" :key="fieldSchemaData[sfrIdx][swIdx].id">
          <div v-if="!subWidget.options.hidden" class="sub-form-table-column hide-label" :style="{width: subWidget.options.columnWidth}">
            <component :is="subWidget.type + '-widget'" :field="fieldSchemaData[sfrIdx][swIdx]"
                          :parent-list="widget.widgetList"
                          :index-of-parent-list="swIdx" :parent-widget="widget"
                          :sub-form-row-id="subFormRowId"
                          :sub-form-row-index="sfrIdx" :sub-form-col-index="swIdx">
              <!-- 子表单暂不支持插槽！！！ -->
            </component>
          </div>
        </template>
        <div v-if="!leftActionColumn" class="sub-form-action-column hide-label">
          <div class="action-button-column">
            <el-button :disabled="actionDisabled || insertDisabled"
                       circle @click="insertSubFormRow(sfrIdx)"
                       v-show="!isReadMode" :title="i18nt('render.hint.insertSubFormRow')"><svg-icon icon-class="el-plus" /></el-button>
            <el-button :disabled="actionDisabled || deleteDisabled"
                       circle @click="deleteSubFormRow(sfrIdx)"
                       v-show="!isReadMode" :title="i18nt('render.hint.deleteSubFormRow')"><svg-icon icon-class="el-delete" /></el-button>
          </div>
        </div>
      </el-row>
    </div>

  </container-item-wrapper>
</template>

<script>
  import { provide, inject, reactive, toRefs, computed,nextTick , getCurrentInstance, onMounted, onBeforeUnmount  } from 'vue'

  import { useEmitter } from '@/utils/emitter'
  import { useI18n } from '@/utils/i18n'
  import { useRef } from "@/components/form-render/refMixin"
	import { useContainer } from "@/components/form-render/container-item/containerItemMixin"

  import {deepClone, generateId} from '@/utils/util'
  import ContainerItemWrapper from './container-item-wrapper'
  import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'
  import SvgIcon from '@/components/svg-icon'

  export default {
    name: "sub-form-item",
    componentName: 'ContainerItem',
    components: {
      ContainerItemWrapper,
      ...FieldComponents,
      SvgIcon,
    },
    props: {
      widget: Object,
    },
     setup(props){
      const { i18nt }= useI18n();
  		const { proxy } = getCurrentInstance()
      
      const refList=inject('refList')
      const sfRefList=inject('sfRefList')
      const globalModel=inject('globalModel')
      const getReadMode=inject('getReadMode')

      provide('getSubFormFieldFlag',() => true)
      provide('getSubFormName',() => props.widget.options.name)

      const data=reactive( {
        rowIdData: [],
        widgetSchemaData: [],
        actionDisabled: false,
        insertDisabled: false,  //是否禁止新增、插入记录
        deleteDisabled: false,  //是否禁止删除记录,
  
			  fieldSchemaData:[]
      })


      const refMixin = useRef(props);
      const emitterMixin =useEmitter();
      const containerMixin= useContainer(props,data,{});
      


      onMounted(()=>{
        handleSubFormFirstRowAdd()  //默认添加首行后，主动触发相关事件！！
      })

      onBeforeUnmount(()=>{
        containerMixin.unregisterFromRefList()
      })

      const isReadMode=computed(()=> {
        return getReadMode()
      })

      const leftActionColumn=computed(()=> {
        return (props.widget.options.actionColumnPosition || 'left') === 'left'
      })


      const getLabelAlign=(widget, subWidget)=> {
        return subWidget.options.labelAlign || widget.options.labelAlign
      }

      const registerSubFormToRefList=()=> {
        if (props.widget.type === 'sub-form') {
          sfRefList[props.widget.options.name] = proxy
        }
      }

      const initRowIdData=(initFlag)=> {
        if (props.widget.type === 'sub-form') {
          data.rowIdData.splice(0, data.rowIdData.length)  //清除数组必须用splice，length=0不会响应式更新！！
          let subFormModel = containerMixin.formModel.value[props.widget.options.name]
          if (!!subFormModel && (subFormModel.length > 0)) {
            subFormModel.forEach(() => {
              data.rowIdData.push('id' + generateId())
            })

            if (!!initFlag) {
              //注意：事件触发需延期执行，SumFormDataChange事件处理代码中可能存在尚未创建完成的组件！！
              setTimeout(() => {
                handleSubFormRowChange(subFormModel)
              }, 800)
            }
          }
        }
      }

      const addToRowIdData=()=> {
        data.rowIdData.push('id' + generateId())
      }

      const insertToRowIdData=(rowIndex)=> {
        data.rowIdData.splice(rowIndex, 0, 'id' + generateId())
      }

      const deleteFromRowIdData=(rowIndex)=> {
        data.rowIdData.splice(rowIndex, 1)
      }

      const getRowIdData=()=>{
        return data.rowIdData
      }

      const getWidgetRefOfSubForm=(widgetName, rowIndex)=> {
        let realWidgetName = widgetName + '@row' + data.rowIdData[rowIndex]
        return emitterMixin.getWidgetRef(realWidgetName)
      }

      const initFieldSchemaData=()=> {  //初始化fieldSchemaData！！！
        if (props.widget.type !== 'sub-form') {
          return
        }

        let rowLength = data.rowIdData.length
        data.fieldSchemaData.splice(0, data.fieldSchemaData.length)  //清除数组必须用splice，length=0不会响应式更新！！
        if (rowLength > 0) {
          for (let i = 0; i < rowLength; i++) {
            let fieldSchemas = []
            props.widget.widgetList.forEach(swItem => {
              fieldSchemas.push(cloneFieldSchema(swItem) )
            })
            data.fieldSchemaData.push(fieldSchemas)
          }
        }
      }
            
      const addToFieldSchemaData=(rowIndex)=> {
        let fieldSchemas = []
        props.widget.widgetList.forEach(swItem => {
          fieldSchemas.push(cloneFieldSchema(swItem) )
        })

        if (rowIndex === undefined) {
          data.fieldSchemaData.push(fieldSchemas)
        } else {
          data.fieldSchemaData.splice(rowIndex, 0, fieldSchemas)
        }
      }

      const deleteFromFieldSchemaData=(rowIndex)=> {
        data.fieldSchemaData.splice(rowIndex, 1)
      }

      const cloneFieldSchema=(fieldWidget)=> {
        let newFieldSchema = deepClone(fieldWidget)
        newFieldSchema.id = fieldWidget.type + generateId()
        return newFieldSchema
      }

      const initEventHandler=()=> {
        if (props.widget.type !== 'sub-form') {
          return
        }

        emitterMixin.on$('setFormData', (newFormData) => {
          initRowIdData(false)
          initFieldSchemaData()

          let subFormData = newFormData[props.widget.options.name] || []
          setTimeout(() => {  //延时触发SubFormRowChange事件, 便于更新计算字段！！
            handleSubFormRowChange(subFormData)
          }, 800)
        })
      }

      const handleSubFormFirstRowAdd=()=> {
        if (props.widget.type !== 'sub-form') {
          return
        }

        if (!!props.widget.options.showBlankRow && (data.rowIdData.length === 1)) {
          let oldSubFormData = containerMixin.formModel.value[props.widget.options.name] || []
          
          //确认组件创建成功后触发事件!!
          nextTick(() => {
            handleSubFormRowAdd(oldSubFormData, data.rowIdData[0])
            handleSubFormRowChange(oldSubFormData)
          })
        }
      }

      const addSubFormRow=() =>{
        let newSubFormDataRow = {}
        props.widget.widgetList.forEach(subFormItem => {
          if (!!subFormItem.formItemFlag) {
            newSubFormDataRow[subFormItem.options.name] = subFormItem.options.defaultValue
          }
        })

        let oldSubFormData = containerMixin.formModel.value[props.widget.options.name] || []
        oldSubFormData.push(newSubFormDataRow)
        addToRowIdData()
        addToFieldSchemaData()


        nextTick(() => {
          handleSubFormRowAdd(oldSubFormData, data.rowIdData[oldSubFormData.length - 1])
          handleSubFormRowChange(oldSubFormData)
        })
      }

      const insertSubFormRow=(beforeFormRowIndex)=> {
        let newSubFormDataRow = {}
        props.widget.widgetList.forEach(subFormItem => {
          if (!!subFormItem.formItemFlag) {
            newSubFormDataRow[subFormItem.options.name] = subFormItem.options.defaultValue
          }
        })

        let oldSubFormData = containerMixin.formModel.value[props.widget.options.name] || []
        oldSubFormData.splice(beforeFormRowIndex, 0, newSubFormDataRow)
        insertToRowIdData(beforeFormRowIndex)
        addToFieldSchemaData(beforeFormRowIndex)
        
        //确认组件创建成功后触发事件!!
        nextTick(() => {
          handleSubFormRowInsert(oldSubFormData, data.rowIdData[beforeFormRowIndex])
          handleSubFormRowChange(oldSubFormData)
        })
      }

      const deleteSubFormRow=(formRowIndex)=> {
        proxy.$confirm(i18nt('render.hint.deleteSubFormRow') + '?', i18nt('render.hint.prompt'), {
          confirmButtonText: i18nt('render.hint.confirm'),
          cancelButtonText: i18nt('render.hint.cancel')
        }).then(() => {
          let oldSubFormData = containerMixin.formModel.value[props.widget.options.name] || []
          let deletedDataRow = deepClone(oldSubFormData[formRowIndex])
          oldSubFormData.splice(formRowIndex, 1)
          deleteFromRowIdData(formRowIndex)
          deleteFromFieldSchemaData(formRowIndex)
          //确认组件创建成功后触发事件!!
          nextTick(() => {
            handleSubFormRowDelete(oldSubFormData, deletedDataRow)
            handleSubFormRowChange(oldSubFormData)
          })
        }).catch(() => {
          //
        })
      }

      const handleSubFormRowChange=(subFormData)=> {
        if (!!props.widget.options.onSubFormRowChange) {
          let customFunc = new Function('subFormData', props.widget.options.onSubFormRowChange)
          customFunc.call(props, subFormData)
        }
      }

      const handleSubFormRowAdd=(subFormData, newRowId)=> {
        if (!!props.widget.options.onSubFormRowAdd) {
          let customFunc = new Function('subFormData', 'newRowId', props.widget.options.onSubFormRowAdd)
          customFunc.call(props, subFormData, newRowId)
        }
      }

      const handleSubFormRowInsert=(subFormData, newRowId)=> {
        if (!!props.widget.options.onSubFormRowInsert) {
          let customFunc = new Function('subFormData', 'newRowId', props.widget.options.onSubFormRowInsert)
          customFunc.call(props, subFormData, newRowId)
        }
      }

      const handleSubFormRowDelete=(subFormData, deletedDataRow)=> {
        if (!!props.widget.options.onSubFormRowDelete) {
          let customFunc = new Function('subFormData', 'deletedDataRow', props.widget.options.onSubFormRowDelete)
          customFunc.call(props, subFormData, deletedDataRow)
        }
      }

      const setDisabled=(flag)=> {
        if (!!flag) {
          containerMixin.disableSubForm()
        } else {
          containerMixin.enableSubForm()
        }
      }

      /**
       * 设置单行子表单是否禁止新增、插入记录
       * @param flag
       */
      const setInsertDisabled=(flag)=> {
        data.insertDisabled = flag
      }

      /**
       * 设置单行子表单是否禁止删除记录
       * @param flag
       */
      const setDeleteDisabled=(flag)=> {
        data.deleteDisabled = flag
      }


      refMixin.initRefList()
      registerSubFormToRefList()
      initRowIdData(true)
      initFieldSchemaData()
      initEventHandler()

      return {
        i18nt,
        ...toRefs(props),
        ...toRefs(data),

        isReadMode,
        leftActionColumn,

        getLabelAlign,
        registerSubFormToRefList,
        initRowIdData,
        addToRowIdData,
        insertToRowIdData,
        deleteFromRowIdData,
        getRowIdData,
        getWidgetRefOfSubForm,
        initFieldSchemaData,
        addToFieldSchemaData,
        deleteFromFieldSchemaData,
        cloneFieldSchema,
        handleSubFormFirstRowAdd,
        addSubFormRow,
        insertSubFormRow,
        deleteSubFormRow,
        handleSubFormRowChange,
        handleSubFormRowAdd,
        handleSubFormRowInsert,
        handleSubFormRowDelete,
        setDisabled,
        setInsertDisabled,
        setDeleteDisabled
      }

    }
  }
</script>

<style lang="scss" scoped>
  .sub-form-container {
    margin-bottom: 8px;
    text-align: left; //IE浏览器强制居左对齐

    :deep(.el-row.header-row) {
      padding: 0;
    }

    :deep(.el-row.sub-form-row) {
      padding: 0;

      .row-number-span {
        margin-left: 16px;
      }
    }
  }

  div.action-header-column {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 120px;
    border: 1px solid #e1e2e3;
    background: #f1f2f3;
    padding: 8px;

    .action-label {
      margin-right: 12px;
    }

    .action-button {
      padding-left: 8px;
      padding-right: 8px;
    }
  }

  div.row-no-header-column {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    text-align: center;
    border: 1px solid #e1e2e3;
    background: #f1f2f3;
  }

  div.field-header-column {
    display: flex;
    align-items: center;
    justify-content: center;
    //overflow: hidden;
    //white-space: nowrap;  //文字超出长度不自动换行
    //text-overflow: ellipsis;  //文字超出长度显示省略号
    border: 1px solid #e1e2e3;
    background: #f1f2f3;
    padding: 8px;

    span.custom-label i {
      margin: 0 3px;
    }
  }

  div.field-header-column.is-required:before {
    content: '*';
    color: #F56C6C;
    margin-right: 4px;
  }

  div.label-center-left {
    text-align: left;
  }

  div.label-center-align {
    text-align: center;
  }

  div.label-right-align {
    text-align: right;
  }

  div.sub-form-action-column {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 120px;
    border: 1px solid #e1e2e3;
    padding: 8px;

    :deep(.el-form-item) {
      margin-bottom: 0;
    }

    :deep(.el-button) {
      font-size: 14px;
      padding: 0;
      background: #DCDFE6;
      border: 4px solid #DCDFE6;
    }

  }

  div.sub-form-action-column.hide-label {
    :deep(.el-form-item__label) {
      display: none;
    }
  }

  div.row-no-column {
    display: flex;
    align-items: center;
    width: 50px;
    border: 1px solid #e1e2e3;
  }

  div.sub-form-table-column {
    display: inline-block;
    border: 1px solid #e1e2e3;
    padding: 8px;

    :deep(.el-form-item) {
      margin-left: 4px;
      margin-right: 4px;
      margin-bottom: 0;
    }

    :deep(.el-form-item__content) {
      margin-left: 0 !important;
    }
  }

  div.sub-form-table-column.hide-label {
    :deep(.el-form-item__label) {
      display: none;
    }
  }

</style>
