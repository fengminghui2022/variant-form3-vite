<template>
  <div>
    <el-form-item
            :label="i18nt('designer.setting.formula')"
            v-if="optionModel.enableFormula">
    </el-form-item>
    <el-form-item label-width="0" v-if="optionModel.enableFormula">
      <el-tooltip
              :content="optionModel.formulaShow || '暂无'"
              placement="top">
        <el-input v-model="formulaForView" readonly>
          <template #append>
            <el-button
                    @click="editFormula"
                    icon="el-icon-edit"></el-button>
          </template>
        </el-input>
      </el-tooltip>
    </el-form-item>
    <el-dialog
            v-model="formulaDialogVisible"
            :title="i18nt('designer.hint.formulaSetting')"
            class="small-padding-dialog"
            draggable
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            :destroy-on-close="true"
            :append-to-body="false"
            width="70%"
            ref="colFormulaDialog">
      <el-row>
        <el-col :span="24">
          <div class="editor">
            <div class="editor-top">
              <el-row>
                <el-col :span="22">
                  <div style="font-weight: bold">
                    {{this.optionModel.label}} =
                  </div>
                </el-col>
                <!-- el-tag 模式 按钮 end -->
                <el-col :span="2">
                  <el-button
                          size="small"
                          @click="clearFormula"
                          type="danger"
                          plain>
                    {{i18nt("designer.hint.formulaClear")}}
                  </el-button>
                </el-col>
              </el-row>
              <div ref="cmRef" style="height:110px;width:100%"></div>
            </div>
            <!-- -->
            <div class="editor-bottom">
              <el-button
                      v-on:click="insertSymbol(item)"
                      size="default"
                      v-for="(item, idx) in operate"
                      :key="idx">
                {{item}}
              </el-button>
            </div>
            <!-- -->
          </div>
        </el-col>
      </el-row>
      <el-row style="margin: 10px">
        <el-col :span="6">
          <div class="group-item-left">
            <div class="item-header">
              {{ i18nt("designer.hint.formulaWidgetList") }}
            </div>
            <el-input
                    :placeholder="i18nt('designer.hint.formulaSearch')"
                    v-model="filterText"
                    clearable></el-input>
            <div class="item-body-left">
              <el-tree
                      ref="fieldTree"
                      :data="fieldTreeData"
                      :filter-node-method="filterNode"
                      @node-click="insertField">
                <template #default="{ node, data }">
                                    <span class="custom-tree-node">
                                        <el-tooltip
                                                effect="dark"
                                                :content="node.label"
                                                placement="right">
                                            <span>{{ node.label }}</span>
                                        </el-tooltip>
                                    </span>
                </template>
              </el-tree>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <el-row>
            <el-col :span="24">
              <div class="group-item-right-top">
                <div class="item-header">
                  {{
                    i18nt(
                        "designer.hint.formulaFunctionList"
                    )
                  }}
                </div>
                <div class="function-list">
                  <el-collapse>
                    <el-collapse-item
                            v-for="(item, index) in formulas"
                            :key="index"
                            :title="i18nt(item.fClass)"
                            :name="index">
                      <div
                              v-for="(info, i) in item.flist"
                              :key="i"
                              class="field-item"
                              @click="insertFunction(info.fName + '(')"
                              @mouseenter="showIntro(i18nt(info.fName), i18nt(item.fClass), i18nt(info.fIntro))"
                              v-on:mouseleave="resetIntro">
                        <span>{{ info.fName }}</span>
                        <el-tag
                                :type="getClass(info.fType)"
                        >{{ i18nt(info.fType) }}
                        </el-tag
                        >
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="12">
          <div class="group-item-right-bottom">
            <div class="item-header">{{ introTitle }}</div>
            <div class="item-body-right-bottom">
              <ul>
                <li
                        v-if="introduction.title !== ''"
                        style="font-size: 16px; color: #0a5d7c">
                  {{ introduction.title }}
                </li>
                <li>
                  <div
                          class="intro-content"
                          v-html="introduction.content"></div>
                </li>
              </ul>
            </div>
          </div>
        </el-col>
      </el-row>
      <template #footer>
        <div class="dialog-footer">
          <el-button size="default" type="primary" @click="saveFormula">{{
              i18nt("designer.hint.confirm")
            }}
          </el-button>
          <el-button size="default" @click="formulaDialogVisible = false">{{
              i18nt("designer.hint.cancel")
            }}
          </el-button>
        </div>
      </template>

    </el-dialog>
  </div>
