
import { inject, computed, getCurrentInstance, onMounted } from 'vue'
import { useRef } from '../refMixin'
import { useI18n } from '@/utils/i18n'
import {deepClone, traverseFieldWidgetsOfContainer, traverseWidgetsOfContainer} from "@/utils/util";




export function useContainer(props,data,widgetMethods={}){
  const refList= inject('refList')
  const refMixin = useRef(props);
  const { i18nt }= useI18n();
  const { proxy } = getCurrentInstance()


  const customClass=computed(()=>{
    return props.widget.options.customClass || ''
  })

  const formModel=computed({
    cache:false,
    get:()=>{
      return props.globalModel.formModel
    }
  })


  onMounted(()=> {
    methods.callSetHidden()
  })

  const methods= {
    ...widgetMethods,
    cloneWidgetSchema(widget) {
      return deepClone(widget)
      /**
       * 注意：在v-for循环中，必须保证克隆对象与原对象完全一致，修改克隆对象任何属性，
       * 都会触发组件的beforeDestroy事件钩子！！！
       */


      // let newWidgetSchema = deepClone(widget)
      // newWidgetSchema.id = widget.type + generateId()
      // return newWidgetSchema
    },

    unregisterFromRefList() {  //销毁容器组件时注销组件ref
      if ((refList !== null) && !!props.widget.options.name) {
        let oldRefName = props.widget.options.name
        delete refList[oldRefName]
      }
    },

    /* 主动触发setHidden()方法，以清空被隐藏容器内字段组件的校验规则！！ */
    callSetHidden() {
      if (props.widget.options.hidden === true) {
        methods.setHidden(true)
      }
    },

    //--------------------- 以下为组件支持外部调用的API方法 begin ------------------//
    /* 提示：用户可自行扩充这些方法！！！ */

    setHidden(flag) {
      props.widget.options.hidden = flag

      /* 容器被隐藏后，需要同步清除容器内部字段组件的校验规则 */
      let clearRulesFn = (fieldWidget) => {
        let fwName = fieldWidget.options.name
        let fwRef = refMixin.getWidgetRef(fwName)
        if (flag && !!fwRef && !!fwRef.clearFieldRules) {
          fwRef.clearFieldRules()
        }

        if (!flag && !!fwRef && !!fwRef.buildFieldRules) {
          fwRef.buildFieldRules()
        }
      }

      traverseFieldWidgetsOfContainer(props.widget, clearRulesFn)
    },

    /**
     * 禁用或启用容器组件（包含容器内部的所有组件）
     * @param flag
     */
    setDisabled(flag) {
      const fwHandler = (fw) => {
        const fwName = fw.options.name
        const fwRef = refMixin.getWidgetRef(fwName)
        if (!!fwRef && !!fwRef.setDisabled) {
          fwRef.setDisabled(flag)
        }
      }
      const cwHandler = (cw) => {
        const cwName = cw.options.name
        const cwRef = refMixin.getWidgetRef(cwName)
        if (!!cwRef && !!cwRef.setDisabled) {
          cwRef.setDisabled(flag)
        }
      }
      traverseWidgetsOfContainer(props.widget, fwHandler, cwHandler)

      //注意：单行子表单、多行子表单容器的setDisabled方法由单行子表单、多行子表单组件自己实现！！
    },

    activeTab(tabIndex) { //tabIndex从0计数
      if ((tabIndex >= 0) && (tabIndex < props.widget.tabs.length)) {
        props.widget.tabs.forEach((tp, idx) => {
          tp.options.active = idx === tabIndex
          if (idx === tabIndex) {
            data.activeTabName = tp.options.name
          }
        })
      }
    },

    disableTab(tabIndex) {
      if ((tabIndex >= 0) && (tabIndex < props.widget.tabs.length)) {
        props.widget.tabs[tabIndex].options.disabled = true
      }
    },

    enableTab(tabIndex) {
      if ((tabIndex >= 0) && (tabIndex < props.widget.tabs.length)) {
        props.widget.tabs[tabIndex].options.disabled = false
      }
    },

    hideTab(tabIndex) {
      if ((tabIndex >= 0) && (tabIndex < props.widget.tabs.length)) {
        props.widget.tabs[tabIndex].options.hidden = true
      }
    },

    showTab(tabIndex) {
      if ((tabIndex >= 0) && (tabIndex < props.widget.tabs.length)) {
        props.widget.tabs[tabIndex].options.hidden = false
      }
    },

    setWidgetOption(optionName, optionValue) { //通用组件选项修改API
      if (props.widget.options.hasOwnProperty(optionName)) {
        props.widget.options[optionName] = optionValue
      }
    },

    /**
     * 获取子表单的行数
     */
    getSubFormRowCount() {
      return !data.rowIdData ? 0 : data.rowIdData.length
    },

    setGridSubFormRowDisabled(rowId, disabledFlag) {
      const fwHandler = (fw) => {
        const fwName = fw.options.name + '@row' + rowId
        const fwRef = refMixin.getWidgetRef(fwName)
        if (!!fwRef && !!fwRef.setDisabled) {
          fwRef.setDisabled(disabledFlag)
        }
      }
      const cwHandler = (cw) => {
        const cwName = cw.options.name + '@row' + rowId
        const cwRef = refMixin.getWidgetRef(cwName)
        if (!!cwRef && !!cwRef.setDisabled) {
          cwRef.setDisabled(disabledFlag)
        }
      }
      traverseWidgetsOfContainer(props.widget, fwHandler, cwHandler)
    },

    disableSubFormRow(rowIndex) {
      if (props.widget.type === 'sub-form') {
        props.widget.widgetList.forEach(subWidget => {
          let swRefName = subWidget.options.name + '@row' + data.rowIdData[rowIndex]
          let foundSW = refMixin.getWidgetRef(swRefName)
          if (!!foundSW && !!foundSW.setDisabled) {
            foundSW.setDisabled(true)
          }
        })
      } else if (props.widget.type === 'grid-sub-form') {
        setGridSubFormRowDisabled(data.rowIdData[rowIndex], true)
      }
    },

    enableSubFormRow(rowIndex) {
      if (props.widget.type === 'sub-form') {
        props.widget.widgetList.forEach(subWidget => {
          let swRefName = subWidget.options.name + '@row' + data.rowIdData[rowIndex]
          let foundSW = refMixin.getWidgetRef(swRefName)
          if (!!foundSW && !!foundSW.setDisabled) {
            foundSW.setDisabled(false)
          }
        })
      } else if (props.widget.type === 'grid-sub-form') {
        setGridSubFormRowDisabled(data.rowIdData[rowIndex], false)
      }
    },

    disableSubForm() {
      if (data.rowIdData.length > 0) {
        data.rowIdData.forEach((dataRow, rIdx) => {
          methods.disableSubFormRow(rIdx)
        })
      }

      //禁用3个操作按钮
      data.actionDisabled = true
    },

    enableSubForm() {
      if (data.rowIdData.length > 0) {
        data.rowIdData.forEach((dataRow, rIdx) => {
          methods.enableSubFormRow(rIdx)
        })
      }

      //启用3个操作按钮
      data.actionDisabled = false
    },

    disableGridSubFormRow(rowIndex) {
      let gsfFWList = []
      let fieldListFn = (fw) => {
        gsfFWList.push(fw)
      }
      traverseFieldWidgetsOfContainer(props.widget, fieldListFn)

      gsfFWList.forEach(fw => {
        let swRefName = fw.options.name + '@row' + data.rowIdData[rowIndex]
        let foundSW = refMixin.getWidgetRef(swRefName)
        if (!!foundSW && !!foundSW.setDisabled) {
          foundSW.setDisabled(true)
        }
      })
    },

    enableGridSubFormRow(rowIndex) {
      let gsfFWList = []
      let fieldListFn = (fw) => {
        gsfFWList.push(fw)
      }
      traverseFieldWidgetsOfContainer(props.widget, fieldListFn)

      gsfFWList.forEach(fw => {
        let swRefName = fw.options.name + '@row' + data.rowIdData[rowIndex]
        let foundSW = refMixin.getWidgetRef(swRefName)
        if (!!foundSW && !!foundSW.setDisabled) {
          foundSW.setDisabled(false)
        }
      })
    },

    disableGridSubForm() {
      if (data.rowIdData.length > 0) {
        data.rowIdData.forEach((dataRow, rIdx) => {
          methods.disableGridSubFormRow(rIdx)
        })
      }

      //禁用3个操作按钮
      data.actionDisabled = true
    },

    enableGridSubForm() {
      if (data.rowIdData.length > 0) {
        data.rowIdData.forEach((dataRow, rIdx) => {
          methods.enableGridSubFormRow(rIdx)
        })
      }

      //启用3个操作按钮
      data.actionDisabled = false
    },

    resetSubForm() { //重置subForm数据为空
      if (props.widget.type === 'sub-form') {
        let subFormModel = formModel[props.widget.options.name]
        if (!!subFormModel) {
          subFormModel.splice(0, subFormModel.length)
          data.rowIdData.splice(0, data.rowIdData.length)
        }

        if (props.widget.options.showBlankRow) {
          if(methods.addSubFormRow)
             methods.addSubFormRow()
        }
      }
    },

    getSubFormValues(needValidation = true) {
      if (props.widget.type === 'sub-form') {
        //TODO: 逐行校验子表单！！
        return formModel[props.widget.options.name]
      } else {
        proxy.$message.error(i18nt('render.hint.nonSubFormType'))
      }
    },

    // validateField(fieldName) { //逐行校验子表单字段
    //   //TODO:
    // },
    //
    // validateSubForm() { //逐行校验子表单全部字段
    //   //TODO:
    // },

    /**
     * 动态增加自定义css样式
     * @param className
     */
    addCssClass(className) {
      if (!props.widget.options.customClass) {
        props.widget.options.customClass = [className]
      } else {
        props.widget.options.customClass.push(className)
      }
    },

    /**
     * 动态移除自定义css样式
     * @param className
     */
    removeCssClass(className) {
      if (!props.widget.options.customClass) {
        return
      }

      let foundIdx = -1
      props.widget.options.customClass.map((cc, idx) => {
        if (cc === className) {
          foundIdx = idx
        }
      })
      if (foundIdx > -1) {
        props.widget.options.customClass.splice(foundIdx, 1)
      }
    },

    //--------------------- 以上为组件支持外部调用的API方法 end ------------------//

  }

  return {
    customClass,
    formModel,
    ...methods
  }

}
