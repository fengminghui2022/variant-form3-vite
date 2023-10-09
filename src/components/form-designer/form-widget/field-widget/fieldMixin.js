import {deepClone, getDSByName, overwriteObj, runDataSourceRequest, translateOptionItems} from "@/utils/util"
import FormValidators from '@/utils/validators'

export default {
  inject: ['refList', 'getFormConfig', 'globalOptionData', 'globalModel', 'getOptionData',
    'getGlobalDsv', 'getReadMode', 'getSubFormFieldFlag', 'getSubFormName', 'getDSResultCache',
    'getObjectFieldFlag', 'getObjectName'],
  data() {
    return {
      fieldReadonlyFlag: false,
      dataSetLoadedFlag: false,
    }
  },
  computed: {
    formConfig() {
      return this.getFormConfig()
    },

    subFormName() {
      return !!this.getSubFormName ? this.getSubFormName() : ''
    },

    subFormItemFlag() {
      return !!this.getSubFormFieldFlag ? this.getSubFormFieldFlag() : false
    },

    formModel: {
      cache: false,
      get() {
        return this.globalModel.formModel
      }
    },

    isReadMode() {
      //return this.getReadMode() || this.fieldReadonlyFlag
      return !!this.getReadMode() ? true : this.fieldReadonlyFlag
    },

    optionLabel() {
      if (this.fieldModel === null) {
        return '--'
      } else {
        let resultContent = '--'
        this.field.options.optionItems.forEach(oItem => {
          if ((oItem.value === this.fieldModel) || (this.findInArray(this.fieldModel, oItem.value)) !== -1) {
            resultContent = resultContent === '--' ? oItem.label : resultContent + ' ' + oItem.label
          }
        })

        return resultContent
      }
    },

    fieldKeyName() {
      let fieldKeyName = this.field.options.name
      return this.field.options.keyNameEnabled ? (this.field.options.keyName || fieldKeyName) : fieldKeyName
    }

  },

  methods: {
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
      if (this.subFormItemFlag && !this.designState) {
        return this.subFormName + "." + this.subFormRowIndex + "." + this.fieldKeyName
      } else if (this.getObjectFieldFlag() && !this.designState) {
        return this.getObjectName() + '.' + this.fieldKeyName
      } else {
        return this.fieldKeyName
      }
    },

    getObjectModel() {
      let objectChains = this.getObjectName().split('.')
      let objectModel = this.formModel
      objectChains.forEach(key => {
        if (!key) return

        if (objectModel[key] === undefined) {
          objectModel[key] = {}
        }
        objectModel = objectModel[key]
      })

      return objectModel
    },

    initFieldModel() {
      if (!this.field.formItemFlag) {
        return
      }

      if (!!this.getObjectFieldFlag() && !this.designState) { //处理对象容器内部组件
        const objectModel = this.getObjectModel()
        this.fieldModel = objectModel === undefined ? null : objectModel[this.fieldKeyName]
        this.oldFieldValue = deepClone(this.fieldModel)
        this.initFileList()  //处理图片上传、文件上传字段

        return
      }

      if (!!this.subFormItemFlag && !this.designState) {  //SubForm子表单组件需要特殊处理！！
        let subFormData = this.formModel[this.subFormName]
        if (((subFormData === undefined) || (subFormData[this.subFormRowIndex] === undefined) ||
            (subFormData[this.subFormRowIndex][this.fieldKeyName] === undefined)) &&
            (this.field.options.defaultValue !== undefined)) {
          this.fieldModel = this.field.options.defaultValue
          subFormData[this.subFormRowIndex][this.fieldKeyName] = this.field.options.defaultValue
        } else if (subFormData[this.subFormRowIndex][this.fieldKeyName] === undefined) {
          this.fieldModel = null
          subFormData[this.subFormRowIndex][this.fieldKeyName] = null
        } else {
          this.fieldModel = subFormData[this.subFormRowIndex][this.fieldKeyName]
        }

        /* 主动触发子表单内field-widget的onChange事件！！ */
        setTimeout(() => {  //延时触发onChange事件, 便于更新计算字段！！
          this.handleOnChangeForSubForm(this.fieldModel, this.oldFieldValue, subFormData, this.subFormRowId)
        }, 800)
        this.oldFieldValue = deepClone(this.fieldModel)

        this.initFileList()  //处理图片上传、文件上传字段

        return
      }

      if ((this.formModel[this.fieldKeyName] === undefined) &&
          (this.field.options.defaultValue !== undefined)) {
        this.fieldModel = this.field.options.defaultValue
      } else if (this.formModel[this.fieldKeyName] === undefined) {  //如果formModel为空对象，则初始化字段值为null!!
        this.formModel[this.fieldKeyName] = null
      } else {
        this.fieldModel = this.formModel[this.fieldKeyName]
      }
      this.oldFieldValue = deepClone(this.fieldModel)
      this.initFileList()  //处理图片上传、文件上传字段
    },

    initFileList() { //初始化上传组件的已上传文件列表
      if ( ((this.field.type !== 'picture-upload') && (this.field.type !== 'file-upload')) || (this.designState === true) ) {
        return
      }

      if (!!this.fieldModel) {
        if (Array.isArray(this.fieldModel)) {
          this.fileList = deepClone(this.fieldModel)
        } else {
          this.fileList.splice(0, 0, deepClone(this.fieldModel))
        }
      }
    },

    initEventHandler() {
      this.on$('setFormData', (newFormData) => {
        //console.log('formModel of globalModel----------', this.globalModel.formModel)
        if (!this.subFormItemFlag) {
          if (!!this.getObjectFieldFlag() && !this.designState) { //处理对象容器内部组件
            const objectModel = this.getObjectModel()
            this.setValue(objectModel === undefined ? null : objectModel[this.fieldKeyName])
          } else {
            this.setValue(newFormData[this.fieldKeyName])
          }
        }
      })

      this.on$('field-value-changed', (values) => {
        if (!!this.subFormItemFlag) {
          let subFormData = this.formModel[this.subFormName]
          this.handleOnChangeForSubForm(values[0], values[1], subFormData, this.subFormRowId)
        } else {
          this.handleOnChange(values[0], values[1])
        }
      })

      this.on$('sync-field-value', (params) => {
        const pName = params[0], pKeyName = params[1]
        //if ((this.field.options.name === pName) || !this.field.options.keyName) {
        if (this.field.options.name === pName) {
          return
        }

        if (!pKeyName && (this.field.options.keyName !== pName)) {
          return
        }

        if (!this.field.options.keyName && (this.field.options.name !== pKeyName)) {
          return
        }

        if (!!this.field.options.keyName && !!pKeyName && (this.field.options.keyName !== pKeyName)) {
          return
        }

        const pSubFormName = params[2], pSubFormRowId = params[3], newValue = params[4]
        if (!this.subFormName && !pSubFormName) {
          this.setValue(newValue, true)
        } else if ((this.subFormName === pSubFormName) && (this.subFormRowId === pSubFormRowId)) {
          this.setValue(newValue, true)
        }
      })

      /* 监听从数据集加载选项事件 */
      this.on$('loadOptionItemsFromDataSet', (dsName) => {
        this.loadOptionItemsFromDataSet(dsName)
        this.dataSetLoadedFlag = true
      })

      this.on$('reloadOptionItems', (widgetNames) => {
        if ((widgetNames.length === 0) || (widgetNames.indexOf(this.field.options.name) > -1)) {
          this.initOptionItems(true)
        }
      })

    },

    handleOnCreated() {
      if (!!this.designState) { //设计状态不触发事件
        return
      }

      if (!!this.field.options.onCreated) {
        let customFunc = new Function(this.field.options.onCreated)
        customFunc.call(this)
      }
    },

    handleOnMounted() {
      if (!!this.designState) { //设计状态不触发事件
        return
      }

      if (!!this.field.options.onMounted) {
        let mountFunc = new Function(this.field.options.onMounted)
        mountFunc.call(this)
      }
    },

    registerToRefList(oldRefName) {
      if ((this.refList !== null) && !!this.field.options.name) {
        if (this.subFormItemFlag && !this.designState) { //处理子表单元素（且非设计状态）
          if (!!oldRefName) {
            delete this.refList[oldRefName + '@row' + this.subFormRowId]
          }
          this.refList[this.field.options.name + '@row' + this.subFormRowId] = this
        } else {
          if (!!oldRefName) {
            delete this.refList[oldRefName]
          }
          this.refList[this.field.options.name] = this
        }
      }
    },

    unregisterFromRefList() {  //销毁组件时注销组件ref
      if ((this.refList !== null) && !!this.field.options.name) {
        let oldRefName = this.field.options.name
        if (this.subFormItemFlag && !this.designState) { //处理子表单元素（且非设计状态）
          delete this.refList[oldRefName + '@row' + this.subFormRowId]
        } else {
          delete this.refList[oldRefName]
        }
      }
    },

    async initOptionItems(keepSelected) {
      if (this.designState) {
        return
      }

      if ((this.field.type === 'radio') || (this.field.type === 'checkbox')
          || (this.field.type === 'select') || (this.field.type === 'cascader')) {
        /* 首先处理数据源选项加载 */
        if (!!this.field.options.dsEnabled) {
          this.field.options.optionItems.splice(0, this.field.options.optionItems.length) // 清空原有选项
          let curDSName = this.field.options.dsName
          let curDSetName = this.field.options.dataSetName
          let curDS = getDSByName(this.formConfig, curDSName)
          if (!!curDS && !curDSetName) {
            let gDsv = this.getGlobalDsv() || {}
            //console.log('Global DSV is: ', gDsv)
            let localDsv = new Object({})
            overwriteObj(localDsv, gDsv)
            localDsv['widgetName'] = this.field.options.name
            localDsv['widgetKeyName'] = this.fieldKeyName
            let dsResult = null
            try {
              dsResult = await runDataSourceRequest(curDS, localDsv, this.getFormRef(), false, this.$message)
              this.loadOptions(dsResult)
            } catch(err) {
              this.$message.error(err.message)
            }
          } else if (!!curDS && !!curDSetName && !this.dataSetLoadedFlag) {
            this.loadOptionItemsFromDataSet(curDSName)
          }

          return
        }

        /* 异步更新option-data之后globalOptionData不能获取到最新值，改用provide的getOptionData()方法 */
        const newOptionItems = this.getOptionData()
        if (!!newOptionItems && newOptionItems.hasOwnProperty(this.fieldKeyName)) {
          if (!!keepSelected) {
            this.reloadOptions(newOptionItems[this.fieldKeyName])
          } else {
            this.loadOptions(newOptionItems[this.fieldKeyName])
          }

          return
        }

        //对静态选项的值类型进行转换处理
        if (this.field.type !== 'cascader') {
          this.translateOptionItemsValue()
        }
      }
    },

    translateOptionItemsValue() {
      let valueType = this.field.options.optionValueType
      this.field.options.optionItems.forEach((opt, idx) => {
        let optValue = opt.value + ''
        if (valueType === 'String') {
          opt.value = optValue
        } else if (valueType === 'Number') {
          opt.value = Number(optValue)
        } else if (valueType === 'Boolean') {
          if ((optValue.toLowerCase() === 'false') || (optValue === '0')) {
            opt.value = false
          } else if ((optValue.toLowerCase() === 'true') || (optValue === '1')) {
            opt.value = true
          } else {
            opt.value = null
          }
        }
      })
    },

    loadOptionItemsFromDataSet(dsName) {
      if (this.designState) {
        return
      }

      if ((this.field.type !== 'radio') && (this.field.type !== 'checkbox')
          && (this.field.type !== 'select') && (this.field.type !== 'cascader')) {
        return
      }

      if (!this.field.options.dsEnabled || !this.field.options.dsName || !this.field.options.dataSetName
          || (this.field.options.dsName !== dsName)) {
        return
      }

      const dataCache = this.getDSResultCache()
      const dSetName = this.field.options.dataSetName
      if (!!dataCache && !!dataCache[dsName] && !!dataCache[dsName][dSetName]) {
        this.field.options.optionItems.splice(0, this.field.options.optionItems.length) // 清空原有选项
        this.loadOptions( dataCache[dsName][dSetName] )
      }
    },

    refreshDefaultValue() {
      if ((this.designState === true) && (this.field.options.defaultValue !== undefined)) {
        this.fieldModel = this.field.options.defaultValue
      }
    },

    clearFieldRules() {
      if (!this.field.formItemFlag) {
        return
      }

      this.rules.splice(0, this.rules.length)  //清空已有
    },

    buildFieldRules() {
      if (!this.field.formItemFlag || this.field.options.hidden) {
        return
      }

      this.rules.splice(0, this.rules.length)  //清空已有
      if (!!this.field.options.required) {
        this.rules.push({
          required: true,
          //trigger: ['blur', 'change'],
          trigger: ['blur'],  /* 去掉change事件触发校验，change事件触发时formModel数据尚未更新，导致radio/checkbox必填校验出错！！ */
          message: this.field.options.requiredHint || this.i18nt('render.hint.fieldRequired'),
        })
      }

      if (!!this.field.options.validation) {
        let vldName = this.field.options.validation
        if (!!FormValidators[vldName]) {
          this.rules.push({
            validator: FormValidators[vldName],
            trigger: ['blur', 'change'],
            label: this.field.options.label,
            errorMsg: this.field.options.validationHint
          })
        } else {
          this.rules.push({
            validator: FormValidators['regExp'],
            trigger: ['blur', 'change'],
            regExp: vldName,
            label: this.field.options.label,
            errorMsg: this.field.options.validationHint
          })
        }
      }

      if (!!this.field.options.onValidate) {
        //let customFn = new Function('rule', 'value', 'callback', this.field.options.onValidate)
        let customFn = (rule, value, callback) => {
          let tmpFunc =  new Function('rule', 'value', 'callback', this.field.options.onValidate)
          return tmpFunc.call(this, rule, value, callback)
        }
        this.rules.push({
          validator: customFn,
          trigger: ['blur', 'change'],
          label: this.field.options.label
        })
      }
    },

    /**
     * 禁用字段值变动触发表单校验
     */
    disableChangeValidate() {
      if (!this.rules) {
        return
      }

      this.rules.forEach(rule => {
        if (!!rule.trigger) {
          rule.trigger.splice(0, rule.trigger.length)
        }
      })
    },

    /**
     * 启用字段值变动触发表单校验
     */
    enableChangeValidate() {
      if (!this.rules) {
        return
      }

      this.rules.forEach(rule => {
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
      this.emit$('field-value-changed', [newValue, oldValue])

      /* 同步更新keyName属性一致的字段组件值！！ */
      this.broadcast('FieldWidget', 'sync-field-value',
          [this.field.options.name, this.field.options.keyName, this.subFormName, this.subFormRowId, newValue])

      /* 必须用dispatch向指定父组件派发消息！！ */
      this.dispatch('VFormRender', 'fieldChange',
          [this.field.options.name, newValue, oldValue, this.subFormName, this.subFormRowIndex])
    },

    syncUpdateFormModel(value) {
      if (!!this.designState) {
        return
      }

      if (!!this.subFormItemFlag) { // 如果是子表单内部字段
        let subFormData = this.formModel[this.subFormName] || [{}]
        let subFormDataRow = subFormData[this.subFormRowIndex]
        if (!!subFormDataRow) { // 重置表单后subFormDataRow为undefined，应跳过！！
          subFormDataRow[this.fieldKeyName] = value
        }
      } else if (!!this.getObjectFieldFlag()) { // 如果是对象容器内部字段
        const objectModel = this.getObjectModel()
        objectModel[this.fieldKeyName] = value
      } else {
        this.formModel[this.fieldKeyName] = value
      }
    },

    handleChangeEvent(value) {
      if (!!this.designState) { //设计状态不触发事件
        return
      }

      this.syncUpdateFormModel(value)
      this.emitFieldDataChange(value, this.oldFieldValue)

      //number组件一般不会触发focus事件，故此处需要手工赋值oldFieldValue！！
      this.oldFieldValue = deepClone(value)  /* oldFieldValue需要在initFieldModel()方法中赋初值!! */

      /* 主动触发表单的单个字段校验，用于清除字段可能存在的校验错误提示 */
      this.dispatch('VFormRender', 'fieldValidation', [this.getPropName()])
    },

    handleFocusCustomEvent(event) {
      if (!!this.designState) { //设计状态不触发事件
        return
      }

      this.oldFieldValue = deepClone(this.fieldModel)  //保存修改change之前的值

      if (!!this.field.options.onFocus) {
        let customFn = new Function('event', this.field.options.onFocus)
        customFn.call(this, event)
      }
    },

    handleBlurCustomEvent(event) {
      if (!!this.designState) { //设计状态不触发事件
        return
      }

      if (!!this.field.options.onBlur) {
        let customFn = new Function('event', this.field.options.onBlur)
        customFn.call(this, event)
      }
    },

    handleInputCustomEvent(value) {
      if (!!this.designState) { //设计状态不触发事件
        return
      }

      this.syncUpdateFormModel(value)

      /* 主动触发表单的单个字段校验，用于清除字段可能存在的校验错误提示 */
      this.dispatch('VFormRender', 'fieldValidation', [this.getPropName()])

      if (!!this.field.options.onInput) {
        let customFn = new Function('value', this.field.options.onInput)
        customFn.call(this, value)
      }
    },

    emitAppendButtonClick() {
      if (!!this.designState) { //设计状态不触发点击事件
        return
      }

      if (!!this.field.options.onAppendButtonClick) {
        let customFn = new Function(this.field.options.onAppendButtonClick)
        customFn.call(this)
      } else {
        /* 必须调用mixins中的dispatch方法逐级向父组件发送消息！！ */
        this.dispatch('VFormRender', 'appendButtonClick', [this])
      }
    },

    handleOnChange(val, oldVal) {  //自定义onChange事件
      if (!!this.designState) { //设计状态不触发事件
        return
      }

      if (!!this.field.options.onChange) {
        let changeFn = new Function('value', 'oldValue', this.field.options.onChange)
        changeFn.call(this, val, oldVal)
      }
    },

    handleOnChangeForSubForm(val, oldVal, subFormData, rowId) {  //子表单自定义onChange事件
      if (!!this.designState) { //设计状态不触发事件
        return
      }

      if (!!this.field.options.onChange) {
        let changeFn = new Function('value', 'oldValue', 'subFormData', 'rowId', this.field.options.onChange)
        changeFn.call(this, val, oldVal, subFormData, rowId)
      }
    },

    handleButtonWidgetClick() {
      if (!!this.designState) { //设计状态不触发点击事件
        return
      }

      if (!!this.field.options.onClick) {
        let customFn = new Function(this.field.options.onClick)
        customFn.call(this)
      } else {
        this.dispatch('VFormRender', 'buttonClick', [this]);
      }
    },

    remoteQuery(keyword) {
      if (!!this.designState) { //设计状态不触发事件
        return
      }

      if (!!this.field.options.onRemoteQuery) {
        let remoteFn = new Function('keyword', this.field.options.onRemoteQuery)
        remoteFn.call(this, keyword)
      }
    },

    //--------------------- 事件处理 end ------------------//

    //--------------------- 以下为组件支持外部调用的API方法 begin ------------------//
    /* 提示：用户可自行扩充这些方法！！！ */

    getFormRef() { /* 获取VFrom引用，必须在VForm组件created之后方可调用 */
      return this.refList['v_form_ref']
    },

    getWidgetRef(widgetName, showError) {
      let foundRef = this.refList[widgetName]
      if (!foundRef && !!showError) {
        this.$message.error(this.i18nt('render.hint.refNotFound') + widgetName)
      }
      return foundRef
    },

    getFieldEditor() { //获取内置的el表单组件
      return this.$refs['fieldEditor']
    },

    /*
      注意：VFormRender的setFormData方法不会触发子表单内field-widget的setValue方法，
      因为setFormData方法调用后，子表单内所有field-widget组件已被清空，接收不到setFormData事件！！
    */
    setValue(newValue, disableChangeEvent = false) {
      /* if ((this.field.type === 'picture-upload') || (this.field.type === 'file-upload')) {
        this.fileList = newValue
      } else */ if (!!this.field.formItemFlag) {
        let oldValue = deepClone(this.fieldModel)
        this.fieldModel = newValue
        this.initFileList()

        this.syncUpdateFormModel(newValue)
        if (!disableChangeEvent) {
          this.emitFieldDataChange(newValue, oldValue)
        }
      }
    },

    getValue() {
      return this.fieldModel
    },

    /**
     * 返回选项类字段的当前选中项的label值
     */
    getSelectedLabel() {
      //TODO: 待实现！！
    },

    resetField(disableChangeEvent = false) {
      let defaultValue = this.field.options.defaultValue
      this.setValue(defaultValue, disableChangeEvent)
      this.$nextTick(() => {
        //
      })

      //清空上传组件文件列表
      if ((this.field.type === 'picture-upload') || (this.field.type === 'file-upload')) {
        if (!!this.$refs['fieldEditor']) { //如果组件未隐藏
          this.$refs['fieldEditor'].clearFiles()
        }
        this.fileList.splice(0, this.fileList.length)
      }
    },

    setWidgetOption(optionName, optionValue) { //通用组件选项修改API
      if (this.field.options.hasOwnProperty(optionName)) {
        this.field.options[optionName] = optionValue
        //TODO: 是否重新构建组件？？有些属性修改后必须重新构建组件才能生效，比如字段校验规则。
      }
    },

    setReadonly(flag) {
      this.field.options.readonly = flag
    },

    setDisabled(flag) {
      this.field.options.disabled = flag
    },

    setAppendButtonVisible(flag) {
      this.field.options.appendButton = flag
    },

    setAppendButtonDisabled(flag) {
      this.field.options.appendButtonDisabled = flag
    },

    setHidden(flag) {
      this.field.options.hidden = flag

      if (!!flag) {  //清除组件校验规则
        this.clearFieldRules()
      } else {  //重建组件校验规则
        this.buildFieldRules()
      }
    },

    setRequired(flag) {
      this.field.options.required = flag
      this.buildFieldRules()

      if (!this.designState && !flag) {  //清除必填校验提示
        this.clearValidate()
      }
    },

    /**
     * 清除字段校验提示
     */
    clearValidate() {
      if (!!this.designState) {
        return
      }

      this.getFormRef().getNativeForm().clearValidate(this.getPropName())
    },

    setLabel(newLabel) {
      this.field.options.label = newLabel
    },

    focus() {
      if (!!this.getFieldEditor() && !!this.getFieldEditor().focus) {
        this.getFieldEditor().focus()
      }
    },

    clearSelectedOptions() {  //清空已选选项
      if ((this.field.type !== 'checkbox') && (this.field.type !== 'radio') && (this.field.type !== 'select')) {
        return
      }

      if ((this.field.type === 'checkbox') ||
          ((this.field.type === 'select') && this.field.options.multiple)) {
        this.fieldModel = []
      } else {
        this.fieldModel = ''
      }
    },

    /**
     * 加载选项，并清空字段值
     * @param options
     */
    loadOptions(options) {
      /*
      this.field.options.optionItems = deepClone(options)
      //this.clearSelectedOptions()  //清空已选选项
       */

      this.field.options.optionItems = translateOptionItems(options, this.field.type,
          this.field.options.labelKey || 'label',
          this.field.options.valueKey || 'value')
    },

    /**
     * 重新加载选项，不清空字段值
     * @param options
     */
    reloadOptions(options) {
      //this.field.options.optionItems = deepClone(options)

      this.field.options.optionItems = translateOptionItems(options, this.field.type,
          this.field.options.labelKey || 'label',
          this.field.options.valueKey || 'value')
    },

    disableOption(optionValue) {
      this.disableOptionOfList(this.field.options.optionItems, optionValue)
    },

    enableOption(optionValue) {
      this.enableOptionOfList(this.field.options.optionItems, optionValue)
    },

    /**
     * 返回选择项
     * @returns {*}
     */
    getOptionItems() {
      return this.field.options.optionItems
    },

    setUploadHeader(name, value) {
      this.uploadHeaders[name] = value
    },

    setUploadData(name, value) {
      this.uploadData[name] = value
    },

    setToolbar(customToolbar) {
      this.customToolbar = customToolbar
    },

    /**
     * 是否子表单内嵌的字段组件
     * @returns {boolean}
     */
    isSubFormItem() {
      return this.subFormItemFlag
    },

    /**
     * 是否子表单内嵌的字段组件
     * @returns {boolean}
     */
    isSubFormField() {
      return this.subFormItemFlag
    },

    /**
     * 设置或取消设置字段只读查看模式
     * @param readonlyFlag
     */
    setReadMode(readonlyFlag = true) {
      this.fieldReadonlyFlag = readonlyFlag
    },

    /**
     * 动态增加自定义css样式
     * @param className
     */
    addCssClass(className) {
      if (!this.field.options.customClass) {
        this.field.options.customClass = [className]
      } else {
        this.field.options.customClass.push(className)
      }
    },

    /**
     * 动态移除自定义css样式
     * @param className
     */
    removeCssClass(className) {
      if (!this.field.options.customClass) {
        return
      }

      let foundIdx = -1
      this.field.options.customClass.map((cc, idx) => {
        if (cc === className) {
          foundIdx = idx
        }
      })
      if (foundIdx > -1) {
        this.field.options.customClass.splice(foundIdx, 1)
      }
    },

    //--------------------- 以上为组件支持外部调用的API方法 end ------------------//

  }
}
