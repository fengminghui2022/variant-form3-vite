// 计算公式相关工具方法
import {evalFn} from "@/utils/util";
import * as formulajs from '@formulajs/formulajs'
import {EditorView} from "codemirror"
import {MatchDecorator,Decoration,ViewPlugin,WidgetType} from "@codemirror/view"

// 计算公式全局字段组件汇总和计算
export function handlerFormulaCal(VFR, DSV, val = VFR.formDataModel) {
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
        VFR.formula = getFormula(VFR, formula)
        // 加入计算公式中的函数计算
        if (!!VFR.formula) {
          try {

            // 查找计算公式中的函数，统一转为大写，并改为this.FUNAPI.函数名
            let arr = VFR.formula.match(/[A-Za-z]*/g)
            for (let i = 0; i < arr.length; i++) {
              // 判断函数不为空，且在预置函数穷举列表中
              if (!!arr[i] && findCalFunStartIndex(arr[i]) !== -1) {
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
              //  fieldWidget.setValue(this.formula)
              // } else {
              //      fieldWidget.setValue(eval(this.formula));
              // }
              try {
                let f = new Function("return " + VFR.formula);

                fieldWidget.setValue(f.call(VFR));
                //fieldWidget.setValue(evalFn(VFR.formula,DSV,VFR));
              } catch (e) {
                //运算报错
                console.error("运算报错==>", e);
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
 * @param {Object} VFR 表单渲染器
 * @param {Object} formula 计算公式
 */
export function getFormula(VFR, formula) {
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
    if (fieldStart !== -1) {
      let fieldEnd = formula.indexOf("}", fieldStart) + 1;
      // 抓取字段组件名，带大括号
      fieldHandle = formula.substring(fieldStart, fieldEnd);
      // 获取字段组件名去大括号
      let widgetID = fieldHandle.split("{")[1].split("}")[0]
      // 获取组件值
      value = VFR.getWidgetRef(widgetID).getValue();

      //此处需判断函数类型，否则使用字符串函数时会报错。
      /*value = getWidgetValue(VFR, formula, widgetID);*/
    }
    // 字表字段取值
    if (subFieldStart !== -1) {
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
  return getFormula(VFR, formula);
}

/**
 * 获取字段值
 */
function getWidgetValue(VFR, formula, widgetName) {
  const sIndex = formula.indexOf("(");
  const func = formula.substring(0, sIndex);

  const funcType = formulas.find(item => {
    if (item.flist.some(fItem => {
      return fItem.fName === func
    })) {
      return item;
    }
  });
  if (translate(funcType.fClass) === "数学类型") {
    return Number(VFR.getWidgetRef(widgetName).getValue());
  } else {
    return VFR.getWidgetRef(widgetName).getValue() + '';
  }
}

/**
 * 公式套用函数计算得出计算结果
 * 若有函数嵌套，则先计算更深层函数结果
 * @param {Object} VFR
 * @param {Object} formula
 */
function functionCal(VFR, formula) {
  let startIndex = findCalFunStartIndex(formula)
  // 若找到函数，则解析函数，否则直接EVAL计算公式
  if (startIndex !== -1) {
    let endIndex = formula.indexOf(")", startIndex) + 1;
    let funStr = formula.substring(startIndex, endIndex);
    let funName = funStr.split("(")[0]
    let funPara = funStr.split("(")[1].split(")")[0]
    if (!Number(funPara) && funPara.indexOf(",") === -1) {
      if (funName === "FALSE") {
        return formulajs.FALSE()
      }
      return functionCal(VFR, funPara + funStr.split(funPara)[1])
    }
    let paraList = funPara.split(",")
    // 如果是计算函数则转为数字型
    for (let i = 0; i < paraList.length; i++) {
      // paraList[i] = Number(eval(paraList[i]))
      try {
        if (paraList[i] === "FALSE") {
          paraList[i] = false;
        }
        paraList[i] = evalFn(paraList[i])
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
    //return eval("\"" + VFR.formula + "\"")
    return evalFn(VFR.formula, VFR)
  }
  return functionCal(VFR, formula)
}

// 查找公式中的函数是否在枚举中
export function hasFun(funName) {
  for (let i = 0; i < FORMULA_JS_FUNCTIONS.length; i++) {
    if (funName === FORMULA_JS_FUNCTIONS[i]) {
      return true
    }
  }
  return false
}

export function findCalFunStartIndex(formula) {
  let startIndex = -1
  for (let i = 0; i < FORMULA_JS_FUNCTIONS.length; i++) {
    let index = formula.indexOf(FORMULA_JS_FUNCTIONS[i])
    if (index !== -1) {
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
export function addMonths(yearMonthDay, monthNum) {
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
    // console.log(this.i18nt('designer.hint.formulaDateError'), date)
    // console.error(this.i18nt('designer.hint.formulaDateErrorMsg'), e);
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
  field;
  text;
  type;

  constructor(text) {
    super();
    if (text) {
      //type 仅用于区分颜色
      const [field, mText, type] = text.split(".");
      this.text = mText;
      this.type = type;
      this.field = field;
    }
  }

  eq(other) {
    return this.text === other.text;
  }

  // 此处是我们的渲染方法
  toDOM() {
    let elt = document.createElement('span');
    if (!this.text) return elt;
    elt.className = this.type === "func" ? "cm-function" : "cm-field";
    elt.textContent = this.text;
    return elt;
  }

  ignoreEvent() {
    return true;
  }
}


export const placeholderMatcher = new MatchDecorator({
  regexp: /\{\{(\w+\.[\u4e00-\u9fa5_a-zA-Z0-9]+\.\w+)}}/g,
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
  ".cm-function": {
    paddingLeft: "6px",
    paddingRight: "6px",
    paddingTop: "3px",
    paddingBottom: "3px",
    marginLeft: "3px",
    marginRight: "3px",
    backgroundColor: "#ffcdcc",
    borderRadius: "4px",
  },
  ".cm-field": {
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

const FORMULA_JS_FUNCTIONS = [
  "INT",
  "SUM",
  "AVERAGE",
  "MAX",
  "MIN",
  "ABS",
  "ROUND",
  "CEILING",
  "LOG",
  "MOD",
  "POWER",
  "AND",
  "IF",
  "IFS",
  "IFERROR",
  "IFNA",
  "NOT",
  "OR",
  "SWITCH",
  "XOR",
  "YEAR",
  "MONTH",
  "DAY",
  "TODAY",
  "NOW",
  "EMONTH",
  "EDAY",
  "FIND",
  "LEFT",
  "RIGHT",
  "LEN",
  "LOWER",
  "UPPER",
  "MID",
  "TRIM",
];

export const formulas = [
  {
    fClass: "designer.hint.formulaFunctionMaths",
    flist: [
      {
        fName: "INT",
        fType: "designer.hint.formulaNumber",
        fIntro: "designer.hint.formulaINT",
      },
      {
        fName: "SUM",
        fType: "designer.hint.formulaNumber",
        fIntro: "designer.hint.formulaSUM",
      },
      {
        fName: "AVERAGE",
        fType: "designer.hint.formulaNumber",
        fIntro: "designer.hint.formulaAVERAGE",
      },
      {
        fName: "MAX",
        fType: "designer.hint.formulaNumber",
        fIntro: "designer.hint.formulaMAX",
      },
      {
        fName: "MIN",
        fType: "designer.hint.formulaNumber",
        fIntro: "designer.hint.formulaMIN",
      },
      {
        fName: "ABS",
        fType: "designer.hint.formulaNumber",
        fIntro: "designer.hint.formulaABS",
      },
      {
        fName: "ROUND",
        fType: "designer.hint.formulaNumber",
        fIntro: "designer.hint.formulaROUND",
      },
      {
        fName: "CEILING",
        fType: "designer.hint.formulaNumber",
        fIntro: "designer.hint.formulaCEILING",
      },
      {
        fName: "LOG",
        fType: "designer.hint.formulaNumber",
        fIntro: "designer.hint.formulaLOG",
      },
      {
        fName: "MOD",
        fType: "designer.hint.formulaNumber",
        fIntro: "designer.hint.formulaMOD",
      },
      {
        fName: "POWER",
        fType: "designer.hint.formulaNumber",
        fIntro: "designer.hint.formulaPOWER",
      },
    ],
  },
  {
    fClass: "designer.hint.formulaFunctionLogic",
    flist: [
      {
        fName: "AND",
        fType: "designer.hint.formulaObject",
        fIntro: "designer.hint.formulaAND",
      },
      {
        fName: "IF",
        fType: "designer.hint.formulaObject",
        fIntro: "designer.hint.formulaIF",
      },
      {
        fName: "IFS",
        fType: "designer.hint.formulaObject",
        fIntro: "designer.hint.formulaIFS",
      },
      {
        fName: "IFERROR",
        fType: "designer.hint.formulaObject",
        fIntro: "designer.hint.formulaIFERROR",
      },
      {
        fName: "IFNA",
        fType: "designer.hint.formulaObject",
        fIntro: "designer.hint.formulaIFNA",
      },
      {
        fName: "NOT",
        fType: "designer.hint.formulaObject",
        fIntro: "designer.hint.formulaNOT",
      },
      {
        fName: "OR",
        fType: "designer.hint.formulaObject",
        fIntro: "designer.hint.formulaOR",
      },
      {
        fName: "SWITCH",
        fType: "designer.hint.formulaObject",
        fIntro: "designer.hint.formulaSWITCH",
      },
      {
        fName: "XOR",
        fType: "designer.hint.formulaObject",
        fIntro: "designer.hint.formulaXOR",
      },
    ],
  },
  {
    fClass: "designer.hint.formulaFunctionTime",
    flist: [
      {
        fName: "YEAR",
        fType: "designer.hint.formulaDate",
        fIntro: "designer.hint.formulaYEAR",
      },
      {
        fName: "MONTH",
        fType: "designer.hint.formulaDate",
        fIntro: "designer.hint.formulaMONTH",
      },
      {
        fName: "DAY",
        fType: "designer.hint.formulaDate",
        fIntro: "designer.hint.formulaDAY",
      },
      {
        fName: "TODAY",
        fType: "designer.hint.formulaDate",
        fIntro: "designer.hint.formulaTODAY",
      },
      {
        fName: "NOW",
        fType: "designer.hint.formulaDate",
        fIntro: "designer.hint.formulaNOW",
      },
      {
        fName: "EMONTH",
        fType: "designer.hint.formulaDate",
        fIntro: "designer.hint.formulaEMONTH",
      },
      {
        fName: "EDAY",
        fType: "designer.hint.formulaDate",
        fIntro: "designer.hint.formulaEDAY",
      },
    ],
  },
  {
    fClass: "designer.hint.formulaFunctionString",
    flist: [
      {
        fName: "FIND",
        fType: "designer.hint.formulaChar",
        fIntro: "designer.hint.formulaFIND",
      },
      {
        fName: "LEFT",
        fType: "designer.hint.formulaChar",
        fIntro: "designer.hint.formulaLEFT",
      },
      {
        fName: "RIGHT",
        fType: "designer.hint.formulaChar",
        fIntro: "designer.hint.formulaRIGHT",
      },
      {
        fName: "LEN",
        fType: "designer.hint.formulaChar",
        fIntro: "designer.hint.formulaLEN",
      },
      {
        fName: "LOWER",
        fType: "designer.hint.formulaChar",
        fIntro: "designer.hint.formulaLOWER",
      },
      {
        fName: "UPPER",
        fType: "designer.hint.formulaChar",
        fIntro: "designer.hint.formulaUPPER",
      },
      {
        fName: "MID",
        fType: "designer.hint.formulaChar",
        fIntro: "designer.hint.formulaMID",
      },
      {
        fName: "TRIM",
        fType: "designer.hint.formulaChar",
        fIntro: "designer.hint.formulaTRIM",
      },
    ],
  },
];
