<template>
  <container-item-wrapper :widget="widget">

    <div :key="widget.id" class="sub-form-container"
         v-show="!widget.options.hidden">
      <el-row class="header-row">
        <div class="action-header-column">
          <span class="action-label">{{i18nt('render.hint.subFormAction')}}</span>
          <el-button v-if="!isReadMode" :disabled="actionDisabled || insertDisabled"
                     round type="primary" size="small" class="action-button"
                     @click="addSubFormRow" :title="i18nt('render.hint.subFormAddActionHint')">
            {{i18nt('render.hint.subFormAddAction')}}<i class="el-icon-plus el-icon-right"></i></el-button>
        </div>
      </el-row>
      <div v-for="(subFormRowId, sfrIdx) in rowIdData" class="sub-form-row" :key="subFormRowId">
        <div v-if="leftActionColumn" class="sub-form-action-column hide-label">
          <div class="action-button-column">
            <el-button :disabled="actionDisabled || insertDisabled"
                       circle type="" icon="el-icon-circle-plus-outline" @click="insertSubFormRow(sfrIdx)"
                       v-show="!isReadMode" :title="i18nt('render.hint.insertSubFormRow')"></el-button>
            <el-button :disabled="actionDisabled || deleteDisabled"
                       circle type="" icon="el-icon-delete" @click="deleteSubFormRow(sfrIdx)"
                       v-show="!isReadMode" :title="i18nt('render.hint.deleteSubFormRow')"></el-button>
            <span v-if="widget.options.showRowNumber" class="row-number-span">#{{sfrIdx+1}}</span>
          </div>
        </div>
        <div v-if="!leftActionColumn && widget.options.showRowNumber" class="row-no-column">
          <span v-if="widget.options.showRowNumber" class="row-number-span">#{{sfrIdx+1}}</span>
        </div>
        <div class="grid-sub-form-data-row">
          <template v-for="(subWidget, swIdx) in widget.widgetList" :key="widgetSchemaData[sfrIdx][swIdx].id">
            <component :is="getComponentByContainer(subWidget)" :widget="widgetSchemaData[sfrIdx][swIdx]"
                       :parent-list="widget.widgetList"
                       :index-of-parent-list="swIdx" :parent-widget="widget"
                       :sub-form-row-id="subFormRowId" :sub-form-row-index="sfrIdx" :sub-form-col-index="swIdx">
              <!-- 子表单暂不支持插槽！！！ -->
            </component>
          </template>
        </div>
        <div v-if="!leftActionColumn" class="sub-form-action-column hide-label">
          <div class="action-button-column">
            <el-button :disabled="actionDisabled || insertDisabled"
                       circle type="" icon="el-icon-circle-plus-outline" @click="insertSubFormRow(sfrIdx)"
                       v-show="!isReadMode" :title="i18nt('render.hint.insertSubFormRow')"></el-button>
            <el-button :disabled="actionDisabled || deleteDisabled"
                       circle type="" icon="el-icon-delete" @click="deleteSubFormRow(sfrIdx)"
                       v-show="!isReadMode" :title="i18nt('render.hint.deleteSubFormRow')"></el-button>
          </div>
        </div>
      </div>
    </div>

  </container-item-wrapper>
</template>

