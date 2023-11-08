// 计算公式相关工具方法
import {evalFn, getFieldWidgetById} from "@/utils/util";
import * as formulajs from '@formulajs/formulajs'
import {EditorView} from "codemirror"
import {MatchDecorator,Decoration,ViewPlugin,WidgetType} from "@codemirror/view"
import {translate} from "@/utils/i18n";

class PlaceholderWidget extends WidgetType {
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

export const FORMULA_REG_EXP = /\{\{(\w+\.[^.]+\.\w+)}}/g

const placeholderMatcher = new MatchDecorator({
  regexp: /\{\{(.+?)}}/g,
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

export function calculateFormula(VFR, DSV, formulaJs, formulaFieldRef, changedFieldRef) {
  if (!!formulaFieldRef.subFormItemFlag && !!changedFieldRef.subFormItemFlag) {
    /* 子表单字段变化，只能触发子表单同一行字段的计算公式重新计算！！ */
    if (changedFieldRef.subFormRowId !== formulaFieldRef.subFormRowId) {
      return
    }
  }

  let formula = formulaFieldRef.field.options.formula
  formula = replaceFieldsAndFunctionsOfFormula(VFR, formulaFieldRef, changedFieldRef)  //替换字段值

  //替换formula-js函数
  const matchResult = formula.match(/[A-Za-z]*/g)
  if (!!matchResult) {
    matchResult.forEach(mi => {
      if (!!mi && (findCalFunStartIndex(mi) !== -1)) {
        const funcName = mi.toUpperCase()
        formula = formula.replace(mi, 'formulaJs.' + funcName)
      }
    })
  }

  const formulaValue = evalFn(formula, DSV, VFR, formulaJs)
  formulaFieldRef.setValue(formulaValue)
}

/**
 * 判断字段是否用在计算公式中
 * @param fieldName
 * @param formula
 * @param VFR
 */
export function fieldIsUsedInFormula(fieldName, formula, VFR) {
  const matchResult = formula.match(FORMULA_REG_EXP)
  if (!matchResult) {
    return false
  }

  //debugger

  let foundResult = false
  matchResult.forEach(mi => {
    const thirdPart = mi.split('.')[2]
    const nodeType = thirdPart.substring(0, thirdPart.length -2)
    if (nodeType === 'func') {
      return
    }

    const firstPart = mi.split('.')[0]
    const fieldId = firstPart.substring(2, firstPart.length)
    const fieldSchema = getFieldWidgetById(VFR.formJsonObj.widgetList, fieldId, false)
    if (fieldSchema.options.name === fieldName) {
      foundResult = true
    }
  })

  return foundResult
}

/**
 * 替换计算公式中的字段值
 * @param VFR
 * @param formulaFieldRef
 * @param changedFieldRef
 * @returns {*}
 */
export function replaceFieldsAndFunctionsOfFormula(VFR, formulaFieldRef, changedFieldRef) {
  let formula = formulaFieldRef.field.options.formula
  const matchResult = formula.match(FORMULA_REG_EXP)
  if (!matchResult) {
    return formula
  }

  let resultFormula = formula
  matchResult.forEach(mi => {
    const thirdPart = mi.split('.')[2]
    const nodeType = thirdPart.substring(0, thirdPart.length -2)
    if (nodeType === 'func') {
      const funcName = mi.split('.')[1]
      resultFormula = resultFormula.replace(mi, funcName)
      return
    }

    const firstPart = mi.split('.')[0]
    const fieldId = firstPart.substring(2, firstPart.length)
    const fieldSchema = getFieldWidgetById(VFR.formJsonObj.widgetList, fieldId, false)
    if (!!fieldSchema) {
      let fieldRef = VFR.getWidgetRef(fieldSchema.options.name)
      if (!!fieldRef) {
        //是否要考虑字符串值的替换？？
        resultFormula = resultFormula.replace(mi, fieldRef.getValue())
      } else {  //getWidgetRef找不到，则可能是子表单字段
        if (!!changedFieldRef.subFormItemFlag) {
          if (!formulaFieldRef.subFormItemFlag) {  //
            /* 在主表单字段的计算公式中使用子表单字段，应将子表单所有记录同字段的值代入！！ */
            const subFormValue = VFR.formDataModel[changedFieldRef.subFormName]
            let allSubFieldValues = ''
            const subFieldName = fieldSchema.options.name
            subFormValue.forEach((vi, idx) => {
              allSubFieldValues = (idx === 0) ? vi[subFieldName] : allSubFieldValues + ', ' + vi[subFieldName]
            })
            resultFormula = resultFormula.replaceAll(mi, allSubFieldValues)
          } else {
            let subFormRowId = changedFieldRef.subFormRowId
            fieldRef = VFR.getWidgetRef(fieldSchema.options.name + '@row' + subFormRowId)
            if (!!fieldRef) {
              resultFormula = resultFormula.replaceAll(mi, fieldRef.getValue())
            }
          }
        }
      }
    }
  })

  return resultFormula
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
  // {
  //   fClass: "designer.hint.formulaFunctionLogic",
  //   flist: [
  //     {
  //       fName: "AND",
  //       fType: "designer.hint.formulaObject",
  //       fIntro: "designer.hint.formulaAND",
  //     },
  //     {
  //       fName: "IF",
  //       fType: "designer.hint.formulaObject",
  //       fIntro: "designer.hint.formulaIF",
  //     },
  //     {
  //       fName: "IFS",
  //       fType: "designer.hint.formulaObject",
  //       fIntro: "designer.hint.formulaIFS",
  //     },
  //     {
  //       fName: "IFERROR",
  //       fType: "designer.hint.formulaObject",
  //       fIntro: "designer.hint.formulaIFERROR",
  //     },
  //     {
  //       fName: "IFNA",
  //       fType: "designer.hint.formulaObject",
  //       fIntro: "designer.hint.formulaIFNA",
  //     },
  //     {
  //       fName: "NOT",
  //       fType: "designer.hint.formulaObject",
  //       fIntro: "designer.hint.formulaNOT",
  //     },
  //     {
  //       fName: "OR",
  //       fType: "designer.hint.formulaObject",
  //       fIntro: "designer.hint.formulaOR",
  //     },
  //     {
  //       fName: "SWITCH",
  //       fType: "designer.hint.formulaObject",
  //       fIntro: "designer.hint.formulaSWITCH",
  //     },
  //     {
  //       fName: "XOR",
  //       fType: "designer.hint.formulaObject",
  //       fIntro: "designer.hint.formulaXOR",
  //     },
  //   ],
  // },
  // {
  //   fClass: "designer.hint.formulaFunctionTime",
  //   flist: [
  //     {
  //       fName: "YEAR",
  //       fType: "designer.hint.formulaDate",
  //       fIntro: "designer.hint.formulaYEAR",
  //     },
  //     {
  //       fName: "MONTH",
  //       fType: "designer.hint.formulaDate",
  //       fIntro: "designer.hint.formulaMONTH",
  //     },
  //     {
  //       fName: "DAY",
  //       fType: "designer.hint.formulaDate",
  //       fIntro: "designer.hint.formulaDAY",
  //     },
  //     {
  //       fName: "TODAY",
  //       fType: "designer.hint.formulaDate",
  //       fIntro: "designer.hint.formulaTODAY",
  //     },
  //     {
  //       fName: "NOW",
  //       fType: "designer.hint.formulaDate",
  //       fIntro: "designer.hint.formulaNOW",
  //     },
  //     {
  //       fName: "EMONTH",
  //       fType: "designer.hint.formulaDate",
  //       fIntro: "designer.hint.formulaEMONTH",
  //     },
  //     {
  //       fName: "EDAY",
  //       fType: "designer.hint.formulaDate",
  //       fIntro: "designer.hint.formulaEDAY",
  //     },
  //   ],
  // },
  // {
  //   fClass: "designer.hint.formulaFunctionString",
  //   flist: [
  //     {
  //       fName: "FIND",
  //       fType: "designer.hint.formulaChar",
  //       fIntro: "designer.hint.formulaFIND",
  //     },
  //     {
  //       fName: "LEFT",
  //       fType: "designer.hint.formulaChar",
  //       fIntro: "designer.hint.formulaLEFT",
  //     },
  //     {
  //       fName: "RIGHT",
  //       fType: "designer.hint.formulaChar",
  //       fIntro: "designer.hint.formulaRIGHT",
  //     },
  //     {
  //       fName: "LEN",
  //       fType: "designer.hint.formulaChar",
  //       fIntro: "designer.hint.formulaLEN",
  //     },
  //     {
  //       fName: "LOWER",
  //       fType: "designer.hint.formulaChar",
  //       fIntro: "designer.hint.formulaLOWER",
  //     },
  //     {
  //       fName: "UPPER",
  //       fType: "designer.hint.formulaChar",
  //       fIntro: "designer.hint.formulaUPPER",
  //     },
  //     {
  //       fName: "MID",
  //       fType: "designer.hint.formulaChar",
  //       fIntro: "designer.hint.formulaMID",
  //     },
  //     {
  //       fName: "TRIM",
  //       fType: "designer.hint.formulaChar",
  //       fIntro: "designer.hint.formulaTRIM",
  //     },
  //   ],
  // },
];
