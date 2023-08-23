import Clipboard from 'clipboard'
import axios from 'axios'
    //引入计算公式函数相关
import {
  CAL_FUNCTION_ENUM
} from '@/utils/config'
import * as formulajs from 'formulajs' 
import {EditorView} from "codemirror"
import {MatchDecorator,Decoration,ViewPlugin,WidgetType} from "@codemirror/view"
//引入计算公式函数相关 end

export function isNull(value) {
  return (value === null) || (value === undefined);
}

export function isNotNull(value) {
  return (value !== null) && (value !== undefined);
}

export function isEmptyStr(str) {
  //return (str === undefined) || (!str) || (!/[^\s]/.test(str));
  return (str === undefined) || (!str && (str !== 0) && (str !== '0')) || (!/[^\s]/.test(str));
}

export const generateId = function() {
  return Math.floor(Math.random() * 100000 + Math.random() * 20000 + Math.random() * 5000);
};

export const deepClone = function (origin) {
  if (origin === undefined) {
    return undefined
  }

  return JSON.parse(JSON.stringify(origin))
}

export const overwriteObj = function(obj1, obj2) {  /* 浅拷贝对象属性，obj2覆盖obj1 */
  Object.keys(obj2).forEach(prop => {
    obj1[prop] = obj2[prop]
  })
}

/* 用Function对象实现eval函数功能 */
export const evalFn = function (fn, DSV = null, VFR = null) {
  let f = new Function('DSV', 'VFR', 'LS', 'return ' + fn);
  return f(DSV, VFR, localStorage);
};

export const trimEx = function (str, char, type) {
  if (char) {
    if (type === 'left') {
      return str.replace(new RegExp('^\\'+char+'+', 'g'), '');
    } else if (type === 'right') {
      return str.replace(new RegExp('\\'+char+'+$', 'g'), '');
    }

    return str.replace(new RegExp('^\\'+char+'+|\\'+char+'+$', 'g'), '');
  }

  return str.replace(/^\s+|\s+$/g, '');
}

export const hasPropertyOfObject = function(obj, propPath) {
  const keys = propPath.split('.')
  let tmpObj = obj
  let result = true

  for (const key of keys) {
    if (!tmpObj.hasOwnProperty(key)) {
      result = false
      break
    } else {
      tmpObj = tmpObj[key]
    }
  }

  return result
}

function isDef(value) {
  return value !== undefined && value !== null
}

export const getObjectValue = function(obj, propPath) {
  const keys = propPath.split('.')
  let result = obj

  keys.forEach(key => {
    result = isDef(result) && isDef(result[key]) ? result[key] : null
  })

  return result
}

export const setObjectValue = function(obj, objectName, value) {
  const objectChains = objectName.split('.')
  let objectModel = obj

  objectChains.forEach((key, idx) => {
    if (!key) return

    if (idx === objectChains.length - 1) {
      objectModel[key] = value
      return
    }

    if (objectModel[key] === undefined) {
      objectModel[key] = {}
    }
    objectModel = objectModel[key]
  })
}

export const addWindowResizeHandler = function (handler) {
  let oldHandler = window.onresize
  if (typeof window.onresize != 'function') {
    window.onresize = handler
  } else {
    window.onresize = function () {
      oldHandler()
      handler()
    }
  }
}

const createStyleSheet = function() {
  let head = document.head || document.getElementsByTagName('head')[0];
  let style = document.createElement('style');
  style.type = 'text/css';
  head.appendChild(style);
  return style.sheet;
}

export const insertCustomCssToHead = function (cssCode, formId = '') {
  let head = document.getElementsByTagName('head')[0]
  let oldStyle = document.getElementById('vform-custom-css')
  if (!!oldStyle) {
    head.removeChild(oldStyle)  //先清除后插入！！
  }
  if (!!formId) {
    oldStyle = document.getElementById('vform-custom-css' + '-' + formId)
    !!oldStyle && head.removeChild(oldStyle)  //先清除后插入！！
  }

  let newStyle = document.createElement('style')
  newStyle.type = 'text/css'
  newStyle.rel = 'stylesheet'
  newStyle.id = !!formId ? 'vform-custom-css' + '-' + formId : 'vform-custom-css'
  try {
    newStyle.appendChild(document.createTextNode(cssCode))
  } catch(ex) {
    newStyle.styleSheet.cssText = cssCode
  }

  head.appendChild(newStyle)
}

