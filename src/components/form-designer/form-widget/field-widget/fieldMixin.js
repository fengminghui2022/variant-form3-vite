import {deepClone, getDSByName, overwriteObj, runDataSourceRequest, translateOptionItems} from "@/utils/util"
import FormValidators from '@/utils/validators'
import { inject ,ref,toRefs,computed,getCurrentInstance  } from "vue"

import { useEmitter } from '@/utils/emitter'
import { useI18n,translate } from '@/utils/i18n'



export function useField(props,data){
  
  const { i18nt }=useI18n();
  const emitter =useEmitter();
  const { proxy } = getCurrentInstance()

  const refList=inject('refList')
  const getFormConfig=inject('getFormConfig') 
  const globalOptionData=inject('globalOptionData') 
  const globalModel=inject('globalModel') 
  const getOptionData=inject('getOptionData')
  const getGlobalDsv=inject('getGlobalDsv') 
  const getReadMode=inject('getReadMode') 
  const getSubFormFieldFlag=inject('getSubFormFieldFlag') 
  const getSubFormName=inject('getSubFormName') 
  const getDSResultCache=inject('getDSResultCache')


  data.fieldReadonlyFlag=ref(false)

  const formConfig=computed(()=> {
    return getFormConfig()
  })

  const subFormName=computed(()=> {
    return !!getSubFormName ? getSubFormName() : ''
  })

  const subFormItemFlag=computed(()=> {
    return !!getSubFormFieldFlag ? getSubFormFieldFlag() : false
  })

  const formModel=computed({
    cache: false,
    get() {
      console.log("globalModel",globalModel)
      return globalModel.formModel
    }
  })

  const isReadMode=computed(()=> {
    //return getReadMode() || data.fieldReadonlyFlag
    return !!getReadMode() ? true : data.fieldReadonlyFlag
  })

  const optionLabel=computed(()=> {
    if (data.fieldModel === null) {
      return '--'
    } else {
      let resultContent = '--'
      props.field.options.optionItems.forEach(oItem => {
        if ((oItem.value === data.fieldModel) || (methods.findInArray(data.fieldModel, oItem.value)) !== -1) {
          resultContent = resultContent === '--' ? oItem.label : resultContent + ' ' + oItem.label
        }
      })

      return resultContent
    }
  })



  const methods= {
    findInArray(arrayObject, element) {
      if (!Array.isArray(arrayObject)) {
        return -1
      }

      let foundIdx = -1
      arrayObject.forEach((aItem, aIdx) => {
        if (aItem === element) {
          foundIdx = aIdx
        }
      })

      return foundIdx
    },

    //--------------------- 组件内部方法 begin ------------------//
    getPropName() {
      if (subFormItemFlag.value && !props.designState) {
        return subFormName.value + "." + props.subFormRowIndex + "." + props.field.options.name + ""
      } else {
        return props.field.options.name
      }
    },

    initFieldModel() {
      if (!props.field.formItemFlag) {
        return
      }


      if (!!subFormItemFlag.value && !props.designState) {  //SubForm子表单组件需要特殊处理！！
        let subFormData = formModel.value[subFormName.value]
        if (((subFormData === undefined) || (subFormData[props.subFormRowIndex] === undefined) ||
            (subFormData[props.subFormRowIndex][props.field.options.name] === undefined)) &&
            (props.field.options.defaultValue !== undefined)) {
          data.fieldModel = props.field.options.defaultValue
          subFormData[props.subFormRowIndex][props.field.options.name] = props.field.options.defaultValue
        } else if (subFormData[props.subFormRowIndex][props.field.options.name] === undefined) {
          data.fieldModel = null
          subFormData[props.subFormRowIndex][props.field.options.name] = null
        } else {
          data.fieldModel = subFormData[props.subFormRowIndex][props.field.options.name]
        }

        /* 主动触发子表单内field-widget的onChange事件！！ */
        setTimeout(() => {  //延时触发onChange事件, 便于更新计算字段！！
          methods.handleOnChangeForSubForm(data.fieldModel, props.oldFieldValue, subFormData, props.subFormRowId)
        }, 800)
        props.oldFieldValue = deepClone(data.fieldModel)

        methods.initFileList()  //处理图片上传、文件上传字段

        return
      }
      
      if ((formModel.value&&formModel.value[props.field.options.name] === undefined) &&
          (props.field.options.defaultValue !== undefined)) {
        data.fieldModel = props.field.options.defaultValue
      } else if (!!formModel.value&&formModel.value[props.field.options.name] === undefined) {  //如果formModel为空对象，则初始化字段值为null!!      
        formModel.value[props.field.options.name] = null
      } else {
        data.fieldModel = formModel.value[props.field.options.name]
      }
      props.oldFieldValue = deepClone(data.fieldModel)
      methods.initFileList()  //处理图片上传、文件上传字段
    },

    initFileList() { //初始化上传组件的已上传文件列表
      if ( ((props.field.type !== 'picture-upload') && (props.field.type !== 'file-upload')) || (props.designState === true) ) {
        return
      }

      if (!!data.fieldModel) {
        if (Array.isArray(data.fieldModel)) {
          data.fileList = deepClone(data.fieldModel)
          data.uploadBtnHidden = data.fileList.length >= props.field.options.limit
        } else {
          data.fileList.splice(0, 0, deepClone(data.fieldModel))
          data.uploadBtnHidden = props.field.options.limit <= 1
        }
      }
    },

    initEventHandler() {
      emitter.on$('setFormData', (newFormData) => {
        //console.log('formModel of globalModel----------', globalModel.formModel)
        if (!subFormItemFlag.value) {
          methods.setValue(newFormData[props.field.options.name])
        }
      })

      emitter.on$('field-value-changed', (values) => {
        if (!!subFormItemFlag.value) {
          let subFormData = formModel.value[subFormName.value]
          methods.handleOnChangeForSubForm(values[0], values[1], subFormData, props.subFormRowId)
        } else {
          methods.handleOnChange(values[0], values[1])
        }
      })

      /* 监听从数据集加载选项事件 */
      emitter.on$('loadOptionItemsFromDataSet', (dsName) => {
        methods.loadOptionItemsFromDataSet(dsName)
      })

      emitter.on$('reloadOptionItems', (widgetNames) => {
        if ((widgetNames.length === 0) || (widgetNames.indexOf(props.field.options.name) > -1)) {
          methods.initOptionItems(true)
        }
      })

    },

    handleOnCreated() {
      if (!!props.designState) { //设计状态不触发事件
        return
      }

      if (!!props.field.options.onCreated) {
        let customFunc = new Function(props.field.options.onCreated)
        customFunc.call(proxy)
      }
    },

    handleOnMounted() {
      if (!!props.designState) { //设计状态不触发事件
        return
      }

      if (!!props.field.options.onMounted) {
        let mountFunc = new Function(props.field.options.onMounted)
        mountFunc.call(proxy)
      }
    },

    registerToRefList(oldRefName) {
      if ((refList !== null) && !!props.field.options.name) {
        if (subFormItemFlag.value && !props.designState) { //处理子表单元素（且非设计状态）
          if (!!oldRefName) {
            delete refList[oldRefName + '@row' + props.subFormRowId]
          }
          refList[props.field.options.name + '@row' + props.subFormRowId] = proxy
        } else {
          if (!!oldRefName) {
            delete refList[oldRefName]
          }
          refList[props.field.options.name] = proxy
        }
      }
    },

    unregisterFromRefList() {  //销毁组件时注销组件ref
      if ((refList !== null) && !!props.field.options.name) {
        let oldRefName = props.field.options.name
        if (subFormItemFlag.value && !props.designState) { //处理子表单元素（且非设计状态）
          delete refList[oldRefName + '@row' + props.subFormRowId]
        } else {
          delete refList[oldRefName]
        }
      }
    },

    async initOptionItems(keepSelected) {
      if (props.designState) {
        return
      }

      if ((props.field.type === 'radio') || (props.field.type === 'checkbox')
          || (props.field.type === 'select') || (props.field.type === 'cascader')) {
        /* 首先处理数据源选项加载 */
        if (!!props.field.options.dsEnabled) {
          props.field.options.optionItems.splice(0, props.field.options.optionItems.length) // 清空原有选项
          let curDSName = props.field.options.dsName
          let curDSetName = props.field.options.dataSetName
          let curDS = getDSByName(formConfig.value, curDSName)
          if (!!curDS && !curDSetName) {
            let gDsv = getGlobalDsv() || {}
            //console.log('Global DSV is: ', gDsv)
            let localDsv = new Object({})
            overwriteObj(localDsv, gDsv)
            localDsv['widgetName'] = props.field.options.name
            let dsResult = null
            try {
              dsResult = await runDataSourceRequest(curDS, localDsv, methods.getFormRef(), false, proxy.$message)
              methods.loadOptions(dsResult)
            } catch(err) {
              proxy.$message.error(err.message)
            }
          }

          return;
        }

        /* 异步更新option-data之后globalOptionData不能获取到最新值，改用provide的getOptionData()方法 */
        const newOptionItems = getOptionData()
        if (!!newOptionItems && newOptionItems.hasOwnProperty(props.field.options.name)) {
          if (!!keepSelected) {
            methods.reloadOptions(newOptionItems[props.field.options.name])
          } else {
            methods.loadOptions(newOptionItems[props.field.options.name])
          }
        }
      }
    },

    loadOptionItemsFromDataSet(dsName) {
      if (props.designState) {
        return
      }

      if ((props.field.type !== 'radio') && (props.field.type !== 'checkbox')
          && (props.field.type !== 'select') && (props.field.type !== 'cascader')) {
        return
      }

      if (!props.field.options.dsEnabled || !props.field.options.dsName || !props.field.options.dataSetName
          || (props.field.options.dsName !== dsName)) {
        return
      }

      const dataCache = getDSResultCache()
      const dSetName = props.field.options.dataSetName
      if (!!dataCache && !!dataCache[dsName] && !!dataCache[dsName][dSetName]) {
        props.field.options.optionItems.splice(0, props.field.options.optionItems.length) // 清空原有选项
        methods.loadOptions( dataCache[dsName][dSetName] )
      }
    },

    refreshDefaultValue() {
      if ((props.designState === true) && (props.field.options.defaultValue !== undefined)) {
        data.fieldModel = props.field.options.defaultValue
      }
    },

    clearFieldRules() {
      if (!props.field.formItemFlag) {
        return
      }

      data.rules.splice(0, data.rules.length)  //清空已有
    },

    buildFieldRules() {
      if (!props.field.formItemFlag) {
        return
      }

      data.rules.splice(0, data.rules.length)  //清空已有
      if (!!props.field.options.required) {
        data.rules.push({
          required: true,
          //trigger: ['blur', 'change'],
          trigger: ['blur'],  /* 去掉change事件触发校验，change事件触发时formModel数据尚未更新，导致radio/checkbox必填校验出错！！ */
          message: props.field.options.requiredHint || i18nt('render.hint.fieldRequired'),
        })
      }

      if (!!props.field.options.validation) {
        let vldName = props.field.options.validation
        if (!!FormValidators[vldName]) {
          data.rules.push({
            validator: FormValidators[vldName],
            trigger: ['blur', 'change'],
            label: props.field.options.label,
            errorMsg: props.field.options.validationHint
          })
        } else {
          data.rules.push({
            validator: FormValidators['regExp'],
            trigger: ['blur', 'change'],
            regExp: vldName,
            label: props.field.options.label,
            errorMsg: props.field.options.validationHint
          })
        }
      }

      if (!!props.field.options.onValidate) {
        //let customFn = new Function('rule', 'value', 'callback', props.field.options.onValidate)
        let customFn = (rule, value, callback) => {
          let tmpFunc =  new Function('rule', 'value', 'callback', props.field.options.onValidate)
          return tmpFunc.call(proxy, rule, value, callback)
        }
        data.rules.push({
          validator: customFn,
          trigger: ['blur', 'change'],
          label: props.field.options.label
        })
      }
    },

    /**
     * 禁用字段值变动触发表单校验
     */
    disableChangeValidate() {
      if (!data.rules) {
        return
      }

      data.rules.forEach(rule => {
        if (!!rule.trigger) {
          rule.trigger.splice(0, rule.trigger.length)
        }
      })
    },

    /**
     * 启用字段值变动触发表单校验
     */
    enableChangeValidate() {
      if (!data.rules) {
        return
      }

      data.rules.forEach(rule => {
        if (!!rule.trigger) {
          rule.trigger.push('blur')
          rule.trigger.push('change')
        }
      })
    },

    disableOptionOfList(optionList, optionValue) {
      if (!!optionList && (optionList.length > 0)) {
        optionList.forEach(opt => {
          if (opt.value === optionValue) {
            opt.disabled = true
          }
        })
      }
    },

    enableOptionOfList(optionList, optionValue) {
      if (!!optionList && (optionList.length > 0)) {
        optionList.forEach(opt => {
          if (opt.value === optionValue) {
            opt.disabled = false
          }
        })
      }
    },

    //--------------------- 组件内部方法 end ------------------//

    //--------------------- 事件处理 begin ------------------//

    emitFieldDataChange(newValue, oldValue) {
      emitter.emit$('field-value-changed', [newValue, oldValue])

      /* 必须用dispatch向指定父组件派发消息！！ */
      emitter.dispatch('VFormRender', 'fieldChange',
          [props.field.options.name, newValue, oldValue, subFormName.value, props.subFormRowIndex])
    },

    syncUpdateFormModel(value) {
      if (!!props.designState) {
        return
      }
      if (!!subFormItemFlag.value) {
        let subFormData = formModel.value[subFormName.value] || [{}]
        let subFormDataRow = subFormData[props.subFormRowIndex]
        if (!!subFormDataRow) { // 重置表单后subFormDataRow为undefined，应跳过！！
          subFormDataRow[props.field.options.name] = value
        }
      } else {
        formModel.value[props.field.options.name] = value
      }
    },

    handleChangeEvent(value) {
      if (!!props.designState) { //设计状态不触发事件
        return
      }

      methods.syncUpdateFormModel(value)
      methods.emitFieldDataChange(value, props.oldFieldValue)

      //number组件一般不会触发focus事件，故此处需要手工赋值oldFieldValue！！
      props.oldFieldValue = deepClone(value)  /* oldFieldValue需要在initFieldModel()方法中赋初值!! */

      /* 主动触发表单的单个字段校验，用于清除字段可能存在的校验错误提示 */
      emitter.dispatch('VFormRender', 'fieldValidation', [methods.getPropName()])
    },

    handleFocusCustomEvent(event) {
      if (!!props.designState) { //设计状态不触发事件
        return
      }

      props.oldFieldValue = deepClone(data.fieldModel)  //保存修改change之前的值

      if (!!props.field.options.onFocus) {
        let customFn = new Function('event', props.field.options.onFocus)
        customFn.call(proxy, event)
      }
    },

    handleBlurCustomEvent(event) {
      if (!!props.designState) { //设计状态不触发事件
        return
      }

      if (!!props.field.options.onBlur) {
        let customFn = new Function('event', props.field.options.onBlur)
        customFn.call(proxy, event)
      }
    },

    handleInputCustomEvent(value) {
      if (!!props.designState) { //设计状态不触发事件
        return
      }

      methods.syncUpdateFormModel(value)

      /* 主动触发表单的单个字段校验，用于清除字段可能存在的校验错误提示 */
      emitter.dispatch('VFormRender', 'fieldValidation', [methods.getPropName()])

      if (!!props.field.options.onInput) {
        let customFn = new Function('value', props.field.options.onInput)
        customFn.call(proxy, value)
      }
    },

    emitAppendButtonClick() {
      if (!!props.designState) { //设计状态不触发点击事件
        return
      }

      if (!!props.field.options.onAppendButtonClick) {
        let customFn = new Function(props.field.options.onAppendButtonClick)
        customFn.call(proxy)
      } else {
        /* 必须调用mixins中的dispatch方法逐级向父组件发送消息！！ */
        emitter.dispatch('VFormRender', 'appendButtonClick', [proxy])
      }
    },

    handleOnChange(val, oldVal) {  //自定义onChange事件
      if (!!props.designState) { //设计状态不触发事件
        return
      }

      if (!!props.field.options.onChange) {
        let changeFn = new Function('value', 'oldValue', props.field.options.onChange)
        changeFn.call(proxy, val, oldVal)
      }
    },

    handleOnChangeForSubForm(val, oldVal, subFormData, rowId) {  //子表单自定义onChange事件
      if (!!props.designState) { //设计状态不触发事件
        return
      }

      if (!!props.field.options.onChange) {
        let changeFn = new Function('value', 'oldValue', 'subFormData', 'rowId', props.field.options.onChange)
        changeFn.call(proxy, val, oldVal, subFormData, rowId)
      }
    },

    handleButtonWidgetClick() {
      if (!!props.designState) { //设计状态不触发点击事件
        return
      }

      if (!!props.field.options.onClick) {
        let customFn = new Function(props.field.options.onClick)
        customFn.call(proxy)
      } else {
        emitter.dispatch('VFormRender', 'buttonClick', [proxy]);
      }
    },

    remoteQuery(keyword) {
      if (!!props.designState) { //设计状态不触发事件
        return
      }

      if (!!props.field.options.onRemoteQuery) {
        let remoteFn = new Function('keyword', props.field.options.onRemoteQuery)
        remoteFn.call(proxy, keyword)
      }
    },

    //--------------------- 事件处理 end ------------------//

    //--------------------- 以下为组件支持外部调用的API方法 begin ------------------//
    /* 提示：用户可自行扩充这些方法！！！ */

    getFormRef() { /* 获取VFrom引用，必须在VForm组件created之后方可调用 */
      return refList['v_form_ref']
    },

    getWidgetRef(widgetName, showError) {
      let foundRef = refList[widgetName]
      if (!foundRef && !!showError) {
        proxy.$message.error(i18nt('render.hint.refNotFound') + widgetName)
      }
      return foundRef
    },

    getFieldEditor() { //获取内置的el表单组件
      return this.$refs['fieldEditor']
    },

    /*
      注意：VFormRender的setFormData方法不会触发子表单内field-widget的setValue方法，
      因为setFormData方法调用后，子表单内所有field-widget组件已被清空，接收不到setFormData事件！！
    * */
    setValue(newValue) {
      /* if ((props.field.type === 'picture-upload') || (props.field.type === 'file-upload')) {
        data.fileList = newValue
      } else */ if (!!props.field.formItemFlag) {
        let oldValue = deepClone(data.fieldModel)
        data.fieldModel = newValue
        methods.initFileList()

        methods.syncUpdateFormModel(newValue)
        methods.emitFieldDataChange(newValue, oldValue)
      }
    },

    getValue() {
      /* if ((props.field.type === 'picture-upload') || (props.field.type === 'file-upload')) {
        return data.fileList
      } else */ {
        return data.fieldModel
      }
    },

    resetField() {
      let defaultValue = props.field.options.defaultValue
      methods.setValue(defaultValue)
      nextTick(() => {
        //
      })

      //清空上传组件文件列表
      if ((props.field.type === 'picture-upload') || (props.field.type === 'file-upload')) {
        this.$refs['fieldEditor'].clearFiles()
        data.fileList.splice(0, data.fileList.length)
      }
    },

    setWidgetOption(optionName, optionValue) { //通用组件选项修改API
      if (props.field.options.hasOwnProperty(optionName)) {
        props.field.options[optionName] = optionValue
        //TODO: 是否重新构建组件？？有些属性修改后必须重新构建组件才能生效，比如字段校验规则。
      }
    },

    setReadonly(flag) {
      props.field.options.readonly = flag
    },

    setDisabled(flag) {
      props.field.options.disabled = flag
    },

    setAppendButtonVisible(flag) {
      props.field.options.appendButton = flag
    },

    setAppendButtonDisabled(flag) {
      props.field.options.appendButtonDisabled = flag
    },

    setHidden(flag) {
      props.field.options.hidden = flag

      if (!!flag) {  //清除组件校验规则
        methods.clearFieldRules()
      } else {  //重建组件校验规则
        methods.buildFieldRules()
      }
    },

    setRequired(flag) {
      props.field.options.required = flag
      methods.buildFieldRules()

      if (!props.designState && !flag) {  //清除必填校验提示
        methods.clearValidate()
      }
    },

    /**
     * 清除字段校验提示
     */
    clearValidate() {
      if (!!props.designState) {
        return
      }

      methods.getFormRef().getNativeForm().clearValidate(methods.getPropName())
    },

    setLabel(newLabel) {
      props.field.options.label = newLabel
    },

    focus() {
      if (!!methods.getFieldEditor() && !!methods.getFieldEditor().focus) {
        methods.getFieldEditor().focus()
      }
    },

    clearSelectedOptions() {  //清空已选选项
      if ((props.field.type !== 'checkbox') && (props.field.type !== 'radio') && (props.field.type !== 'select')) {
        return
      }

      if ((props.field.type === 'checkbox') ||
          ((props.field.type === 'select') && props.field.options.multiple)) {
        data.fieldModel = []
      } else {
        data.fieldModel = ''
      }
    },

    /**
     * 加载选项，并清空字段值
     * @param options
     */
    loadOptions(options) {
      /*
      props.field.options.optionItems = deepClone(options)
      //methods.clearSelectedOptions()  //清空已选选项
      */

      props.field.options.optionItems = translateOptionItems(options, props.field.type,
          props.field.options.labelKey || 'label',
          props.field.options.valueKey || 'value')
    },

    /**
     * 重新加载选项，不清空字段值
     * @param options
     */
    reloadOptions(options) {
      //props.field.options.optionItems = deepClone(options)

      props.field.options.optionItems = translateOptionItems(options, props.field.type,
          props.field.options.labelKey || 'label',
          props.field.options.valueKey || 'value')
    },

    disableOption(optionValue) {
      methods.disableOptionOfList(props.field.options.optionItems, optionValue)
    },

    enableOption(optionValue) {
      methods.enableOptionOfList(props.field.options.optionItems, optionValue)
    },

    /**
     * 返回选择项
     * @returns {*}
     */
    getOptionItems() {
      return props.field.options.optionItems
    },

    setUploadHeader(name, value) {
      data.uploadHeaders[name] = value
    },

    setUploadData(name, value) {
      data.uploadData[name] = value
    },

    setToolbar(customToolbar) {
      data.customToolbar = customToolbar
    },

    /**
     * 是否子表单内嵌的字段组件
     * @returns {boolean}
     */
    isSubFormItem() {
      return subFormItemFlag.value
    },

    /**
     * 是否子表单内嵌的字段组件
     * @returns {boolean}
     */
    isSubFormField() {
      return subFormItemFlag.value
    },

    /**
     * 设置或取消设置字段只读查看模式
     * @param readonlyFlag
     */
    setReadMode(readonlyFlag = true) {
      data.fieldReadonlyFlag = readonlyFlag
    },

    /**
     * 动态增加自定义css样式
     * @param className
     */
    addCssClass(className) {
      if (!props.field.options.customClass) {
        props.field.options.customClass = [className]
      } else {
        props.field.options.customClass.push(className)
      }
    },

    /**
     * 动态移除自定义css样式
     * @param className
     */
    removeCssClass(className) {
      if (!props.field.options.customClass) {
        return
      }

      let foundIdx = -1
      props.field.options.customClass.map((cc, idx) => {
        if (cc === className) {
          foundIdx = idx
        }
      })
      if (foundIdx > -1) {
        props.field.options.customClass.splice(foundIdx, 1)
      }
    }

  }

  //--------------------- 以上为组件支持外部调用的API方法 end ------------------//

  return {
    refList,
    getFormConfig,
    globalOptionData,
    globalModel,
    getOptionData,
    getGlobalDsv,
    getReadMode,
    getSubFormFieldFlag,
    getSubFormName,
    getDSResultCache,

    ...toRefs(data),


    // computed 计算函数
    formConfig,
    subFormName,
    subFormItemFlag,
    formModel,
    isReadMode,
    optionLabel,

    ...methods

  }

}