<script>
  import { provide, inject, reactive, toRefs, computed,nextTick, getCurrentInstance, onMounted, onBeforeUnmount  } from 'vue'

  import { useEmitter } from '@/utils/emitter'
  import { useI18n } from '@/utils/i18n'
  import { useRef } from "@/components/form-render/refMixin"
	import { useContainer } from "@/components/form-render/container-item/containerItemMixin"

  import {deepClone, generateId, traverseFieldWidgetsOfContainer} from "@/utils/util"
  import ContainerItemWrapper from './container-item-wrapper'
  import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'

  export default {
    name: "grid-sub-form-item",
    componentName: 'ContainerItem',
    components: {
      ContainerItemWrapper,
      ...FieldComponents,
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
        deleteDisabled: false,  //是否禁止删除记录

        fieldWidgetList: [],
      })

      const refMixin = useRef(props);
      const emitterMixin =useEmitter();
      const containerMixin= useContainer(props,data,{});

      const isReadMode=computed(()=> {
        return getReadMode()
      })

      const leftActionColumn=computed(()=> {
        return (props.widget.options.actionColumnPosition || 'left') === 'left'
      })


      const extractFieldWidgetList=()=> {
        data.fieldWidgetList.splice(0, data.fieldWidgetList.length)
        let fieldListFn = (fw) => {
          data.fieldWidgetList.push(fw)
        }
        traverseFieldWidgetsOfContainer(props.widget, fieldListFn)
      }

      const getLabelAlign=(widget, subWidget)=> {
        return subWidget.options.labelAlign || widget.options.labelAlign
      }

      const registerSubFormToRefList=()=> {
        if (props.widget.type === 'grid-sub-form') {
          sfRefList[props.widget.options.name] = proxy
        }
      }

      const initRowIdData=(initFlag)=> {
        if (props.widget.type === 'grid-sub-form') {
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

      const getRowIdData=()=> {
        return data.rowIdData
      }

      const getWidgetRefOfSubForm=(widgetName, rowIndex)=> {
        let realWidgetName = widgetName + '@row' + data.rowIdData[rowIndex]
        return emitterMixin.getWidgetRef(realWidgetName)
      }

      const initWidgetSchemaData=()=> {  //初始化widgetSchemaData！！！
        if (props.widget.type !== 'grid-sub-form') {
          return
        }

        let rowLength = data.rowIdData.length
        data.widgetSchemaData.splice(0, data.widgetSchemaData.length)  //清除数组必须用splice，length=0不会响应式更新！！
        if (rowLength > 0) {
          for (let i = 0; i < rowLength; i++) {
            let widgetSchemas = []
            props.widget.widgetList.forEach(swItem => {
              widgetSchemas.push( cloneSchemaOfWidget(swItem) )
            })
            data.widgetSchemaData.push(widgetSchemas)
          }
        }
      }

      const addToWidgetSchemaData=(rowIndex)=> {
        let widgetSchemas = []
        props.widget.widgetList.forEach(swItem => {
          widgetSchemas.push( cloneSchemaOfWidget(swItem) )
        })

        if (rowIndex === undefined) {
          data.widgetSchemaData.push(widgetSchemas)
        } else {
          data.widgetSchemaData.splice(rowIndex, 0, widgetSchemas)
        }
      }

      const deleteFromWidgetSchemaData=(rowIndex)=> {
        data.widgetSchemaData.splice(rowIndex, 1)
      }

      const cloneSchemaOfWidget=(widget)=> {
        let newWidgetSchema = deepClone(widget)
        newWidgetSchema.id = widget.type + generateId()
        return newWidgetSchema
      }

      const initEventHandler=()=> {
        if (props.widget.type !== 'grid-sub-form') {
          return
        }

        emitterMixin.on$('setFormData', (newFormData) => {
          initRowIdData(false)
          initWidgetSchemaData()

          let subFormData = newFormData[props.widget.options.name] || []
          setTimeout(() => {  //延时触发SubFormRowChange事件, 便于更新计算字段！！
            handleSubFormRowChange(subFormData)
          }, 800)
        })
      }

      const handleSubFormFirstRowAdd=()=> {
        if (props.widget.type !== 'grid-sub-form') {
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

      const addSubFormRow=()=> {
        let newSubFormDataRow = {}
        data.fieldWidgetList.forEach(subFormItem => {
          if (!!subFormItem.formItemFlag) {
            newSubFormDataRow[subFormItem.options.name] = subFormItem.options.defaultValue
          }
        })

        let oldSubFormData = containerMixin.formModel.value[props.widget.options.name] || []
        oldSubFormData.push(newSubFormDataRow)
        addToRowIdData()
        addToWidgetSchemaData()

        //确认组件创建成功后触发事件!!
        nextTick(() => {
          handleSubFormRowAdd(oldSubFormData, data.rowIdData[oldSubFormData.length - 1])
          handleSubFormRowChange(oldSubFormData)
        })
      }

      const insertSubFormRow=(beforeFormRowIndex)=> {
        let newSubFormDataRow = {}
        data.fieldWidgetList.forEach(subFormItem => {
          if (!!subFormItem.formItemFlag) {
            newSubFormDataRow[subFormItem.options.name] = subFormItem.options.defaultValue
          }
        })

        let oldSubFormData = containerMixin.formModel.value[props.widget.options.name] || []
        oldSubFormData.splice(beforeFormRowIndex, 0, newSubFormDataRow)
        insertToRowIdData(beforeFormRowIndex)
        addToWidgetSchemaData(beforeFormRowIndex)

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
          deleteFromWidgetSchemaData(formRowIndex)

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
          customFunc.call(proxy, subFormData)
        }
      }

      const handleSubFormRowAdd=(subFormData, newRowId)=> {
        if (!!props.widget.options.onSubFormRowAdd) {
          let customFunc = new Function('subFormData', 'newRowId', props.widget.options.onSubFormRowAdd)
          customFunc.call(proxy, subFormData, newRowId)
        }
      }

      const handleSubFormRowInsert=(subFormData, newRowId)=> {
        if (!!props.widget.options.onSubFormRowInsert) {
          let customFunc = new Function('subFormData', 'newRowId', props.widget.options.onSubFormRowInsert)
          customFunc.call(proxy, subFormData, newRowId)
        }
      }

      const handleSubFormRowDelete=(subFormData, deletedDataRow)=> {
        if (!!props.widget.options.onSubFormRowDelete) {
          let customFunc = new Function('subFormData', 'deletedDataRow', props.widget.options.onSubFormRowDelete)
          customFunc.call(proxy, subFormData, deletedDataRow)
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
      
      /**
       * 单独给子表单赋值
       * 注意：该方法仅触发组件的onChange事件以及子表单的onFormRowChange事件，不会触发表单的onFormDataChange等其他事件！！
       * @param subFormValues
       */
      const setSubFormValues=(subFormValues)=> {
        globalModel.formModel[props.widget.options.name] = subFormValues
        initRowIdData(false)
        initWidgetSchemaData()

        setTimeout(() => {  //延时触发SubFormRowChange事件, 便于更新计算字段！！
          handleSubFormRowChange(subFormValues)
        }, 800)
      }




      onMounted(()=>{
        extractFieldWidgetList()
        handleSubFormFirstRowAdd()  //默认添加首行后，主动触发相关事件！！
      })

      onBeforeUnmount(()=>{
        containerMixin.unregisterFromRefList()
      })

      refMixin.initRefList()
      registerSubFormToRefList()
      initRowIdData(true)
      initWidgetSchemaData()
      initEventHandler()





      return {
        i18nt,
        ...refMixin,
        ...toRefs(props),
        ...toRefs(data),

        isReadMode,
        leftActionColumn,

        extractFieldWidgetList,
        getLabelAlign,
        registerSubFormToRefList,
        initRowIdData,
        addToRowIdData,
        insertToRowIdData,
        deleteFromRowIdData,
        getRowIdData,
        getWidgetRefOfSubForm,
        initWidgetSchemaData,
        addToWidgetSchemaData,
        deleteFromWidgetSchemaData,
        cloneSchemaOfWidget,
        initEventHandler,
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
        setDeleteDisabled,
        setSubFormValues
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
      display: flex;
    }

    :deep(div.sub-form-row) {
      padding: 0;
      display: flex;
      align-items: center;
      border: 1px solid #e1e2e3;

      .row-number-span {
        margin-left: 16px;
      }
    }
  }

  div.action-header-column {
    display: inline-block;
    //width: 120px;
    width: 100%;
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

  div.field-header-column {
    display: inline-block;
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
    display: inline-block;
    align-items: center;
    text-align: center;
    width: 120px;
    padding: 8px;

    :deep(.el-form-item) {
      margin-bottom: 0;
    }

  :deep(.el-button) {
      font-size: 18px;
      padding: 0;
      background: #DCDFE6;
      border: 4px solid #DCDFE6;
    }

  }

  div.grid-sub-form-data-row {
    display: inline-block;
    width: 100%;
    border-left: 1px solid #e1e2e3;
    border-right: 1px solid #e1e2e3;
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
    border-radius: 10px;
    background: #f1f2f3;
    padding: 5px 0;
    margin: 0 6px;
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