export const insertGlobalFunctionsToHtml = function (functionsCode, formId = '') {
  let bodyEle = document.getElementsByTagName('body')[0]
  let oldScriptEle = document.getElementById('v_form_global_functions')
  !!oldScriptEle && bodyEle.removeChild(oldScriptEle)  //先清除后插入！！
  if (!!formId) {
    oldScriptEle = document.getElementById('v_form_global_functions' + '-' + formId)
    !!oldScriptEle && bodyEle.removeChild(oldScriptEle)  //先清除后插入！！
  }

  let newScriptEle = document.createElement('script')
  newScriptEle.id = !!formId ? 'v_form_global_functions' + '-' + formId : 'v_form_global_functions'
  newScriptEle.type = 'text/javascript'
  newScriptEle.innerHTML = functionsCode
  bodyEle.appendChild(newScriptEle)
}

export const optionExists = function(optionsObj, optionName) {
  if (!optionsObj) {
    return false
  }

  return Object.keys(optionsObj).indexOf(optionName) > -1
}

export const loadRemoteScript = function(srcPath, callback) {  /*加载远程js，加载成功后执行回调函数*/
  let sid = encodeURIComponent(srcPath)
  let oldScriptEle = document.getElementById(sid)

  if (!oldScriptEle) {
    let s = document.createElement('script')
    s.src = srcPath
    s.id = sid
    document.body.appendChild(s)

    s.onload = s.onreadystatechange = function (_, isAbort) { /* 借鉴自ace.js */
      if (isAbort || !s.readyState || s.readyState === "loaded" || s.readyState === "complete") {
        s = s.onload = s.onreadystatechange = null
        if (!isAbort) {
          callback()
        }
      }
    }
  }
}

export function traverseFieldWidgets(widgetList, handler, parent = null, staticWidgetsIncluded = false) {
  if (!widgetList) {
    return
  }

  widgetList.map(w => {
    if (w.formItemFlag || ((w.formItemFlag === false) && staticWidgetsIncluded)) {
      handler(w, parent)
    } else if (w.type === 'grid') {
      w.cols.map(col => {
        traverseFieldWidgets(col.widgetList, handler, w, staticWidgetsIncluded)
      })
    } else if (w.type === 'table') {
      w.rows.map(row => {
        row.cols.map(cell => {
          traverseFieldWidgets(cell.widgetList, handler, w, staticWidgetsIncluded)
        })
      })
    } else if (w.type === 'tab') {
      w.tabs.map(tab => {
        traverseFieldWidgets(tab.widgetList, handler, w, staticWidgetsIncluded)
      })
    } else if (w.type === 'sub-form' || w.type === 'grid-sub-form') {
      traverseFieldWidgets(w.widgetList, handler, w, staticWidgetsIncluded)
    } else if (w.category === 'container') {  //自定义容器
      traverseFieldWidgets(w.widgetList, handler, w, staticWidgetsIncluded)
    }
  })
}

export function traverseContainerWidgets(widgetList, handler) {
  if (!widgetList) {
    return
  }

  widgetList.map(w => {
    if (w.category === 'container') {
      handler(w)
    }

    if (w.type === 'grid') {
      w.cols.map(col => {
        traverseContainerWidgets(col.widgetList, handler)
      })
    } else if (w.type === 'table') {
      w.rows.map(row => {
        row.cols.map(cell => {
          traverseContainerWidgets(cell.widgetList, handler)
        })
      })
    } else if (w.type === 'tab') {
      w.tabs.map(tab => {
        traverseContainerWidgets(tab.widgetList, handler)
      })
    } else if (w.type === 'sub-form' || w.type === 'grid-sub-form') {
      traverseContainerWidgets(w.widgetList, handler)
    } else if (w.category === 'container') {  //自定义容器
      traverseContainerWidgets(w.widgetList, handler)
    }
  })
}

export function traverseAllWidgets(widgetList, handler) {
  if (!widgetList) {
    return
  }

  widgetList.map(w => {
    handler(w)

    if (w.type === 'grid') {
      w.cols.map(col => {
        handler(col)
        traverseAllWidgets(col.widgetList, handler)
      })
    } else if (w.type === 'table') {
      w.rows.map(row => {
        row.cols.map(cell => {
          handler(cell)
          traverseAllWidgets(cell.widgetList, handler)
        })
      })
    } else if (w.type === 'tab') {
      w.tabs.map(tab => {
        traverseAllWidgets(tab.widgetList, handler)
      })
    } else if (w.type === 'sub-form' || w.type === 'grid-sub-form') {
      traverseAllWidgets(w.widgetList, handler)
    } else if (w.category === 'container') {  //自定义容器
      traverseAllWidgets(w.widgetList, handler)
    }
  })
}

function handleWidgetForTraverse(widget, handler) {
  if (!!widget.category && (widget.category === 'container')) {
    traverseFieldWidgetsOfContainer(widget, handler)
  } else if (widget.formItemFlag) {
    handler(widget)
  }
}

