<!--
/**
 * author: vformAdmin
 * email: vdpadmin@163.com
 * website: https://www.vform666.com
 * date: 2021.08.18
 * remark: 如果要分发VForm源码，需在本文件顶部保留此文件头信息！！
 */
-->

<template>
  <el-form :label-position="labelPosition" :size="size" :class="[customClass, readModeFlag ? 'readonly-mode-form' : '']" class="render-form"
           :label-width="labelWidth" :validate-on-rule-change="false"
           :model="formDataModel" ref="renderForm"
           @submit.prevent>
    <template v-for="(widget, index) in widgetList">
      <template v-if="'container' === widget.category">
        <component :is="getContainerWidgetName(widget)" :widget="widget" :key="widget.id" :parent-list="widgetList"
                        :index-of-parent-list="index" :parent-widget="null">
          <!-- 递归传递插槽！！！ -->
          <template v-for="slot in Object.keys($slots)" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope"/>
          </template>
        </component>
      </template>
      <template v-else>
        <component :is="getWidgetName(widget)" :field="widget" :form-model="formDataModel" :designer="null" :key="widget.id" :parent-list="widgetList"
                      :index-of-parent-list="index" :parent-widget="null">
          <!-- 递归传递插槽！！！ -->
          <template v-for="slot in Object.keys($slots)" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope"/>
          </template>
        </component>
      </template>
    </template>
  </el-form>
</template>