</template>

<script>
import {basicSetup, EditorView} from "codemirror"
import {javascript} from "@codemirror/lang-javascript"
import {EditorState} from "@codemirror/state";
import i18n from "@/utils/i18n";
import {
  deepClone,
  getAllContainerWidgets,
  getAllFieldWidgets,
  getFieldWidgetById,
  traverseFieldWidgetsOfContainer
} from "@/utils/util";
import {placeholders, baseTheme, formulas} from "@/utils/formula-util";

export default {
  name: "formula-editor",
  mixins: [i18n],
  components: {},
  props: {
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
  },
  computed: {
    formulaForView() {
      const regExp = /\{\{(\w+\.[\[\u4e00-\u9fa5_a-zA-Z0-9\]]+\.\w+)}}/g
      const matchResult = this.optionModel.formula.match(regExp)
      if (!matchResult) {
        return this.optionModel.formula
      }

      let resultFormula = this.optionModel.formula
      matchResult.forEach(mi => {
        const secondPart = mi.split('.')[1]
        resultFormula = resultFormula.replaceAll(mi, secondPart)
      })

      return resultFormula
    },
  },
  watch: {
    filterText(val) {
      this.$refs.fieldTree.filter(val);
    },
  },
  data() {
    return {
      codeMirror: null,
      formula: "",
      tags: [], // 公式页签集合
      fieldTreeData: [], // 设计器字段树
      filterText: "",
      formulaDialogVisible: false,
      operate: [
        "+",
        "-",
        "*",
        "/",
        "!=",
        "==",
        "<",
        ">",
        "<=",
        ">=",
        "(",
        ")",
        ",",
      ],
      insertNum: 0,
      insertStr: "",
      activeNames: ["1"],
      widgetSizes: [
        {
          label: this.i18nt("designer.hint.formulaSizeLarge"),
          value: "large",
        },
        {
          label: this.i18nt("designer.hint.formulaSizeMedium"),
          value: "default",
        },
        {
          label: this.i18nt("designer.hint.formulaSizeSmall"),
          value: "small",
        },
        {
          label: this.i18nt("designer.hint.formulaSizeMini"),
          value: "small",
        },
      ],
      introTitle: this.i18nt("designer.hint.formulaFunctionExplain"),
      introduction: {
        title: this.i18nt("designer.hint.formulaPleaseSelect"),
        content:
            '<span class="cg">' +
            this.i18nt("designer.hint.formulaSample") +
            '：</span><span class="fname">SUM</span><span class="cg">(</span><span class="cs">' +
            this.i18nt("designer.hint.formulaPara") +
            '1</span><span class="cg">,</span><span class="cs">' +
            this.i18nt("designer.hint.formulaPara") +
            '2</span><span class="cg">)</span>',
      },
      formulas: formulas
    };
  },
  mounted() {
  },
  methods: {
    clearFormula(event) {
      this.formula = ""; //CodeMirror 模式
      this.tags = []; //el-tag模式
      this.codeMirror.dispatch({changes: {from: 0, to: this.codeMirror.state.doc.length, insert: ""}})
    },

    /** 删除字符串str中的第n个subStr
     * @param {Object} str
     * @param {Object} subStr
     * @param {Object} n
     */
    deleteChar(str, subStr, n) {
      let num = -1;
      return str.replace(/a/g, (item) => {
        num++;
        return num === n ? "" : item;
      });
    },

    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },

    loadFieldListToTree() {
      this.fieldTreeData.length = 0 //先清空

      const allFields = getAllFieldWidgets(this.designer.widgetList);
      const allContainers = getAllContainerWidgets(this.designer.widgetList)

      const subFormArray = []
      let sfFieldArray = []
      const subFormFieldMap = {}

      //获取子表单容器内部的字段
      allContainers.forEach(con => {
        if ((con.type === 'sub-form') || (con.type === 'grid-sub-form')) {
          subFormArray.push(con.container)

          const tmpFieldArray = []
          const fwHandler = (fw) => {
            if (!!fw.formItemFlag) {
              tmpFieldArray.push(fw)
            }
          }
          traverseFieldWidgetsOfContainer(con.container, fwHandler)
          subFormFieldMap[con.container.options.name] = tmpFieldArray
          sfFieldArray = sfFieldArray.concat(tmpFieldArray)
        }
      })

      //加载到树形组件数据对象
      allFields.forEach(fld => {
        if (!sfFieldArray.find(item => item.id === fld.field.id)) {  //排除子表单字段
          const fieldNode = {
            id: fld.field.id,
            name: fld.field.options.name,
            label: fld.field.options.label,
            type: fld.field.type,
            formItemFlag: true
          }
          this.fieldTreeData.push(fieldNode)
        }
      })

      subFormArray.forEach(sf => {
        const subFormNode = {
          id: sf.id,
          name: sf.options.name,
          label:sf.options.name || sf.type,
          type: sf.type,
          formItemFlag: false,
          children: []
        }

        subFormFieldMap[sf.options.name].forEach(fld => {
          const fieldNode = {
            id: fld.id,
            name: fld.options.name,
            label: fld.options.label,
            type: fld.type,
            formItemFlag: true
          }
          subFormNode.children.push(fieldNode)
        })

        this.fieldTreeData.push(subFormNode)
      })
    },

    // // 插入字段
    // insertField(obj, node, self) {
    //   if (!!obj.formItemFlag) {
    //     let fieldTitle = "";
    //     let fieldName = "";
    //     let parentType = node.parent.data.type;
    //     // 判断若为子表单字段用[]包裹，主表单字段用{}包裹
    //     if (parentType === "sub-form") {
    //       fieldTitle =
    //           "[" +
    //           node.parent.data.label +
    //           "." +
    //           obj.label +
    //           "]";
    //       fieldName =
    //           "[" + node.parent.data.id + "." + obj.id + "]";
    //     } else if (parentType === "grid") {
    //       fieldTitle =
    //           "[" +
    //           node.parent.parent.parent.data.label +
    //           "." +
    //           obj.label +
    //           "]";
    //       fieldName =
    //           "[" +
    //           node.parent.parent.parent.data.id +
    //           "." +
    //           obj.id +
    //           "]";
    //     } else {
    //       //fieldTitle = '[' + obj.label + ']'
    //       //fieldName = '{' + obj.id + '}'
    //       fieldName = obj.id;
    //       fieldTitle = obj.label;
    //     }
    //     this.tags.push({
    //       name: fieldTitle,
    //       value: fieldName,
    //       paraType: "Field",
    //       type: "",
    //     });
    //
    //     //CodeMirror 模式
    //     //this.formula += fieldName;
    //     this.updateCodeMirror(fieldName, fieldTitle, "field");
    //   }
    // },

    // 插入字段
    insertField(obj, node, self) {
      if (!!obj.formItemFlag) {
        let fieldLabel = "";
        let fieldId = "";
        let parentType = node.parent.data.type;
        // 判断若为子表单字段用[]包裹，主表单字段用{}包裹
        if (parentType === "sub-form") {
          // fieldLabel = "[" + node.parent.data.label + "." + obj.label + "]";
          // fieldId = "[" + node.parent.data.id + "." + obj.id + "]";

          fieldId = obj.id
          //fieldLabel = obj.label
          fieldLabel = '[' + obj.label + ']'
        } else {
          //fieldTitle = '[' + obj.label + ']'
          //fieldName = '{' + obj.id + '}'

          fieldId = obj.id
          //fieldLabel = obj.label
          fieldLabel = '[' + obj.label + ']'
        }
        this.tags.push({
          name: fieldLabel,
          value: fieldId,
          paraType: "Field",
          type: "",
        });

        //CodeMirror 模式
        //this.formula += fieldName;
        this.updateCodeMirror(fieldId, fieldLabel, "field");
      }
    },

    // 插入符号
    insertSymbol(opt) {
      let tagType = "";
      if (opt === "," || opt === "(" || opt === ")") {
        tagType = "warning";
      } else {
        tagType = "success";
      }
      this.tags.push({
        name: opt,
        value: opt,
        paraType: "Symbol",
        type: tagType,
      });

      //CodeMirror 模式
      //this.formula += opt;
      // console.log(this.$refs.mirCode)
      this.updateCodeMirror(opt, opt, null);
    },

    // 插入函数
    insertFunction(opt) {
      this.tags.push({
        name: opt,
        value: opt,
        paraType: "Function",
        type: "warning",
      });

      //CodeMirror 模式
      //this.formula += opt;
      const val = opt.substring(0, opt.length - 1);
      this.updateCodeMirror(val, val, "func");
    },

    updateCodeMirror(field, text, type = null) {
      if (type) {
        let obj = {
          field: field,
          text: text,
          type: type
        }
        let selectionLet = obj.field.length + obj.text.length + obj.type.length;//光标位置；
        let code = `{{${obj.field}.${obj.text}.${obj.type}}}`;
        if (type === "func") {
          code += "()";
          selectionLet = selectionLet + 7
        } else {
          selectionLet = selectionLet + 6;
        }

        if (code) {
          this.codeMirror.dispatch({
            changes: {
              from: this.codeMirror.state.selection.main.head,
              to: this.codeMirror.state.selection.main.head,
              insert: code
            },
            selection: {anchor: this.codeMirror.state.selection.main.head + selectionLet},
          });
        }
      } else {
        this.codeMirror.dispatch({
          changes: {
            from: this.codeMirror.state.selection.main.head, to: this.codeMirror.state.selection.main.head, insert: text
          },
          selection: {anchor: this.codeMirror.state.selection.main.head + text.length}
        });

      }
    },

    // 在字符串中查找[开始]结尾的字符串，并删除
    removeStr(str) {
      let a = str.indexOf("[");
      if (a === -1) {
        return str;
      }
      let b = str.indexOf("]", a) + 1;
      let c = str.substring(a, b);
      let strArr = str.split(c);
      let newStr = "";
      for (let i = 0; i < strArr.length; i++) {
        newStr += strArr[i];
      }
      return this.removeStr(newStr);
    },

    /**
     * 字段label可能在公式保存后再次被修改，当编辑公式时需要再次刷新公式中的字段label（不刷新也不会影响公式计算结果）
     */
    refreshFormula() {
      const regExp = /\{\{(\w+\.[\[\u4e00-\u9fa5_a-zA-Z0-9\]]+\.\w+)}}/g
      const matchResult = this.optionModel.formula.match(regExp)
      if (!matchResult) {
        return this.optionModel.formula
      }

      matchResult.forEach(mi => {
        const firstPart = mi.split('.')[0]
        const thirdPart = mi.split('.')[2]
        const fieldId = firstPart.substring(2, firstPart.length)
        const fieldSchema = getFieldWidgetById(this.designer.widgetList, fieldId, false)
        const newLabel = fieldSchema.options.label || fieldSchema.options.name
        this.optionModel.formula = this.optionModel.formula.replaceAll(mi,
            '{{' + firstPart + '.[' + newLabel + '].' + thirdPart + "}}")
      })
    },

    // 打开编辑公式弹窗
    editFormula() {
      this.fieldTreeData.length = 0
      // 初始化字段树
      this.designer.widgetList.forEach((wItem) => {
        if (this.optionModel.name !== wItem.id) {
          //this.buildTreeNodeOfWidget(wItem, this.fieldTreeData);
          this.loadFieldListToTree()
        }
      })

      console.log("设计器字段===>", this.fieldTreeData)

      // 加载当前字段计算公式tags
      this.tags = deepClone(this.optionModel.formulaTags)
      // this.formula = deepClone(this.optionModel.formula);

      //const code = this.optionModel.formulaShow;
      this.refreshFormula()
      const code = this.optionModel.formula
      this.formulaDialogVisible = true

      //==== codeMirror 挂载视图 ====
      this.$nextTick(() => {
        this.codeMirror = new EditorView({
          state: EditorState.create({
            doc: code,
            extensions: [basicSetup, javascript(),
              [baseTheme, [], placeholders]],
          }),
          parent: this.$refs.cmRef
        });
        console.log("编辑器实例==>", this.codeMirror)
      })
    },

    // 保存计算公式-展示和计算公式-计算
    saveFormula() {
      this.optionModel.formula = "";
      this.optionModel.formulaShow = "";

      this.optionModel.formula = this.codeMirror.state.doc.text.join("\r\n");
      this.optionModel.formulaShow = this.optionModel.formula;
      let re = /\{\{(\w+\.[\u4e00-\u9fa5_a-zA-Z0-9]+\.\w+)}}/g;
      let array = [];
      let temp;
      //提取大括号内数据
      while (temp = re.exec(this.optionModel.formula)) {
        array.push(temp[0].match(/{{([^}]*)}}/)[1]);
      }
      array.forEach(item => {
        const strs = item.split(".");
        //字段需要加大括号 否则计算时会报错
        const val = strs[2] === "field" ? `{${strs[0]}}` : strs[0];
        this.optionModel.formula = this.optionModel.formula.replace("{{" + item + "}}", val);
      })

      console.log("表达式===>", this.optionModel.formula);

      //CodeMirror 模式
      //  this.optionModel.formulaShow = this.formula;
      // this.optionModel.formula = this.formula;
      ////CodeMirror 模式 end
      //===el-tag模式====
      // for (let i = 0; i < this.tags.length; i++) {
      //     this.optionModel.formulaShow =
      //         this.optionModel.formulaShow + this.tags[i].name;
      //     this.optionModel.formula =
      //         this.optionModel.formula + this.tags[i].value;
      // }
      //===el-tag模式 end====


      //  if (!this.isValid(this.optionModel.formula)) {
      //    this.$message.error("函数缺失右括号)");
      //     return false;
      //  }
      // this.optionModel.formulaTags = this.tags;
      this.formulaDialogVisible = false;
    },

    // 解析计算公式 STEP1：将公式中的字段转换为【英文表名.英文字段名】
    analysisFormula(formula) {
      let a = formula.indexOf("[");
      if (a === -1) {
        return formula;
      }
      let b = formula.indexOf("]", a) + 1;
      let cnField = formula.substring(a, b);
      let enFieldName = this.findTreeNodeByCnName(cnField);
      if (!!enFieldName) {
        formula = formula.replace(cnField, "{" + enFieldName + "}");
        return this.analysisFormula(formula);
      } else {
        this.$message.error(cnField + " 字段无法识别");
        return false;
      }
    },

    // 根据树节点中文名查找树节点
    findTreeNodeByCnName(nodeCnName) {
      let enTableName = "",
          enFieldName = "";
      let tableFieldName = nodeCnName.split("[")[1].split("]")[0];
      let tableName = tableFieldName.split("-")[0];
      let fieldName = tableFieldName.split("-")[1];
      let moduleList = this.fieldTreeData;
      for (let i = 0; i < moduleList.length; i++) {
        let tableList = moduleList[i].children;
        for (let j = 0; j < tableList.length; j++) {
          if (tableList[j].cnTitle === tableName) {
            enTableName = tableList[j].enTitle;
            let fieldList = tableList[j].children;
            for (let k = 0; k < fieldList.length; k++) {
              if (fieldList[k].cnTitle === fieldName) {
                enFieldName = fieldList[k].enTitle;
                return enTableName + "-" + enFieldName;
              }
            }
          }
        }
      }
      // 没找到节点返回NULL
      return null;
    },

    getClass(type) {
      if (type === this.i18nt("designer.hint.formulaNumber")) {
        return "warning";
      }
      if (type === this.i18nt("designer.hint.formulaChar")) {
        return "";
      }
      if (type === this.i18nt("designer.hint.formulaObject")) {
        return "danger";
      }
    },

    resetIntro() {
      this.introTitle = this.i18nt(
          "designer.hint.formulaFunctionExplain"
      );
      this.introduction = {
        title: this.i18nt("designer.hint.formulaPleaseSelect"),
        content:
            '<span class="cg">' +
            this.i18nt("designer.hint.formulaSample") +
            '：</span><span class="fname">SUM</span><span class="cg">(</span><span class="cs">参数1</span><span class="cg">,</span><span class="cs">参数2</span><span class="cg">)</span>',
      };
    },

    showIntro(name, title, content) {
      content = '<span class="cg">' + content + "</span>";
      this.introduction = {
        title: title,
        content: content,
      };
      this.introTitle = name;
    },

    /**
     * 校验计算公式是否正确
     * @param s
     * @returns {boolean}
     */
    isValid(s) {
      let a = []; //存储左括号出现的地方
      let l = s.length;
      let k = 0;
      let flag = 1;
      let j;
      for (let i = 0; i < l && flag; i++) {
        switch (s[i]) {
          case "(":
            a[k] = i;
            k++;
            break;
          case ")":
            j = a[k - 1];
            if (s[j] === "(") {
              a[k] = 0;
              k--;
            } else {
              flag = 0;
            }
            break;
          case "{":
            a[k] = i;
            k++;
            break;
          case "}":
            j = a[k - 1];
            if (s[j] === "{") {
              a[k] = 0;
              k--;
            } else {
              flag = 0;
            }
            break;
          case "[":
            a[k] = i;
            k++;
            break;
          case "]":
            j = a[k - 1];
            if (s[j] === "[") {
              a[k] = 0;
              k--;
            } else {
              flag = 0;
            }
            break;
        }
      }
      if (k !== 0) {
        flag = 0;
      }
      return flag !== 0;
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.cm-editor) {
  height: 100%;
}