/**
 * 遍历容器内的字段组件
 * @param con
 * @param handler
 */
export function traverseFieldWidgetsOfContainer(con, handler) {
  if (con.type === 'grid') {
    con.cols.forEach(col => {
      col.widgetList.forEach(cw => {
        handleWidgetForTraverse(cw, handler)
      })
    })
  } else if (con.type === 'table') {
    con.rows.forEach(row => {
      row.cols.forEach(cell => {
        cell.widgetList.forEach(cw => {
          handleWidgetForTraverse(cw, handler)
        })
      })
    })
  } else if (con.type === 'tab') {
    con.tabs.forEach(tab => {
      tab.widgetList.forEach(cw => {
        handleWidgetForTraverse(cw, handler)
      })
    })
  } else if (con.type === 'sub-form' || con.type === 'grid-sub-form') {
    con.widgetList.forEach(cw => {
      handleWidgetForTraverse(cw, handler)
    })
  } else if (con.category === 'container') {  //自定义容器
    con.widgetList.forEach(cw => {
      handleWidgetForTraverse(cw, handler)
    })
  }
}

function handleContainerTraverse(widget, fieldHandler, containerHandler) {
  if (!!widget.category && (widget.category === 'container')) {
    traverseWidgetsOfContainer(widget, fieldHandler, containerHandler)
  } else if (widget.formItemFlag) {
    fieldHandler(widget)
  }
}

/**
 * 遍历容器内部的字段组件和容器组件
 * @param con
 * @param fieldHandler
 * @param containerHandler
 */
export function traverseWidgetsOfContainer(con, fieldHandler, containerHandler) {
  if (con.category === 'container') {
    containerHandler(con)
  }

  if (con.type === 'grid') {
    con.cols.forEach(col => {
      col.widgetList.forEach(cw => {
        handleContainerTraverse(cw, fieldHandler, containerHandler)
      })
    })
  } else if (con.type === 'table') {
    con.rows.forEach(row => {
      row.cols.forEach(cell => {
        cell.widgetList.forEach(cw => {
          handleContainerTraverse(cw, fieldHandler, containerHandler)
        })
      })
    })
  } else if (con.type === 'tab') {
    con.tabs.forEach(tab => {
      tab.widgetList.forEach(cw => {
        handleContainerTraverse(cw, fieldHandler, containerHandler)
      })
    })
  } else if (con.type === 'sub-form' || con.type === 'grid-sub-form') {
    con.widgetList.forEach(cw => {
      handleContainerTraverse(cw, fieldHandler, containerHandler)
    })
  } else if (con.category === 'container') {  //自定义容器
    con.widgetList.forEach(cw => {
      handleContainerTraverse(cw, fieldHandler, containerHandler)
    })
  }
}

/**
 * 获取所有字段组件
 * @param widgetList
 * @param staticWidgetsIncluded 是否包含按钮等静态组件，默认不包含
 * @returns {[]}
 */
export function getAllFieldWidgets(widgetList, staticWidgetsIncluded = false) {
  if (!widgetList) {
    return []
  }

  let result = []
  let handlerFn = (w) => {
    result.push({
      type: w.type,
      name: w.options.name,
      field: w
    })
  }
  traverseFieldWidgets(widgetList, handlerFn, null, staticWidgetsIncluded)

  return result
}

/**
 * 获取所有容器组件
 * @param widgetList
 * @returns {[]}
 */
export function getAllContainerWidgets(widgetList) {
  if (!widgetList) {
    return []
  }

  let result = []
  let handlerFn = (w) => {
    result.push({
      type: w.type,
      name: w.options.name,
      container: w
    })
  }
  traverseContainerWidgets(widgetList, handlerFn)

  return result
}

export function getFieldWidgetByName(widgetList, fieldName, staticWidgetsIncluded) {
  if (!widgetList) {
    return null
  }

  let foundWidget = null
  let handlerFn = (widget) => {
    if (widget.options.name === fieldName) {
      foundWidget = widget
    }
  }

  traverseFieldWidgets(widgetList, handlerFn, null, staticWidgetsIncluded)
  return foundWidget
}

export function getFieldWidgetById(widgetList, fieldId, staticWidgetsIncluded) {
  if (!widgetList) {
    return null
  }

  let foundWidget = null
  let handlerFn = (widget) => {
    if (widget.id === fieldId) {
      foundWidget = widget
    }
  }

  traverseFieldWidgets(widgetList, handlerFn, null, staticWidgetsIncluded)
  return foundWidget
}