<script>
  import { createVNode,computed , render,provide , reactive,ref,toRefs,getCurrentInstance,onMounted ,nextTick  } from 'vue'
  //import ElForm from 'element-ui/packages/form/src/form.vue'  /* 用于源码调试Element UI */
	import { useEmitter } from '@/utils/emitter'
  import { useI18n,changeLocale } from '@/utils/i18n'

  import './container-item/index'
  import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'
  import {
    generateId,
    deepClone,
    insertCustomCssToHead,
    insertGlobalFunctionsToHtml,
    getAllContainerWidgets,
    getAllFieldWidgets,
    traverseFieldWidgets,
    buildDefaultFormJson,
    getDSByName,
    runDataSourceRequest,
    getFieldWidgetByName,
    overwriteObj,
    getContainerWidgetByName,
    traverseFieldWidgetsOfContainer,
    cloneFormConfigWithoutEventHandler
  } from "@/utils/util"
  import DynamicDialog from './dynamic-dialog'
  import DynamicDrawer from './dynamic-drawer'

  export default {
    name: "VFormRender",
    componentName: 'VFormRender',
    components: {
      //ElForm,

      ...FieldComponents,
    },
    props: {
      formJson: { //prop传入的表单JSON配置
        type: Object,
        default: () => buildDefaultFormJson()
      },
      formData: { //prop传入的表单数据
        type: Object,
        default: () => ({})
      },
      optionData: { //prop传入的选项数据
        type: Object,
        default: () => ({})
      },
      previewState: { //是否表单预览状态
        type: Boolean,
        default: false
      },
      disabledMode: { //表单禁止编辑模式
        type: Boolean,
        default: false,
      },
      renderConfig: { //渲染配置对象
        type: Object,
        default: () => {
          return {
            languageName: 'zh-CN',  //界面语言，默认显示中文
          }
        }
      },
      globalDsv: { // 全局数据源变量
        type: Object,
        default: () => ({})
      },
      parentForm: {
        type: Object,
        default: null
      },
      dynamicCreation: { //是否弹窗、抽屉动态创建的VFormRender
        type: Boolean,
        default: false
      }
    },
	  setup(props,ctx){      
      	const { i18nt }= useI18n();
        const { proxy } = getCurrentInstance()
        
        const emitterMixin =useEmitter();

        const renderForm=ref(null)

        const data=reactive({		
            formJsonObj: props.formJson,

            formDataModel: {
              //
            },

            widgetRefList: {},
            subFormRefList: {},
            formId: null,  //表单唯一Id，用于区分页面上的多个v-form-render组件！！

            externalComponents:  {},  //外部组件实例集合
            readModeFlag: false,  //是否只读查看模式
            dialogOrDrawerRef: null, //保存子级VFormRender的包裹弹窗组件或抽屉组件的ref
            childFormRef: null, //保存子级VFormRender组件的ref

            dsResultCache: {},  //数据源请求结果缓存
        })


        provide('refList', data.widgetRefList)
        provide('sfRefList', data.subFormRefList)  //收集SubForm引用
        provide('getFormConfig', () => data.formJsonObj.formConfig)  /* 解决provide传递formConfig属性的响应式更新问题！！ */
        provide('getGlobalDsv', () => props.globalDsv) // 全局数据源变量
        provide('globalOptionData', props.optionData)
        provide('getOptionData', () => props.optionData)  /* 该方法用于在异步更新option-data之后重新获取到最新值 */
        provide('globalModel', {
                    formModel: data.formDataModel,
                })
        provide('previewState', props.previewState)
        provide('getReadMode', () => data.readModeFlag)
        provide('getSubFormFieldFlag', () => false)
        provide('getSubFormName', () => '')
        provide('getDSResultCache', () => data.dsResultCache)

        const formConfig=computed(()=> {
          return data.formJsonObj.formConfig
        })

        const widgetList=computed(()=> {
          return data.formJsonObj.widgetList
        })

        const labelPosition=computed(()=> {
          if (!!formConfig.value && !!formConfig.value.labelPosition) {
            return formConfig.value.labelPosition
          }

          return 'left'
        })

        const labelWidth=computed(()=> {
          if (!!formConfig.value && !!formConfig.value.labelWidth) {
            return formConfig.value.labelWidth + 'px'
          }

          return '80px'
        })

        const size=computed(()=> {
          if (!!formConfig.value && !!formConfig.value.size) {
            return formConfig.value.size
          }

          return 'default'
        })

        const customClass=computed(()=> {
          return !!formConfig.value && !!formConfig.value.customClass ? formConfig.value.customClass : ''
        })

        onMounted(()=>{
          initLocale()
          initDataSetRequest()
          handleOnMounted()
        })






      const initFormObject=(insertHtmlCodeFlag = true)=> {
        data.formId = 'vfRender' + generateId()
        if (!!insertHtmlCodeFlag && !props.dynamicCreation) { // 弹窗、抽屉动态创建的VFormRender不重新插入全局CSS和全局函数节点！！
          insertCustomStyleAndScriptNode()
        }
        addFieldChangeEventHandler()
        addFieldValidateEventHandler()
        registerFormToRefList()
        handleOnCreated()

        if (!!props.disabledMode) { //禁止表单编辑
          nextTick(() => {
            disableForm()
          })
        }
      }

      const getContainerWidgetName=(widget)=> {
        if (widget.type === 'grid') {  //grid-item跟VueGridLayout全局注册组件重名，故特殊处理！！
          return 'vf-grid-item'
        }

        return widget.type + '-item'
      }

      const getWidgetName=(widget)=> {
        return widget.type + '-widget'
      }

      const initLocale=()=> {
        let curLocale = localStorage.getItem('v_form_locale') || 'zh-CN'
        changeLanguage(curLocale)
      }

      const insertCustomStyleAndScriptNode=()=> {
        if (!!formConfig.value && !!formConfig.value.cssCode) {
          insertCustomCssToHead(formConfig.value.cssCode,
              !!props.previewState ? '' : data.formId)
        }

        if (!!formConfig.value && !!formConfig.value.functions) {
          insertGlobalFunctionsToHtml(formConfig.value.functions,
              !!props.previewState ? '' : data.formId)
        }
      }

      const buildFormModel=(widgetList)=> {
        if (!!widgetList && (widgetList.length > 0)) {
          widgetList.forEach((wItem) => {
            buildDataFromWidget(wItem)
          })
        }
      }

      const buildDataFromWidget=(wItem)=> {
        if (wItem.category === 'container') {
          if (wItem.type === 'vf-dialog' || wItem.type === 'vf-drawer') {
            // 什么也不做，不处理弹窗、抽屉内部组件！！
          } else if (wItem.type === 'grid') {
            if (!!wItem.cols && (wItem.cols.length > 0)) {
              wItem.cols.forEach((childItem) => {
                buildDataFromWidget(childItem)
              })
            }
          } else if (wItem.type === 'table') {
            if (!!wItem.rows && (wItem.rows.length > 0)) {
              wItem.rows.forEach((rowItem) => {
                if (!!rowItem.cols && (rowItem.cols.length > 0)) {
                  rowItem.cols.forEach((colItem) => {
                    buildDataFromWidget(colItem)
                  })
                }
              })
            }
          } else if (wItem.type === 'tab') {
            if (!!wItem.tabs && (wItem.tabs.length > 0)) {
              wItem.tabs.forEach((tabItem) => {
                if (!!tabItem.widgetList && (tabItem.widgetList.length > 0)) {
                  tabItem.widgetList.forEach((childItem) => {
                    buildDataFromWidget(childItem)
                  })
                }
              })
            }
          } else if (wItem.type === 'sub-form') {
            let subFormName = wItem.options.name
            if (!props.formData.hasOwnProperty(subFormName)) {
              let subFormDataRow = {}
              if (wItem.options.showBlankRow) {
                wItem.widgetList.forEach(subFormItem => {
                  if (!!subFormItem.formItemFlag) {
                    subFormDataRow[subFormItem.options.name] = subFormItem.options.defaultValue
                  }
                })

                data.formDataModel[subFormName] = [subFormDataRow]
              } else {
                data.formDataModel[subFormName] = []
              }
            } else {
              let initialValue = props.formData[subFormName]
              data.formDataModel[subFormName] = deepClone(initialValue)
            }
          } else if (wItem.type === 'grid-sub-form')  {
            let gridSubFormName = wItem.options.name
            if (!props.formData.hasOwnProperty(gridSubFormName)) {
              let gsfFWList = []
              let fieldListFn = (fw) => {
                gsfFWList.push(fw)
              }
              traverseFieldWidgetsOfContainer(wItem, fieldListFn)

              let gridSubFormDataRow = {}
              if (wItem.options.showBlankRow) {
                gsfFWList.forEach(gridSubFormItem => {
                  gridSubFormDataRow[gridSubFormItem.options.name] = gridSubFormItem.options.defaultValue
                })
                data.formDataModel[gridSubFormName] = [gridSubFormDataRow]
              } else {
                data.formDataModel[gridSubFormName] = []
              }
            } else {
              let initialValue = props.formData[gridSubFormName]
              data.formDataModel[gridSubFormName] = deepClone(initialValue)
            }
          } else if ((wItem.type === 'grid-col') || (wItem.type === 'table-cell')) {
            if (!!wItem.widgetList && (wItem.widgetList.length > 0)) {
              wItem.widgetList.forEach((childItem) => {
                buildDataFromWidget(childItem)
              })
            }
          } else {  //自定义容器组件
            if (!!wItem.widgetList && (wItem.widgetList.length > 0)) {
              wItem.widgetList.forEach((childItem) => {
                buildDataFromWidget(childItem)
              })
            }
          }
        } else if (!!wItem.formItemFlag) {
          if (!props.formData.hasOwnProperty(wItem.options.name)) {
            data.formDataModel[wItem.options.name] = wItem.options.defaultValue
          } else {
            let initialValue = props.formData[wItem.options.name]
            data.formDataModel[wItem.options.name] = deepClone(initialValue)
          }
        }
      }

      const addFieldChangeEventHandler=()=> {
        emitterMixin.off$('fieldChange')  //移除原有事件监听
        emitterMixin.on$('fieldChange', (fieldName, newValue, oldValue, subFormName, subFormRowIndex) => {
          handleFieldDataChange(fieldName, newValue, oldValue, subFormName, subFormRowIndex)
          ctx.$emit('formChange', fieldName, newValue, oldValue, data.formDataModel, subFormName, subFormRowIndex)
        })
      }

      const addFieldValidateEventHandler=()=> {
        emitterMixin.off$('fieldValidation')  //移除原有事件监听
        emitterMixin.on$('fieldValidation', (fieldName) => {
          if (!!renderForm) {
            renderForm.value.validateField(fieldName)
          }
        })
      }

      const registerFormToRefList=()=> {
        data.widgetRefList['v_form_ref'] = proxy
      }

      const handleFieldDataChange=(fieldName, newValue, oldValue, subFormName, subFormRowIndex)=> {
        if (!!formConfig.value && !!formConfig.value.onFormDataChange) {
          let customFunc = new Function('fieldName', 'newValue', 'oldValue', 'formModel', 'subFormName', 'subFormRowIndex',
              formConfig.value.onFormDataChange)
          customFunc.call(proxy, fieldName, newValue, oldValue, data.formDataModel, subFormName, subFormRowIndex)
        }
      }

      const handleOnCreated=()=> {
        if (!!formConfig.value && !!formConfig.value.onFormCreated) {
          let customFunc = new Function(formConfig.value.onFormCreated)
          customFunc.call(proxy)
        }
      }

      const handleOnMounted=()=> {
        if (!!formConfig.value && !!formConfig.value.onFormMounted) {
          let customFunc = new Function(formConfig.value.onFormMounted)
          customFunc.call(proxy)
        }
      }

      const findWidgetAndSetDisabled=(widgetName, disabledFlag)=> {
        let foundW = getWidgetRef(widgetName)
        if (!!foundW && !!foundW.setDisabled) {
          foundW.setDisabled(disabledFlag)
        } else { //没找到，可能是子表单中的组件
          findWidgetOfSubFormAndSetDisabled(widgetName, disabledFlag)
        }
      }

      const findWidgetOfSubFormAndSetDisabled=(widgetName, disabledFlag)=> {
        const widgetSchema = getFieldWidgetByName(data.formJsonObj.widgetList, widgetName, true)
        if (!!widgetSchema && !!widgetSchema.options && widgetSchema.options.hasOwnProperty('disabled')) {
          widgetSchema.options.disabled = disabledFlag
        }

        findWidgetNameInSubForm(widgetName).forEach(wn => {
          let sw = getWidgetRef(wn)
          if (!!sw && !!sw.setDisabled) {
            sw.setDisabled(disabledFlag)
          }
        })
      }

      const findWidgetAndSetHidden=(widgetName, hiddenFlag)=> {
        let foundW = getWidgetRef(widgetName)
        if (!!foundW && !!foundW.setDisabled) {
          foundW.setHidden(hiddenFlag)
        } else { //没找到，可能是子表单中的组件
          findWidgetOfSubFormAndSetHidden(widgetName, hiddenFlag)
        }
      }

      const findWidgetOfSubFormAndSetHidden=(widgetName, hiddenFlag)=> {
        const widgetSchema = getFieldWidgetByName(data.formJsonObj.widgetList, widgetName, true)
        if (!!widgetSchema && !!widgetSchema.options && widgetSchema.options.hasOwnProperty('hidden')) {
          widgetSchema.options.hidden = hiddenFlag
        }

        findWidgetNameInSubForm(widgetName).forEach(wn => {
          let sw = getWidgetRef(wn)
          if (!!sw && !!sw.setDisabled) {
            sw.setHidden(hiddenFlag)
          }
        })
      }

      const findWidgetNameInSubForm=(widgetName)=> {
        let result = []
        let subFormName = null
        let handlerFn = (field, parent) => {
          if (!!field.options && (field.options.name === widgetName)) {
            subFormName = parent.options.name
          }
        }
        traverseFieldWidgets(widgetList, handlerFn)

        Object.keys(data.subFormRefList).forEach(sfName => {
          const fwHandler = (fw) => {
            if (fw.options.name === widgetName) {
              subFormName = sfName
            }
          }

          const sfRef = data.subFormRefList[sfName]
          traverseFieldWidgetsOfContainer(sfRef.widget, fwHandler)
        })

        if (!!subFormName) {
          let subFormRef = getWidgetRef(subFormName)
          if (!!subFormRef) {
            let rowIds = subFormRef.getRowIdData()
            if (!!rowIds && (rowIds.length > 0)) {
              rowIds.forEach(rid => {
                result.push( widgetName + '@row' + rid)
              })
            }
          }
        }

        return result
      }

      const initDataSetRequest=()=> {
        let dsNameSet = new Set()
        getFieldWidgets().forEach(fw => {
          if (!!fw.field.options.dsEnabled && !!fw.field.options.dsName && !!fw.field.options.dataSetName) {
            dsNameSet.add(fw.field.options.dsName)
          }
        })

        if (dsNameSet.size > 0) {
          dsNameSet.forEach(async (dsName) => {
            let curDS = getDSByName(formConfig.value, dsName)
            if (!!curDS) {
              let localDsv = new Object({})
              overwriteObj(localDsv, props.globalDsv || {})
              let dsResult = null
              try {
                dsResult = await runDataSourceRequest(curDS, localDsv, proxy, false, proxy.$message)
                data.dsResultCache[dsName] = dsResult
                emitterMixin.broadcast('FieldWidget', 'loadOptionItemsFromDataSet', dsName)  //注意：跟Vue2不同，事件参数不需要包含在数组中传递！！
              } catch (err) {
                proxy.$message.error(err.message)
              }
            }
          })
        }
      }

      //--------------------- 以下为组件支持外部调用的API方法 begin ------------------//
      /* 提示：用户可自行扩充这些方法！！！ */

      const changeLanguage=(langName)=> {
        changeLocale(langName)
      }

      const getLanguageName=()=> {
        return localStorage.getItem('v_form_locale') || 'zh-CN'
      }

      const getNativeForm=()=> { //获取原生form引用
        return renderForm
      }

      const getFormRef=()=> {
        return proxy
      }

      const getWidgetRef=(widgetName, showError = false)=> {
        let foundRef = data.widgetRefList[widgetName]
        if (!foundRef && !!showError) {
          proxy.$message.error(i18nt('render.hint.refNotFound') + widgetName)
        }
        return foundRef
      }

      const clearFormDataModel=()=> {
        for (let pkey in data.formDataModel) {
          delete data.formDataModel[pkey]
        }
      }

      const getFormJson=()=> {
        return data.formJsonObj
      }

      /**
       * 动态加载表单JSON
       * @param newFormJson
       */
      const setFormJson=(newFormJson)=> {
        if (!!newFormJson) {
          if ((typeof newFormJson === 'string') || (newFormJson.constructor === Object)) {
            let newFormJsonObj = null
            if (typeof newFormJson === 'string') {
              newFormJsonObj = JSON.parse(newFormJson)
            } else {
              newFormJsonObj = newFormJson
            }

            if (!newFormJsonObj.formConfig || !newFormJsonObj.widgetList) {
              proxy.$message.error('Invalid format of form json.')
              return
            }

            /* formDataModel必须在widgetList赋值完成初始化，因为widgetList赋值意味着子组件开始创建！！！ */
            //data.formDataModel = {}  //清空表单数据对象（有bug，会导致表单校验失败！！）
            clearFormDataModel()  //上行代码有问题，会导致表单校验失败，故保留原对象引用只清空对象属性！！
            buildFormModel(newFormJsonObj.widgetList)

            data.formJsonObj['formConfig'] = newFormJsonObj.formConfig
            data.formJsonObj['widgetList'] = newFormJsonObj.widgetList

            insertCustomStyleAndScriptNode()  /* 必须先插入表单全局函数，否则VForm内部引用全局函数会报错！！！ */
            nextTick(() => {
              initFormObject(false)
              initDataSetRequest()
              handleOnMounted()
            })
          } else {
            proxy.$message.error('Set form json failed.')
          }
        }
      }

      /**
       * 重新加载选项数据
       * @param widgetNames 指定重新加载的组件名称或组件名数组，不传则重新加载所有选项字段
       */
      const reloadOptionData=(widgetNames)=> {
        let eventParams = []
        if (!!widgetNames && (typeof widgetNames === 'string')) {
          eventParams = [widgetNames]
        } else if (!!widgetNames && Array.isArray(widgetNames)) {
          eventParams = [...widgetNames]
        }
        emitterMixin.broadcast('FieldWidget', 'reloadOptionItems', eventParams)
      }

      const getFormData=(needValidation = true)=> {
        if (!needValidation) {
          return data.formDataModel
        }

        let callback = function nullFunc() {}
        let promise = new window.Promise(function (resolve, reject) {
          callback = function(formData, error) {
            !error ? resolve(formData) : reject(error);
          };
        });

        renderForm.value.validate((valid) => {
          if (valid) {
            callback(data.formDataModel)
          } else {
            callback(data.formDataModel, i18nt('render.hint.validationFailed'))
          }
        })

        return promise
      }

      const setFormData=(formData)=> { //设置表单数据
        Object.keys(data.formDataModel).forEach(propName => {
          if (!!formData && formData.hasOwnProperty(propName)) {
            data.formDataModel[propName] = deepClone( formData[propName] )
          }
        })

        // 通知SubForm组件：表单数据更新事件！！
        emitterMixin.broadcast('ContainerItem', 'setFormData', data.formDataModel)
        // 通知FieldWidget组件：表单数据更新事件！！
        emitterMixin.broadcast('FieldWidget', 'setFormData', data.formDataModel)
      }

      const getFieldValue=(fieldName)=> { //单个字段获取值
        let fieldRef = getWidgetRef(fieldName)
        if (!!fieldRef && !!fieldRef.getValue) {
          return fieldRef.getValue()
        }

        if (!fieldRef) { //如果是子表单字段
          let result = []
          findWidgetNameInSubForm(fieldName).forEach(wn => {
            let sw = getWidgetRef(wn)
            if (!!sw && !!sw.getValue) {
              result.push( sw.getValue() )
            }
          })

          return result
        }
      }

      const setFieldValue=(fieldName, fieldValue)=> { //单个更新字段值
        let fieldRef = getWidgetRef(fieldName)
        if (!!fieldRef && !!fieldRef.setValue) {
          fieldRef.setValue(fieldValue)
        }

        if (!fieldRef) { //如果是子表单字段
          findWidgetNameInSubForm(fieldName).forEach(wn => {
            let sw = getWidgetRef(wn)
            if (!!sw && !!sw.setValue) {
              sw.setValue(fieldValue)
            }
          })
        }
      }

      const getSubFormValues=(subFormName, needValidation = true)=> {
        let foundSFRef = data.subFormRefList[subFormName]
        return foundSFRef.getSubFormValues(needValidation)
      }
      
      const setSubFormValues=(subFormName, subFormValues) => {
        let foundSFRef = data.subFormRefList[subFormName]
        return foundSFRef.setSubFormValues(subFormValues)
      }


      const disableForm=()=> {
        let wNameList = Object.keys(data.widgetRefList)
        wNameList.forEach(wName => {
          let foundW = getWidgetRef(wName)
          if (!!foundW) {
            if (!!foundW.widget && (foundW.widget.type === 'sub-form')) {
              foundW.disableSubForm()
            } else if (!!foundW.widget && (foundW.widget.type === 'grid-sub-form')) {
              foundW.disableGridSubForm()
            } else {
              !!foundW.setDisabled && foundW.setDisabled(true)
            }
          }
        })
      }

      const enableForm=()=> {
        let wNameList = Object.keys(data.widgetRefList)
        wNameList.forEach(wName => {
          let foundW = getWidgetRef(wName)
          if (!!foundW) {
            if (!!foundW.widget && (foundW.widget.type === 'sub-form')) {
              foundW.enableSubForm()
            } else if (!!foundW.widget && (foundW.widget.type === 'grid-sub-form')) {
              foundW.enableGridSubForm()
            } else {
              !!foundW.setDisabled && foundW.setDisabled(false)
            }
          }
        })
      }

      const resetForm=()=> {  //重置表单
        let subFormNames = Object.keys(data.subFormRefList)
        subFormNames.forEach(sfName => {
          if (!!data.subFormRefList[sfName].resetSubForm) {
            data.subFormRefList[sfName].resetSubForm()
          }
        })

        let wNameList = Object.keys(data.widgetRefList)
        wNameList.forEach(wName => {
          let foundW = getWidgetRef(wName)
          if (!!foundW && !foundW.subFormItemFlag && !!foundW.resetField) { // 跳过子表单字段！！
            foundW.resetField()
          }
        })

        nextTick(() => {
          clearValidate()  /* 清除resetField方法触发的校验错误提示 */
        })
      }

      const clearValidate=(props)=> {
        renderForm.value.clearValidate(props)
      }

      /**
       * 校验表单
       * @param callback 回调函数
       */
      const validateForm=(callback)=> {
        renderForm.value.validate((valid) => {
          callback(valid)
        })
      }

      const validateFields=()=> {
        //TODO
      }

      const disableWidgets=(widgetNames)=> {
        if (!!widgetNames) {
          if (typeof widgetNames === 'string') {
            findWidgetAndSetDisabled(widgetNames, true)
          } else if (Array.isArray(widgetNames)) {
            widgetNames.forEach(wn => {
              findWidgetAndSetDisabled(wn, true)
            })
          }
        }
      }

      const enableWidgets=(widgetNames)=> {
        if (!!widgetNames) {
          if (typeof widgetNames === 'string') {
            findWidgetAndSetDisabled(widgetNames, false)
          } else if (Array.isArray(widgetNames)) {
            widgetNames.forEach(wn => {
              findWidgetAndSetDisabled(wn, false)
            })
          }
        }
      }

      const hideWidgets=(widgetNames)=> {
        if (!!widgetNames) {
          if (typeof widgetNames === 'string') {
            findWidgetAndSetHidden(widgetNames, true)
          } else if (Array.isArray(widgetNames)) {
            widgetNames.forEach(wn => {
              findWidgetAndSetHidden(wn, true)
            })
          }
        }
      }

      const showWidgets=(widgetNames)=> {
        if (!!widgetNames) {
          if (typeof widgetNames === 'string') {
            findWidgetAndSetHidden(widgetNames, false)
          } else if (Array.isArray(widgetNames)) {
            widgetNames.forEach(wn => {
              findWidgetAndSetHidden(wn, false)
            })
          }
        }
      }

      /**
       * 获取所有字段组件
       * @param staticWidgetsIncluded 是否包含按钮等静态组件，默认不包含
       * @returns {*[]}
       */
      const getFieldWidgets=(staticWidgetsIncluded = false)=> {
        return getAllFieldWidgets(data.formJsonObj.widgetList, staticWidgetsIncluded)
      }

      /**
       * 获取所有容器组件
       * @returns {*[]}
       */
      const getContainerWidgets=()=> {
        return getAllContainerWidgets(data.formJsonObj.widgetList)
      }

      /**
       * 增加外部组件引用，可通过getEC()方法获取外部组件，以便在VForm内部调用外部组件方法
       * @param componentName 外部组件名称
       * @param externalComponent 外部组件实例
       */
      const addEC=(componentName, externalComponent)=> {
        data.externalComponents[componentName] = externalComponent
      }

      /**
       * 判断外部组件是否可获取
       * @param componentName 外部组件名称
       * @returns {boolean}
       */
      const hasEC=(componentName)=> {
        return data.externalComponents.hasOwnProperty(componentName)
      }

      /**
       * 获取外部组件实例
       * @param componentName
       * @returns {*}
       */
      const getEC=(componentName)=> {
        return data.externalComponents[componentName]
      }

      /**
       * 设置或取消设置表单为只读查看模式
       * @param readonlyFlag
       */
      const setReadMode=(readonlyFlag = true)=> {
        data.readModeFlag = readonlyFlag
      }

      /**
       * 获取表单当前是否只读查看模式
       * @returns {boolean}
       */
      const getReadMode=()=> {
        return data.readModeFlag
      }

      /**
       * 获取globalDsv对象
       * @returns {*}
       */
      const getGlobalDsv=()=> {
        return props.globalDsv
      }

      /**
       * 执行数据源请求
       * @param dsName
       * @param localDsv
       */
      const executeDataSource=async (dsName, localDsv = {})=> {
        let ds = getDSByName(data.formJsonObj.formConfig, dsName)
        let newDsv = new Object({})
        overwriteObj(newDsv, props.globalDsv)
        overwriteObj(newDsv, localDsv)
        return await runDataSourceRequest(ds, newDsv, proxy, false, proxy.$message)
      }

      /**
       * 获取父级VFormRender组件实例
       * @returns {object}
       */
      const getParentFormRef=()=> {
        return props.parentForm
      }

      /**
       * 当显示多级嵌套弹窗或抽屉时，获取最顶层VFormRender组件实例
       * @returns {object}
       */
      const getTopFormRef=()=> {
        if (!props.parentForm) {
          return proxy
        }

        let topFormRef = props.parentForm
        while (topFormRef.parentForm) {
          topFormRef = topFormRef.parentForm
        }

        return topFormRef
      }

      const setChildFormRef=(childFormRef)=> {
        data.childFormRef = childFormRef
      }

      const getChildFormRef=()=> {
        return data.childFormRef
      }

      /**
       * 是否弹窗、抽屉组件动态创建的v-form-render
       * @returns {boolean}
       */
      const isDynamicCreation=()=> {
        return props.dynamicCreation
      }

      const setDialogOrDrawerRef=(ddRef)=> {
        data.dialogOrDrawerRef = ddRef
      }

      /**
       * 获取子级VFormRender的包裹弹窗组件或抽屉组件实例ref
       * @returns {object}
       */
      const getDialogOrDrawerRef=()=> {
        return data.dialogOrDrawerRef
      }

      /**
       * 显示弹窗表单，动态创建v-form-render组件，option-data、global-dsv等属性继承父级表单
       * @param dialogName
       * @param formData
       * @param extraData
       */
      const showDialog=(dialogName, formData = {}, extraData = {})=> {
        let topFormRef = getTopFormRef()
        let dialogCon = getContainerWidgetByName(topFormRef.widgetList, dialogName)
        if (!dialogName || (dialogCon.type !== 'vf-dialog')) {
          proxy.$message.error(i18nt('render.hint.refNotFound') + dialogName)
          return
        }
        let dFormJson = {
          widgetList: deepClone(dialogCon.widgetList),
          formConfig: cloneFormConfigWithoutEventHandler(topFormRef.formConfig)
        }

        let wrapperDivId = generateId() + ''
        let dialogInstance = createVNode(DynamicDialog, {
          options: dialogCon.options,
          formJson: dFormJson,
          formData: formData || {},
          optionData: topFormRef.optionData,
          globalDsv: topFormRef.globalDsv,
          parentFormRef: proxy,
          extraData: extraData,
          wrapperId: wrapperDivId,
        })
        dialogInstance.appContext = proxy.$root.$.appContext  //非常重要， 覆盖应用上下文！！

        let wrapperDiv = document.createElement("div")
        wrapperDiv.id = 'vf-dynamic-dialog-wrapper' + wrapperDivId
        document.body.appendChild(wrapperDiv)
        render(dialogInstance, wrapperDiv)
        document.body.appendChild( dialogInstance.el )
        dialogInstance.component.ctx.show()
      }

      const showDrawer=(drawerName, formData = {}, extraData = {})=> {
        let topFormRef = getTopFormRef()
        let drawerCon = getContainerWidgetByName(topFormRef.widgetList, drawerName)
        if (!drawerCon || (drawerCon.type !== 'vf-drawer')) {
          proxy.$message.error(i18nt('render.hint.refNotFound') + drawerName)
          return
        }
        let dFormJson = {
          widgetList: deepClone(drawerCon.widgetList),
          formConfig: cloneFormConfigWithoutEventHandler(topFormRef.formConfig)
        }

        let wrapperDivId = generateId() + ''
        let drawerInstance = createVNode(DynamicDrawer, {
          options: drawerCon.options,
          formJson: dFormJson,
          formData: formData || {},
          optionData: topFormRef.optionData,
          globalDsv: topFormRef.globalDsv,
          parentFormRef: proxy,
          extraData: extraData,
          wrapperId: wrapperDivId,
        })
        drawerInstance.appContext = proxy.$root.$.appContext  //非常重要， 覆盖应用上下文！！

        let wrapperDiv = document.createElement("div")
        wrapperDiv.id = 'vf-dynamic-drawer-wrapper' + wrapperDivId
        document.body.appendChild(wrapperDiv)
        render(drawerInstance, wrapperDiv)
        document.body.appendChild( drawerInstance.el )
        drawerInstance.component.ctx.show()
      }

      /**
       * 判断表单是否处于设计器预览状态
       * @return {boolean}
       */
      const isPreviewState=()=> {
        return props.previewState
      }

      //--------------------- 以上为组件支持外部调用的API方法 end ------------------//


















        buildFormModel(!data.formJsonObj ? null : data.formJsonObj.widgetList)
        initFormObject()


        return {
          i18nt,
          ...toRefs(props),
          ...toRefs(data),

          renderForm,


          formConfig,
          widgetList,
          labelPosition,
          labelWidth,
          size,
          customClass,

          initFormObject,
          getContainerWidgetName,
          getWidgetName,
          initLocale,
          insertCustomStyleAndScriptNode,
          buildFormModel,
          buildDataFromWidget,
          addFieldChangeEventHandler,
          addFieldValidateEventHandler,
          registerFormToRefList,
          handleFieldDataChange,
          handleOnCreated,
          handleOnMounted,
          findWidgetAndSetDisabled,
          findWidgetOfSubFormAndSetDisabled,
          findWidgetAndSetHidden,
          findWidgetOfSubFormAndSetHidden,
          findWidgetNameInSubForm,
          initDataSetRequest,

          
      //--------------------- 以下为组件支持外部调用的API方法 begin ------------------//
      /* 提示：用户可自行扩充这些方法！！！ */


            changeLanguage,
            getLanguageName,
            getNativeForm,
            getFormRef,
            getWidgetRef,
            clearFormDataModel,
            getFormJson,
            setFormJson,
            reloadOptionData,
            getFormData,
            setFormData,
            getFieldValue,
            setFieldValue,
            getSubFormValues,
            setSubFormValues,
            disableForm,
            enableForm,
            resetForm,
            clearValidate,
            validateForm,
            validateFields,
            disableWidgets,
            enableWidgets,
            hideWidgets,
            showWidgets,
            getFieldWidgets,
            getContainerWidgets,
            addEC,
            hasEC,
            getEC,
            setReadMode,
            getReadMode,
            getGlobalDsv,
            executeDataSource,
            getParentFormRef,
            getTopFormRef,
            setChildFormRef,
            getChildFormRef,
            isDynamicCreation,
            setDialogOrDrawerRef,
            getDialogOrDrawerRef,
            showDialog,
            showDrawer,
            isPreviewState,

      //--------------------- 以上为组件支持外部调用的API方法 end ------------------//





        }

    }
  }
</script>

<style lang="scss" scoped>
  .el-form :deep(.el-row) {
    padding: 8px;
  }
</style>