li {
  list-style: none;
}

/*去掉li前面的点*/
.el-input-group {
  cursor: pointer;
}

.header {
  width: 97%;
  border: 1px solid #ccc;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  height: 31px;
  line-height: 31px;
  padding-left: 15px;
}

.editor {
  margin-left: 10px;
  margin-right: 10px;
  height: 200px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.editor-top {
  //margin-left: 10px;
  height: 130px;
  width: 100%;
  padding: 8px;
  position: relative;
  overflow-x: hidden;
  overflow-y: scroll;
}

.editor-bottom {
  border-left: 1px solid #ccc;
  display: flex;
  flex-wrap: wrap;
  padding: 5px;
  align-content: flex-start;
}

.body-right-button {
  width: 60px;
  height: 40px;
}

.group-form {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
  height: 400px;
}

.group-item-left {
  height: 400px;
  border: 1px solid #ccc;
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
  margin-bottom: 5px;
  padding: 0;
  width: 100%;
}

.group-item-right-top {
  height: 400px;
  border: 1px solid #ccc;
  border-radius: 0;
  margin-bottom: 5px;
  width: 100%;
}

.group-item-right-bottom {
  height: 400px;
  border: 1px solid #ccc;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  margin-bottom: 5px;
  width: 100%;
}

.item-header {
  border-bottom: 1px solid #ccc;
  height: 29px;
  line-height: 29px;
  padding-left: 15px;
  font-weight: bold;
}

.item-body-left {
  height: 320px;
  overflow-y: auto;
}

.function-list {
  height: 360px;
  overflow-y: auto;

  :deep(.el-collapse-item__header) {
    font-weight: normal !important;
  }
}

.item-body-right-bottom {
  height: 152px;
  overflow-y: auto;
}

.el-collapse {
  border: none;
}

:deep(.el-dialog) {
  margin-top: 10px !important;
}

:deep(.el-collapse-item__header) {
  padding-left: 10px;
  border: none;
}

:deep(.el-collapse-item__wrap) {
  border: none;
}

:deep(.el-collapse-item__arrow) {
  margin-left: 8px;
}

.field-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px;
  padding-left: 30px;
  padding-right: 15px;
  cursor: pointer;
}

.field-item:hover {
  background-color: #f8f8f8;
}

p::before {
  content: "●  ";
  color: #0a5d7c;
}

p {
  height: 24px;
  line-height: 24px;
  padding: 0 15px;
  font-size: 16px;
  color: #0a5d7c;
}

.intro-content {
  padding-left: 30px;
}

.cg {
  color: #0a5d7c;
}

.fname {
  display: inline-block;
  border-radius: 2px;
  padding: 0 5px;
  margin: 1px;
  font-size: 12px;
  line-height: 20px;
  color: #708;
  background: #fff;
}

.cs {
  display: inline-block;
  border-radius: 2px;
  padding: 0 5px;
  margin: 1px;
  color: #fff;
  font-size: 12px;
  line-height: 20px;
  background: #178cdf;
}

:deep(.el-dialog__body) {
  padding: 0;
}

.small-padding-dialog {
  /* margin-top: 0px; */
}
</style>