export function getContainerWidgetByName(widgetList, containerName) {
  if (!widgetList) {
    return null
  }

  let foundContainer = null
  let handlerFn = (con) => {
    if (con.options.name === containerName) {
      foundContainer = con
    }
  }

  traverseContainerWidgets(widgetList, handlerFn)
  return foundContainer
}

export function getContainerWidgetById(widgetList, containerId) {
  if (!widgetList) {
    return null
  }

  let foundContainer = null
  let handlerFn = (con) => {
    if (con.id === containerId) {
      foundContainer = con
    }
  }

  traverseContainerWidgets(widgetList, handlerFn)
  return foundContainer
}

export function copyToClipboard(content, clickEvent, $message, successMsg, errorMsg) {
  const clipboard = new Clipboard(clickEvent.target, {
    text: () => content
  })

  clipboard.on('success', () => {
    $message.success(successMsg)
    clipboard.destroy()
  })

  clipboard.on('error', () => {
    $message.error(errorMsg)
    clipboard.destroy()
  })

  clipboard.onClick(clickEvent)
}

export function getQueryParam(variable) {
  let query = window.location.search.substring(1);
  let vars = query.split("&")
  for (let i=0; i<vars.length; i++) {
    let pair = vars[i].split("=")
    if(pair[0] == variable) {
      return pair[1]
    }
  }

  return undefined;
}

export function getDefaultFormConfig() {
  return {
    modelName: 'formData',
    refName: 'vForm',
    rulesName: 'rules',
    labelWidth: 80,
    labelPosition: 'left',
    size: '',
    labelAlign: 'label-left-align',
    cssCode: '',
    customClass: [],
    functions: '',  //全局函数
    layoutType: 'PC',
    jsonVersion: 3,
    dataSources: [],  //数据源集合

    onFormCreated: '',
    onFormMounted: '',
    onFormDataChange: '',
  }
}

export function buildDefaultFormJson() {
  return {
    widgetList: [],
    formConfig: deepClone( getDefaultFormConfig() )
  }
}

export function cloneFormConfigWithoutEventHandler(formConfig) {
  let newFC = deepClone(formConfig)
  newFC.onFormCreated = ''
  newFC.onFormMounted = ''
  newFC.onFormDataChange = ''

  return newFC
}

/**
 * 转译选择项数据
 * @param rawData
 * @param widgetType
 * @param labelKey
 * @param valueKey
 * @returns {[]}
 */
export function translateOptionItems(rawData, widgetType, labelKey, valueKey) {
  if (widgetType === 'cascader') { // 级联选择不转译
    return deepClone(rawData)
  }

  let result = []
  if (!!rawData && (rawData.length > 0)) {
    rawData.forEach(ri => {
      result.push({
        label: ri[labelKey],
        value: ri[valueKey]
      })
    })
  }

  return result
}

/**
 * 组装axios请求配置参数
 * @param arrayObj
 * @param DSV
 * @param VFR
 * @returns {{}}
 */
export function assembleAxiosConfig(arrayObj, DSV, VFR) {
  let result = {}
  if (!arrayObj || (arrayObj.length <= 0)) {
    return result
  }

  arrayObj.map(ai => {
    if (ai.type === 'String') {
      result[ai.name] = String(ai.value)
    } else if (ai.type === 'Number') {
      result[ai.name] = Number(ai.value)
    } else if (ai.type === 'Boolean') {
      if ((ai.value.toLowerCase() === 'false') || (ai.value === '0')) {
        result[ai.name] = false
      } else if ((ai.value.toLowerCase() === 'true') || (ai.value === '1')) {
        result[ai.name] = true
      } else {
        result[ai.name] = null
      }
    } else if (ai.type === 'Variable') {
      result[ai.name] = evalFn(ai.value, DSV, VFR)
    }
  })

  /* 加入如下两行日志打印代码，是为了防止编译打包时DSV、VFR参数被剔除！！ begin */
  /* DSV、VFR入参没有在本函数中直接使用到，但在eval表达式中可能被使用到，故需确保DSV、VFR参数始终存在！！ */
  console.log('test DSV: ', DSV)
  console.log('test VFR: ', VFR)
  /* 加入如下两行日志打印代码，是为了防止编译打包时DSV、VFR入参会被剔除！！ end */

  return result
}

function buildRequestConfig(dataSource, DSV, VFR, isSandbox) {
  let config = {}
  if (dataSource.requestURLType === 'String') {
    config.url = dataSource.requestURL
  } else {
    config.url = evalFn(dataSource.requestURL, DSV, VFR)
  }
  config.method = dataSource.requestMethod

  config.headers = assembleAxiosConfig(dataSource.headers, DSV, VFR)
  config.params = assembleAxiosConfig(dataSource.params, DSV, VFR)
  config.data = assembleAxiosConfig(dataSource.data, DSV, VFR)

  let chFn = new Function('config', 'isSandbox', 'DSV', 'VFR', dataSource.configHandlerCode)
  return chFn.call(null, config, isSandbox, DSV, VFR)
}

export async function runDataSourceRequest(dataSource, DSV, VFR, isSandbox, $message) {
  try {
    let requestConfig = buildRequestConfig(dataSource, DSV, VFR, isSandbox)
    //console.log('test------', requestConfig)
    let result = await axios.request(requestConfig)
    //let result = await axios.create().request(requestConfig)

    let dhFn = new Function('result', 'isSandbox', 'DSV', 'VFR', dataSource.dataHandlerCode)
    return dhFn.call(null, result, isSandbox, DSV, VFR)
  } catch (err) {
    let ehFn = new Function('error', 'isSandbox', 'DSV', '$message', 'VFR', dataSource.errorHandlerCode)
    console.error(err)
    return ehFn.call(null, err, isSandbox, DSV, $message, VFR)
  }
}

export function getDSByName(formConfig, dsName) {
  let resultDS = null
  if (!!dsName && !!formConfig.dataSources) {
    formConfig.dataSources.forEach(ds => {
      if (ds.uniqueName === dsName) {
        resultDS = ds
      }
    })
  }

  if (!resultDS) {
    console.error('DS not found: ' + dsName)
  }
  return resultDS
}
//==============计算公式 begin==============

			// 计算公式全局字段组件汇总和计算
			export function handlerFormulaCal(VFR,DSV,val = VFR.formDataModel) {
        
				let fieldList = []
				Object.keys(val).forEach(propName => {
					fieldList.push(propName)
				})
				for (let i = 0; i < fieldList.length; i++) {
					let fieldWidget = VFR.getWidgetRef(fieldList[i])
					if (!!fieldWidget && !!fieldWidget.field) {
						let formula = fieldWidget.field.options.formula // 字段结算公式
						let enableFormula = fieldWidget.field.options.enableFormula // 启用计算公式
						if (!!formula && enableFormula) {
							localStorage.setItem("currentFormulaWidgetType", "main") // 计算公式赋值对象，sub子表单字段，main主表单字段
							// 获取字段组件值获取替换后的计算公式
							VFR.formula = getFormula(VFR,formula)
							// 加入计算公式中的函数计算
							if (!!VFR.formula) {
								try {

									// 查找计算公式中的函数，统一转为大写，并改为this.FUNAPI.函数名
									let arr = VFR.formula.match(/[A-Za-z]*/g)
									for (let i = 0; i < arr.length; i++) {
										// 判断函数不为空，且在预置函数穷举列表中
										if (!!arr[i] && findCalFunStartIndex(arr[i]) != -1) {
											let funName = arr[i].toUpperCase()
											if (funName === "TODAY" || funName === "NOW" || funName === "EMONTH" || funName === "EDAY") {
												VFR.formula = VFR.formula.replace(arr[i], "this." + funName);
											} else {
												VFR.formula = VFR.formula.replace(arr[i], "this.FUNAPI." + funName);
											}
										}
									}
									let regExpFlag = new RegExp(
										"[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}+-\\/【】‘；：”“'。，、？ ]")
									// 判断结果是否最终值，且没有函数,没有运算符，若是则断定为字符串拼接值，直接复制到字段组件
                
									if (findCalFunStartIndex(VFR.formula) === -1 && !regExpFlag.test(VFR.formula)) {
										let value = VFR.formula
										if (value === "null" || !value) {
											value = ""
										}
										fieldWidget.setValue(value)
									} else {
                    //===bug:首次加载页面时，关联的组件是没有值的，会导致公式直接赋值到 input
										// if (this.formula.indexOf(",") != -1) {
										// 	fieldWidget.setValue(this.formula)
										// } else {
                                        //      fieldWidget.setValue(eval(this.formula));
										// }
                                        try{
                                            let f=new Function("return "+VFR.formula);
                                         
                                            fieldWidget.setValue(f.call(VFR));
                                            //fieldWidget.setValue(evalFn(VFR.formula,DSV,VFR));
                                        }
                                        catch(e){
                                            //运算报错
                                            console.error("运算报错==>",e);
                                        }
                                         
									}

									VFR.formula = "";
								} catch (err) {
									let fieldName = VFR.getWidgetRef(fieldList[i]).field.options.label || fieldList[i]
									console.log(fieldName + " 的公式:" + VFR.formula + ",出错：" + err);
									VFR.$message.error(fieldName + " 的公式:" + VFR.formula + ",出错：" + err);
								}
							}
						}
					}
				}
			}

			/** 
			 * 通过公式中的组件名称获取值，然后原址替换
			 * @param {Object} formula 计算公式
			 */
		 export function	getFormula(VFR,formula) {

       

				let value = null;
				let fieldHandle = "";
				let fieldStart = formula.indexOf("{");
				let subFieldStart = formula.indexOf("[");
				if (fieldStart === -1 && subFieldStart === -1) {
					// 返回公式计算结果
					return formula
				} else {
					let currentSubFormRowId = localStorage.getItem("currentSubFormRowId")
					// 主表字段取值
					if (fieldStart != -1) {
						let fieldEnd = formula.indexOf("}", fieldStart) + 1;
						// 抓取字段组件名，带大括号
						fieldHandle = formula.substring(fieldStart, fieldEnd);
						// 获取字段组件名去大括号
						let widgetID = fieldHandle.split("{")[1].split("}")[0]
						// 获取组件值
						value = VFR.getWidgetRef(widgetID).getValue();

            // if (typeof value === "string") {
            //   value = "\""+ value +"\"";
            // }
            // if (typeof value === "number") {
            //   value = Number(value)
            // }
					}
					// 字表字段取值
					if (subFieldStart != -1) {
						let subFieldEnd = formula.indexOf("]", subFieldStart) + 1;
						fieldHandle = formula.substring(subFieldStart, subFieldEnd);
						let subWidget = fieldHandle.split("[")[1].split("]")[0]
						let subContainerID = subWidget.split(".")[0]
						let subFieldID = subWidget.split(".")[1]
						// 获取被赋值字段组件类型
						let currentFormulaWidgetType = localStorage.getItem("currentFormulaWidgetType")
						// 根据ID获取子表单字段组件
						let widget = VFR.getFormRef().findFieldWidgetById(subFieldID, true)
						// 获取子表单字段组件的name
						let widgetName = widget.options.name
						// 赋值给主表字段-取值方式
						if (currentFormulaWidgetType === "main") {
							// 获取编辑表格数据默认是合计，而获取表单字段用getValue()
							if (!!subContainerID && !!widgetName) {
								let stringArr = [];
								Object.keys(VFR.formDataModel).forEach((propName, index) => {
									if (subContainerID === propName) {
										let subFieldArr = VFR.formDataModel[propName]
										for (let i = 0; i < subFieldArr.length; i++) {
											let v = subFieldArr[i][widgetName]
											if (typeof v === "string") {
												stringArr.push(v)
											}
											if (typeof v === "number") {
												value += Number(v)
											}
										}
									}
								})
								let result = Array.from(new Set(stringArr))
               
								for (let i = 0; i < result.length; i++) {
									if (i === 0) {
										value = result[i]
									} else {
										value = value + "," + result[i]
									}
								}
							}
						}
						// 赋值给子表字段 - 取值方式
						if (currentFormulaWidgetType === "sub") {
							// 根据组件获取name，从而获取到具体某行某字段的值
							value = VFR.getWidgetRef(widgetName + "@row" + currentSubFormRowId)?.getValue()
						}
					}
				}
				// 将公式中字段组件占位符，替换为组件值
				formula = formula.replace(fieldHandle, value)
				// 继续替换下一处字段组件
				return getFormula(VFR,formula);
			}

			/** 
			 * 公式套用函数计算得出计算结果
			 * 若有函数嵌套，则先计算更深层函数结果
			 * @param {Object} formula
			 */
			export function functionCal(VFR,formula) {
				// let startIndex = formula.indexOf("SUM(");
				let startIndex = findCalFunStartIndex(formula)
				// 若找到函数，则解析函数，否则直接EVAL计算公式
				if (startIndex != -1) {
					let endIndex = formula.indexOf(")", startIndex) + 1;
					let funStr = formula.substring(startIndex, endIndex);
					let funName = funStr.split("(")[0]
					let funPara = funStr.split("(")[1].split(")")[0]
					if (!Number(funPara) && funPara.indexOf(",") === -1) {
						if (funName === "FALSE") {
							return formulajs.FALSE()
						}
						return functionCal(funPara + funStr.split(funPara)[1])
					}
					let paraList = funPara.split(",")
					// 如果是计算函数则转为数字型
					for (let i = 0; i < paraList.length; i++) {
						// paraList[i] = Number(eval(paraList[i]))
						try {
							if (paraList[i] === "FALSE") {
								paraList[i] = false;
							}
							paraList[i] = eval(paraList[i])
						} catch (e) {
							//TODO handle the exception
							console.log("函数[" + funStr + "]中的参数" + paraList[i] + "异常")
							console.log(e)
							VFR.formula = ""
						}
					}
					// 通过formulajs API计算函数结果替换所在公式对应位置
					let execFunCal = formulajs[funName](...paraList)
					VFR.formula = VFR.formula.replace(funStr, execFunCal)
				} else {
					return eval("\"" + VFR.formula + "\"")
				}
				return functionCal(VFR.formula)
			}
			// 查找公式中的函数是否在枚举中
		 export function	hasFun(funName) {
				for (let i = 0; i < CAL_FUNCTION_ENUM.length; i++) {
					if (funName === CAL_FUNCTION_ENUM[i]) {
						return true
					}
				}
				return false
			}

		export function	findCalFunStartIndex(formula) {
				let startIndex = -1
				for (let i = 0; i < CAL_FUNCTION_ENUM.length; i++) {
					let index = formula.indexOf(CAL_FUNCTION_ENUM[i])
					if (index != -1) {
						return index
					}
				}
				return startIndex
			}
			//--------------------- 以下为公式计算的API方法 start ------------------//
			// 日期格式化
			export function dateFormat(date, fmt) {
				date = new Date(date)
				let a = ['日', '一', '二', '三', '四', '五', '六']
				let o = {
					'M+': date.getMonth() + 1, // 月份
					'd+': date.getDate(), // 日
					'h+': date.getHours(), // 小时
					'm+': date.getMinutes(), // 分
					's+': date.getSeconds(), // 秒
					'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
					'S': date.getMilliseconds(), // 毫秒
					'w': date.getDay(), // 周
					'W': a[date.getDay()], // 大写周
					'T': 'T'
				}
				if (/(y+)/.test(fmt)) {
					fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
				}
				for (let k in o) {
					if (new RegExp('(' + k + ')').test(fmt)) {
						fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
					}
				}
				return fmt
			}
			//月份加减
		 export function	addMonths(yearMonthDay, monthNum) {
				let arr = yearMonthDay.split('-'); //2020-08-19或2020-08
				let year = parseInt(arr[0]);
				let month = parseInt(arr[1]);
				month = month + monthNum;
				if (month > 12) { //月份加
					let yearNum = parseInt((month - 1) / 12);
					month = month % 12 === 0 ? 12 : month % 12;
					year += yearNum;
				} else if (month <= 0) { //月份减
					month = Math.abs(month);
					let yearNum = parseInt((month + 12) / 12);
					year -= yearNum;
				}
				month = month < 10 ? "0" + month : month;
				return year + "-" + month;
			}

      		// 获取当前日期 yyyy-MM-dd
		export function TODAY() {
			// return this.FUNAPI.DODAY().toLocaleDateString().replaceAll("/","-")
			return dateFormat(new Date(), "yyyy-MM-dd")
		}
		// 获取当前时间 yyyy-MM-dd hh:mm:ss
		export function NOW() {
			// return this.FUNAPI.NOW().toLocaleDateString().replaceAll("/","-")
			return dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss")
		}
		/** 加减日期年
		 * @param {Object} date 日期
		 * @param {Object} month 加减的年
		 */
     export function EYEAR(date, year) {
			try {
				let myDate = new Date(date)
				let newDate = myDate.setYear(myDate.getFullYear() + year)
				return dateFormat(new Date(newDate), "yyyy-MM-dd")
			} catch (e) {
				//TODO handle the exception
				//console.log(this.i18nt('designer.hint.formulaDateError'), date)
				//console.error(this.i18nt('designer.hint.formulaDateErrorMsg'), e);
			}
		}
		/** 加减日期月份
		 * @param {Object} date 日期
		 * @param {Object} month 加减的月份
		 */
     export function EMONTH(date, month) {
			try {
				let myDate = new Date(date)
				let newDate = myDate.setMonth(myDate.getMonth() + month)
				return dateFormat(new Date(newDate), "yyyy-MM-dd")
			} catch (e) {
				//TODO handle the exception
			//	console.log(this.i18nt('designer.hint.formulaDateError'), date)
			//	console.error(this.i18nt('designer.hint.formulaDateErrorMsg'), e);
			}
		}
		/** 加减日期天数
		 * @param {Object} date
		 * @param {Object} day 加减天数
		 */
		export function EDAY(date, day) {
			try {
				let myDate = new Date(date)
				let newDate = myDate.setDate(myDate.getDate() + day)
				return dateFormat(new Date(newDate), "yyyy-MM-dd")
			} catch (e) {
				//TODO handle the exception
			}
		}

    export class PlaceholderWidget extends WidgetType {
      text; type;  
      constructor(text) {
        super();
        if (text) {
          //type 仅用于区分颜色
          if(text.indexOf("}") > -1){
            //函数
            this.type="func";
          }
          this.text=text.substring(1,text.length-1);
        } 
      }
      eq(other) {
        return this.text == other.text;
      }
      // 此处是我们的渲染方法    
      toDOM() {
        let elt = document.createElement('span'); 
         if (!this.text) return elt;
          elt.className = this.type == "func"?"cm-mywidget":"cm-mywidget2";
          elt.textContent = this.text;
          return elt;
      }
      ignoreEvent() {
        return true;
      }
    }
    
    
    export const placeholderMatcher = new MatchDecorator({    
      regexp:  /(\[\w+\]|\{\w+\(?\})/g,   
     // regexp:/\[\[(\w+\.\w+\(?)\]\]/g, //如何匹配计算符号？
      decoration: (match) =>      
          Decoration.replace({        
              widget: new PlaceholderWidget(match[1])      
          })  
    });
    
    
    export const placeholders = ViewPlugin.fromClass(class {
      placeholders
      constructor(view) {
          this.placeholders = placeholderMatcher.createDeco(view)
      }
      update(update) {
        this.placeholders = placeholderMatcher.updateDeco(update, this.placeholders)
      }
      }, {
        decorations: instance => instance.placeholders,
        provide: plugin => EditorView.atomicRanges.of(view => {
          return view.plugin(plugin)?.placeholders || Decoration.none
        })
    })
    
      // 背景样式  
      export const baseTheme = EditorView.baseTheme({
        ".cm-mywidget": {
            paddingLeft: "6px",
            paddingRight: "6px",
            paddingTop: "3px",
            paddingBottom: "3px",
            marginLeft: "3px",
            marginRight: "3px",
            backgroundColor: "#ffcdcc",
            borderRadius: "4px",
        },
        ".cm-mywidget2":{
          paddingLeft: "6px",
          paddingRight: "6px",
          paddingTop: "3px",
          paddingBottom: "3px",
          marginLeft: "3px",
          marginRight: "3px",
          backgroundColor: "#f8e7a0",
          borderRadius: "4px",
        }
       
    });




			// 获取当前日期 yyyy-MM-dd
		// 	export function TODAY() {
		// 		return this.dateFormat(new Date(), "yyyy-MM-dd")
		// 	}
		// 	// 获取当前时间 yyyy-MM-dd hh:mm:ss
		// 	NOW() {
		// 		return this.dateFormat(new Date(), "yyyy-MM-dd hh:mm:ss")
		// 	},
		// 	/** 加减日期年
		// 	 * @param {Object} date 日期
		// 	 * @param {Object} month 加减的年
		// 	 */
		//  export	EYEAR(date, year) {
		// 		try {
		// 			let myDate = new Date(date)
		// 			let newDate = myDate.setYear(myDate.getFullYear() + year)
		// 			return this.dateFormat(new Date(newDate), "yyyy-MM-dd")
		// 		} catch (e) {
		// 			//TODO handle the exception
		// 			console.log(this.i18nt('designer.hint.formulaDateError'), date)
		// 			console.error(this.i18nt('designer.hint.formulaDateErrorMsg'), e);
		// 		}
		// 	},
		// 	/** 加减日期月份
		// 	 * @param {Object} date 日期
		// 	 * @param {Object} month 加减的月份
		// 	 */
		// 	EMONTH(date, month) {
		// 		try {
		// 			let myDate = new Date(date)
		// 			let newDate = myDate.setMonth(myDate.getMonth() + month)
		// 			return this.dateFormat(new Date(newDate), "yyyy-MM-dd")
		// 		} catch (e) {
		// 			//TODO handle the exception
		// 			console.log(this.i18nt('designer.hint.formulaDateError'), date)
		// 			console.error(this.i18nt('designer.hint.formulaDateErrorMsg'), e);
		// 		}
		// 	},
		// 	/** 加减日期天数 
		// 	 * @param {Object} date
		// 	 * @param {Object} day 加减天数
		// 	 */
		// 	EDAY(date, day) {
		// 		try {
		// 			let myDate = new Date(date)
		// 			let newDate = myDate.setDate(myDate.getDate() + day)
		// 			return this.dateFormat(new Date(newDate), "yyyy-MM-dd")
		// 		} catch (e) {
		// 			//TODO handle the exception
		// 			console.log(this.i18nt('designer.hint.formulaDateError'), date)
		// 			console.error(this.i18nt('designer.hint.formulaDateErrorMsg'), e);
		// 		}
		// 	},

			//--------------------- 以上为公式计算的API方法 end ------------------//
//==============计算公式 end==============  