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
                <el-input v-model="optionModel.formulaShow" readonly>
                    <template #append>
                        <el-button
                            @click="setFormula"
                            icon="el-icon-edit"></el-button>
                    </template>
                </el-input>
            </el-tooltip>
        </el-form-item>
        <el-dialog
            v-model="dialogFormVisible"
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
                    <div class="bodyer">
                        <div style="margin-top: 10px">
                            <el-row>
                                <!-- el-tag 模式 按钮 begin -->
                                <!--<el-col
                                    :xs="11"
                                    :sm="10"
                                    :md="8"
                                    :lg="6"
                                    :xl="4"
                                    style="margin-left: 20px">
                                    <el-form-item
                                        label-width="40px"
                                        label-position="right"
                                        :label="
                                            i18nt('designer.hint.formulaModel')
                                        ">
                                        <el-radio-group
                                            v-model="formulaMode"
                                            @change="formulaModeChange"
                                            size="small">
                                            <el-radio-button label="view">{{
                                                i18nt(
                                                    "designer.hint.formulaModelView"
                                                )
                                            }}</el-radio-button>
                                            <el-radio-button label="edit">{{
                                                i18nt(
                                                    "designer.hint.formulaModelEdit"
                                                )
                                            }}</el-radio-button>
                                        </el-radio-group>
                                    </el-form-item>
                                </el-col>
                               <el-col
                                    :xs="11"
                                    :sm="10"
                                    :md="8"
                                    :lg="6"
                                    :xl="4">
                                    <el-form-item
                                        prop="formulaSize"
                                        label-width="40px"
                                        label-position="right"
                                        :label="
                                            i18nt('designer.hint.formulaSize')
                                        ">
                                        <el-radio-group
                                            v-model="formulaSize"
                                            @change="formulaSizeChange"
                                            size="small">
                                            <el-radio-button
                                                v-for="(
                                                    item, idx
                                                ) in widgetSizes"
                                                :key="idx"
                                                :label="item.value"
                                                >{{
                                                    item.label
                                                }}</el-radio-button
                                            >
                                        </el-radio-group>
                                    </el-form-item>
                                </el-col> -->

                                <!-- el-tag 模式 按钮 end -->
                                <el-col :span="2" style="margin-left: 10px">
                                    <el-button
                                        size="small"
                                        @click="clearTags"
                                        type="danger"
                                        plain
                                        >{{
                                            i18nt("designer.hint.formulaClear")
                                        }}</el-button
                                    >
                                </el-col>
                            </el-row>
                        </div>
                        <div class="body-left">
                            <!-- <el-tag
                                v-for="(tag, index) in tags"
                                :key="index"
                                :closable="tag.closable"
                                :type="tag.type"
                                :size="tag.size"
                                @click="handleClickTag(tag)"
                                @close="handleCloseTag(tag)">
                                {{ tag.name }}
                            </el-tag> -->
                            <el-row>
                                <el-col :span="24">
                                    <div
                                        style="
                                            background: #f5f6f8;
                                            padding-left: 5px;
                                        ">
                                        {{this.optionModel.label}} =
                                    </div>
                                </el-col>
                            </el-row>
                            <!-- <codemirror
                                ref="mirCode"
                                v-model="formula"
                                placeholder="Code gose here..."
                                :style="{ height: '85px', width: '100%' }"
                                :autofocus="true"
                                :readOnlyFlg="false"
                                :lineWrapping="true"
                                :indent-with-tab="true"
                                :tabSize="2"></codemirror> -->
                             <div ref="coderef"  style="height:85px;width:100%"></div>
                        </div>
                        <div class="body-right">
                            <el-button
                                v-on:click="insertSymbol(item)"
                                size="default"
                                v-for="(item, idx) in operate"
                                :key="idx">
                                {{ item }}
                            </el-button>
                            <!-- 采用codemirror 编辑器 可以不需要按钮 -->
                            <!-- <el-popover
                                placement="top"
                                width="400"
                                trigger="click">
                                <el-input-number
                                    v-model="insertNum"
                                    width="200"></el-input-number>
                                <el-button @click="insertNumFun(insertNum)">{{
                                    i18nt("designer.hint.formulaOK")
                                }}</el-button>
                                <el-button
                                    slot="reference"
                                    size="default"
                                    style="margin-left: 10px"
                                    >{{
                                        i18nt("designer.hint.formulaNum")
                                    }}</el-button
                                >
                            </el-popover>
                            <el-popover
                                placement="top"
                                width="400"
                                trigger="click">
                                <el-input v-model="insertStr">
                                    <el-button
                                        slot="append"
                                        @click="insertStrFun(insertStr)"
                                        >{{
                                            i18nt("designer.hint.formulaOK")
                                        }}</el-button
                                    >
                                </el-input>
                                <el-button
                                    slot="reference"
                                    size="default"
                                    style="margin-left: 10px"
                                    >{{
                                        i18nt("designer.hint.formulaStr")
                                    }}</el-button
                                >
                            </el-popover> -->
                        </div>
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
                                            <span>{{node.label}}</span>
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
                                <div class="item-body-right-top">
                                    <el-collapse>
                                        <el-collapse-item
                                            v-for="(item, index) in formulas"
                                            :key="index"
                                            :title="item.fClass"
                                            :name="index">
                                            <div
                                                v-for="(info, i) in item.flist"
                                                :key="i"
                                                class="field-item"
                                                v-on:click="
                                                    insertFunction(
                                                        info.fName + '('
                                                    )
                                                "
                                                v-on:mouseenter="
                                                    showIntro(
                                                        info.fName,
                                                        item.fClass,
                                                        info.fIntro
                                                    )
                                                "
                                                v-on:mouseleave="resetIntro">
                                                <span>{{ info.fName }}</span>
                                                <el-tag
                                                    :type="getClass(info.fType)"
                                                    >{{ info.fType }}</el-tag
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
                                    v-if="introducition.title != ''"
                                    style="font-size: 16px; color: #0a5d7c">
                                    {{ introducition.title }}
                                </li>
                                <li>
                                    <div
                                        class="intro-content"
                                        v-html="introducition.content"></div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </el-col>
            </el-row>
            <template #footer>
                <div  class="dialog-footer">
                    <el-button size="default" type="primary" @click="saveFormula">{{
                        i18nt("designer.hint.confirm")
                    }}</el-button>
                    <el-button size="default"  @click="dialogFormVisible = false">{{
                        i18nt("designer.hint.cancel")
                    }}</el-button>
                </div>
            </template>
          
        </el-dialog>
    </div>
</template>

<script>
    import {basicSetup,EditorView} from "codemirror"
    import {javascript} from "@codemirror/lang-javascript"
    import { EditorState} from "@codemirror/state";
  //  import { Codemirror } from "vue-codemirror";
    import i18n from "@/utils/i18n";
  //  import CodeEditor from "@/components/code-editor/index";
     import { deepClone,placeholders,baseTheme } from "@/utils/util";
    export default {
        name: "formula-editor",
        mixins: [i18n],
        components: {
          //  CodeEditor,
          // Codemirror,
        },
        props: {
            designer: Object,
            selectedWidget: Object,
            optionModel: Object,
        },
        watch: {
            filterText(val) {
                this.$refs.fieldTree.filter(val);
            },
        },
        data() {
            return {
                codeMirror:null,
                isFormulaEdit: this.formulaMode != "view",
                formulaMode: "view", // 公式模式：查看/编辑
                formulaSize: "default", // 公式大小
                formula: "",
                tags: [], // 公式页签集合
                fieldTreeData: [], // 设计器字段树
                filterText: "",
                dialogFormVisible: false,
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
                fields: [
                    {
                        fieldName: "cCode",
                        fieldType: "文本",
                        fieldIntro: "单号",
                    },
                    {
                        fieldName: "ddate",
                        fieldType: "日期",
                        fieldIntro: "制单日期",
                    },
                    {
                        fieldName: "qty",
                        fieldType: "数值",
                        fieldIntro: "数量",
                    },
                    {
                        fieldName: "bclose",
                        fieldType: "布尔",
                        fieldIntro: "是否关闭",
                    },
                    {
                        fieldName: "qty",
                        fieldType: "数值",
                        fieldIntro: "单价",
                    },
                    {
                        fieldName: "cInvName",
                        fieldType: "文本",
                        fieldIntro: "存货名称",
                    },
                    {
                        fieldName: "ddate",
                        fieldType: "日期",
                        fieldIntro: "制单日期",
                    },
                    {
                        fieldName: "qty",
                        fieldType: "数值",
                        fieldIntro: "数量",
                    },
                    {
                        fieldName: "bclose",
                        fieldType: "布尔",
                        fieldIntro: "是否关闭",
                    },
                    {
                        fieldName: "qty",
                        fieldType: "数值",
                        fieldIntro: "单价",
                    },
                    {
                        fieldName: "cInvName",
                        fieldType: "文本",
                        fieldIntro: "存货名称",
                    },
                ],
                introTitle: this.i18nt("designer.hint.formulaFunctionExplain"),
                introducition: {
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
                formulas: [
                    {
                        fClass: this.i18nt(
                            "designer.hint.formulaFunctionMaths"
                        ),
                        flist: [
                            {
                                fName: "INT",
                                fType: this.i18nt(
                                    "designer.hint.formulaNumber"
                                ),
                                fIntro: this.i18nt("designer.hint.formulaINT"),
                            },
                            {
                                fName: "SUM",
                                fType: this.i18nt(
                                    "designer.hint.formulaNumber"
                                ),
                                fIntro: this.i18nt("designer.hint.formulaSUM"),
                            },
                            {
                                fName: "AVERAGE",
                                fType: this.i18nt(
                                    "designer.hint.formulaNumber"
                                ),
                                fIntro: this.i18nt(
                                    "designer.hint.formulaAVERAGE"
                                ),
                            },
                            {
                                fName: "MAX",
                                fType: this.i18nt(
                                    "designer.hint.formulaNumber"
                                ),
                                fIntro: this.i18nt("designer.hint.formulaMAX"),
                            },
                            {
                                fName: "MIN",
                                fType: this.i18nt(
                                    "designer.hint.formulaNumber"
                                ),
                                fIntro: this.i18nt("designer.hint.formulaMIN"),
                            },
                            {
                                fName: "ABS",
                                fType: this.i18nt(
                                    "designer.hint.formulaNumber"
                                ),
                                fIntro: this.i18nt("designer.hint.formulaABS"),
                            },
                            {
                                fName: "ROUND",
                                fType: this.i18nt(
                                    "designer.hint.formulaNumber"
                                ),
                                fIntro: this.i18nt(
                                    "designer.hint.formulaROUND"
                                ),
                            },
                            {
                                fName: "CEILING",
                                fType: this.i18nt(
                                    "designer.hint.formulaNumber"
                                ),
                                fIntro: this.i18nt(
                                    "designer.hint.formulaCEILING"
                                ),
                            },
                            {
                                fName: "LOG",
                                fType: this.i18nt(
                                    "designer.hint.formulaNumber"
                                ),
                                fIntro: this.i18nt("designer.hint.formulaLOG"),
                            },
                            {
                                fName: "MOD",
                                fType: this.i18nt(
                                    "designer.hint.formulaNumber"
                                ),
                                fIntro: this.i18nt("designer.hint.formulaMOD"),
                            },
                            {
                                fName: "POWER",
                                fType: this.i18nt(
                                    "designer.hint.formulaNumber"
                                ),
                                fIntro: this.i18nt(
                                    "designer.hint.formulaPOWER"
                                ),
                            },
                        ],
                    },
                    {
                        fClass: this.i18nt(
                            "designer.hint.formulaFunctionLogic"
                        ),
                        flist: [
                            {
                                fName: "AND",
                                fType: this.i18nt(
                                    "designer.hint.formulaObject"
                                ),
                                fIntro: this.i18nt("designer.hint.formulaAND"),
                            },
                            {
                                fName: "IF",
                                fType: this.i18nt(
                                    "designer.hint.formulaObject"
                                ),
                                fIntro: this.i18nt("designer.hint.formulaIF"),
                            },
                            {
                                fName: "IFS",
                                fType: this.i18nt(
                                    "designer.hint.formulaObject"
                                ),
                                fIntro: this.i18nt("designer.hint.formulaIFS"),
                            },
                            {
                                fName: "IFERROR",
                                fType: this.i18nt(
                                    "designer.hint.formulaObject"
                                ),
                                fIntro: this.i18nt(
                                    "designer.hint.formulaIFERROR"
                                ),
                            },
                            {
                                fName: "IFNA",
                                fType: this.i18nt(
                                    "designer.hint.formulaObject"
                                ),
                                fIntro: this.i18nt("designer.hint.formulaIFNA"),
                            },
                            {
                                fName: "NOT",
                                fType: this.i18nt(
                                    "designer.hint.formulaObject"
                                ),
                                fIntro: this.i18nt("designer.hint.formulaNOT"),
                            },
                            {
                                fName: "OR",
                                fType: this.i18nt(
                                    "designer.hint.formulaObject"
                                ),
                                fIntro: this.i18nt("designer.hint.formulaOR"),
                            },
                            {
                                fName: "SWITCH",
                                fType: this.i18nt(
                                    "designer.hint.formulaObject"
                                ),
                                fIntro: this.i18nt(
                                    "designer.hint.formulaSWITCH"
                                ),
                            },
                            {
                                fName: "XOR",
                                fType: this.i18nt(
                                    "designer.hint.formulaObject"
                                ),
                                fIntro: this.i18nt("designer.hint.formulaXOR"),
                            },
                        ],
                    },
                    {
                        fClass: this.i18nt("designer.hint.formulaFunctionTime"),
                        flist: [
                            {
                                fName: "YEAR",
                                fType: this.i18nt("designer.hint.formulaDate"),
                                fIntro: this.i18nt("designer.hint.formulaYEAR"),
                            },
                            {
                                fName: "MONTH",
                                fType: this.i18nt("designer.hint.formulaDate"),
                                fIntro: this.i18nt(
                                    "designer.hint.formulaMONTH"
                                ),
                            },
                            {
                                fName: "DAY",
                                fType: this.i18nt("designer.hint.formulaDate"),
                                fIntro: this.i18nt("designer.hint.formulaDAY"),
                            },
                            {
                                fName: "TODAY",
                                fType: this.i18nt("designer.hint.formulaDate"),
                                fIntro: this.i18nt(
                                    "designer.hint.formulaTODAY"
                                ),
                            },
                            {
                                fName: "NOW",
                                fType: this.i18nt("designer.hint.formulaDate"),
                                fIntro: this.i18nt("designer.hint.formulaNOW"),
                            },
                            {
                                fName: "EMONTH",
                                fType: this.i18nt("designer.hint.formulaDate"),
                                fIntro: this.i18nt(
                                    "designer.hint.formulaEMONTH"
                                ),
                            },
                            {
                                fName: "EDAY",
                                fType: this.i18nt("designer.hint.formulaDate"),
                                fIntro: this.i18nt("designer.hint.formulaEDAY"),
                            },
                        ],
                    },
                    {
                        fClass: this.i18nt(
                            "designer.hint.formulaFunctionString"
                        ),
                        flist: [
                            {
                                fName: "FIND",
                                fType: this.i18nt("designer.hint.formulaChar"),
                                fIntro: this.i18nt("designer.hint.formulaFIND"),
                            },
                            {
                                fName: "LEFT",
                                fType: this.i18nt("designer.hint.formulaChar"),
                                fIntro: this.i18nt("designer.hint.formulaLEFT"),
                            },
                            {
                                fName: "RIGHT",
                                fType: this.i18nt("designer.hint.formulaChar"),
                                fIntro: this.i18nt(
                                    "designer.hint.formulaRIGHT"
                                ),
                            },
                            {
                                fName: "LEN",
                                fType: this.i18nt("designer.hint.formulaChar"),
                                fIntro: this.i18nt("designer.hint.formulaLEN"),
                            },
                            {
                                fName: "LOWER",
                                fType: this.i18nt("designer.hint.formulaChar"),
                                fIntro: this.i18nt(
                                    "designer.hint.formulaLOWER"
                                ),
                            },
                            {
                                fName: "UPPER",
                                fType: this.i18nt("designer.hint.formulaChar"),
                                fIntro: this.i18nt(
                                    "designer.hint.formulaUPPER"
                                ),
                            },
                            {
                                fName: "MID",
                                fType: this.i18nt("designer.hint.formulaChar"),
                                fIntro: this.i18nt("designer.hint.formulaMID"),
                            },
                            {
                                fName: "TRIM",
                                fType: this.i18nt("designer.hint.formulaChar"),
                                fIntro: this.i18nt("designer.hint.formulaTRIM"),
                            },
                        ],
                    },
                ],
            };
        },
        mounted() {},
        methods: {
            formulaModeChange(value) {
                for (let i = 0; i < this.tags.length; i++) {
                    if (value === "view") {
                        this.tags[i].closable = false;
                        this.isFormulaEdit = false;
                    } else {
                        this.tags[i].closable = true;
                        this.isFormulaEdit = true;
                    }
                }
            },
            formulaSizeChange(value) {
                for (let i = 0; i < this.tags.length; i++) {
                    this.tags[i].size = value;
                }
            },
            clearTags() {
                this.tags = []; //el-tag模式
                //CodeMirror 模式
                this.codeMirror.dispatch({ changes: { from: 0, to: this.codeMirror.state.doc.length, insert: "" } })
            },
            handleClickTag(tag) {
                tag.closable = !tag.closable;
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
            // 关闭tag时，删除tags中的子项，并且删除公式数组中对应的公式因子
            handleCloseTag(tag) {
                let index = this.tags.indexOf(tag);
                this.tags.splice(index, 1);
            },
            filterNode(value, data) {
                if (!value) return true;
                return data.label.indexOf(value) !== -1;
            },
            // 插入字段
            insertField(obj, node, self) {
                if (!!obj.formItemFlag) {
                    let fieldTitle = "";
                    let fieldName = "";
                    let parentType = node.parent.data.type;
                    // 判断若为子表单字段用[]包裹，主表单字段用{}包裹
                    if (parentType === "sub-form") {
                        fieldTitle =
                            "[" +
                            node.parent.data.label +
                            "." +
                            obj.label +
                            "]";
                        fieldName =
                            "[" + node.parent.data.id + "." + obj.id + "]";
                    } else if (parentType === "grid") {
                        fieldTitle =
                            "[" +
                            node.parent.parent.parent.data.label +
                            "." +
                            obj.label +
                            "]";
                        fieldName =
                            "[" +
                            node.parent.parent.parent.data.id +
                            "." +
                            obj.id +
                            "]";
                    } else {
                        //fieldTitle = "[" + obj.label + "]";
                        //fieldName = "{" + obj.id + "}";
                        fieldName=obj.id;
                    }
                    this.tags.push({
                        name: fieldTitle,
                        value: fieldName,
                        closable: this.isFormulaEdit,
                        size: this.formulaSize,
                        paraType: "Field",
                        type: "",
                    });

                    //CodeMirror 模式
                    //this.formula += fieldName;
                    this.updateCodeMirror(fieldName,"field");
                }
            },
            // 插入数字
            insertNumFun(insertNum) {
                //可不用
                // this.tags.push({
                //     name: insertNum,
                //     value: insertNum,
                //     closable: this.isFormulaEdit,
                //     size: this.formulaSize,
                //     paraType: "Num",
                //     type: "",
                // });
            },
            // 插入字符
            insertStrFun(insertStr) {
                //可不用
                // this.tags.push({
                //     name: insertStr,
                //     value: insertStr,
                //     closable: this.isFormulaEdit,
                //     size: this.formulaSize,
                //     paraType: "Str",
                //     type: "",
                // });
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
                    closable: this.isFormulaEdit,
                    size: this.formulaSize,
                    paraType: "Symbol",
                    type: tagType,
                });

                //CodeMirror 模式
               // this.formula += opt;
              this.updateCodeMirror(opt);
            },
            // 插入函数
            insertFunction(opt) {
                this.tags.push({
                    name: opt,
                    value: opt,
                    closable: this.isFormulaEdit,
                    size: this.formulaSize,
                    paraType: "Function",
                    type: "warning",
                });

                //CodeMirror 模式
                //this.formula += opt;
                this.updateCodeMirror(opt,"func");
            },
            //更新编辑器数据
             updateCodeMirror(opt,type=null){
               var code="";  
                if(type == "func"){
                    code = `{${opt}}`;
                }
                else if(type == "field"){
                    code = `[${opt}]`;
                }
                else{
                    code = `${opt}`;
                }
                if(code){
                     this.codeMirror.dispatch({
                        changes: {
                            from: this.codeMirror.state.selection.main.head, to: this.codeMirror.state.selection.main.head, insert: code
                        },
                        selection: { anchor: this.codeMirror.state.selection.main.head + code.length},
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
            // 打开编辑公式弹窗
            setFormula() {
                this.fieldTreeData.length = 0;
                // 初始化字段树
                this.designer.widgetList.forEach((wItem) => {
                    if (this.optionModel.name != wItem.id) {
                        this.buildTreeNodeOfWidget(wItem, this.fieldTreeData);
                    }
                });

                console.log("设计器字段===>", this.fieldTreeData);

                // 加载当前字段计算公式tags
                this.tags = deepClone(this.optionModel.formulaTags);
                this.formula = deepClone(this.optionModel.formula);
                this.dialogFormVisible = true;
                this.formulaMode = "view";
                this.isFormulaEdit = false;
                this.formulaModeChange("view");

                 //==== codeMirror 挂载视图 ====
                 this.$nextTick(()=>{
                    this.codeMirror = new EditorView({      
                        state: EditorState.create({     
                            doc: this.formula,       
                            extensions: [basicSetup,javascript(),             
                                [baseTheme, [], placeholders]],        
                        }),
                        parent: this.$refs.coderef
                    });
                    console.log("编辑器实例==>",this.codeMirror);
                })
            },
            // 保存计算公式-展示和计算公式-计算
            saveFormula() {
                this.optionModel.formula = "";
                this.optionModel.formulaShow = "";

                this.optionModel.formula =  this.codeMirror.state.doc.text.join("\r\n");
                this.optionModel.formulaShow =  this.optionModel.formula;
                //此处需要把函数的大括号去掉？
                console.log("表达式===>",this.optionModel.formula);

                //CodeMirror 模式
                // this.optionModel.formulaShow = this.formula;
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
                // if (!this.isValid(this.optionModel.formula)) {
                //     this.$message.error("函数缺失右括号)");
                //     return false;
                // }
                // this.optionModel.formulaTags = this.tags;
                this.dialogFormVisible = false;
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
                this.introducition = {
                    title: this.i18nt("designer.hint.formulaPleaseSelect"),
                    content:
                        '<span class="cg">' +
                        this.i18nt("designer.hint.formulaSample") +
                        '：</span><span class="fname">SUM</span><span class="cg">(</span><span class="cs">参数1</span><span class="cg">,</span><span class="cs">参数2</span><span class="cg">)</span>',
                };
            },
            showIntro(mname, title, content) {
                content = '<span class="cg">' + content + "</span>";
                this.introducition = {
                    title: title,
                    content: content,
                };
                this.introTitle = mname;
            },
            buildTreeNodeOfWidget(widget, treeNode) {
                let curNode = {
                    id: widget.id,
                    name: widget.options.name,
                    label: widget.options.label || widget.type,
                    type: widget.type,
                    formItemFlag: widget.formItemFlag || "",
                    //selectable: true,
                };
                // 主要处理数字和字符串
                if (
                    curNode.type === "input" ||
                    curNode.type === "textarea" ||
                    curNode.type === "number" ||
                    curNode.type === "date" ||
                    curNode.type === "sub-form" ||
                    curNode.type === "grid-sub-form" ||
                    curNode.type === "grid"
                ) {
                    if (
                        curNode.type === "sub-form" ||
                        curNode.type === "grid-sub-form"
                    ) {
                        curNode.label = curNode.name;
                    }
                    treeNode.push(curNode);
                }

                if (widget.category === undefined) {
                    return;
                }

                curNode.children = [];
                if (widget.type === "grid") {
                    widget.cols.map((col) => {
                        let colNode = {
                            id: col.id,
                            label: col.options.name || widget.type,
                            type: widget.type,
                            formItemFlag: widget.formItemFlag || "",
                            children: [],
                        };
                        curNode.children.push(colNode);
                        col.widgetList.map((wChild) => {
                            this.buildTreeNodeOfWidget(
                                wChild,
                                colNode.children
                            );
                        });
                    });
                } else if (widget.type === "table") {
                    //TODO: 需要考虑合并单元格！！
                    widget.rows.map((row) => {
                        let rowNode = {
                            id: row.id,
                            label: "table-row",
                            type: widget.type,
                            formItemFlag: widget.formItemFlag || "",
                            selectable: false,
                            children: [],
                        };
                        curNode.children.push(rowNode);
                        row.cols.map((cell) => {
                            if (!!cell.merged) {
                                //跳过合并单元格！！
                                return;
                            }
                            let rowChildren = rowNode.children;
                            let cellNode = {
                                id: cell.id,
                                label: "table-cell",
                                type: cell.type,
                                formItemFlag: "",
                                children: [],
                            };
                            rowChildren.push(cellNode);
                            cell.widgetList.map((wChild) => {
                                this.buildTreeNodeOfWidget(
                                    wChild,
                                    cellNode.children
                                );
                            });
                        });
                    });
                } else if (widget.type === "tab") {
                    widget.tabs.map((tab) => {
                        let tabNode = {
                            id: tab.id,
                            label: tab.options.name || widget.type,
                            type: widget.type,
                            formItemFlag: widget.formItemFlag || "",
                            selectable: false,
                            children: [],
                        };
                        curNode.children.push(tabNode);
                        tab.widgetList.map((wChild) => {
                            this.buildTreeNodeOfWidget(
                                wChild,
                                tabNode.children
                            );
                        });
                    });
                } else if (widget.type === "sub-form") {
                    widget.widgetList.map((wChild) => {
                        this.buildTreeNodeOfWidget(wChild, curNode.children);
                    });
                } else if (widget.category === "container") {
                    //自定义容器
                    widget.widgetList.map((wChild) => {
                        this.buildTreeNodeOfWidget(wChild, curNode.children);
                    });
                }
            },
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
                if (flag === 0) {
                    return false;
                } else {
                    return true;
                }
            },
        },
    };
</script>

<style lang="scss" scoped>
    :deep(.cm-editor){
        height:100%;
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

    .bodyer {
        margin-left: 10px;
        margin-right: 10px;
        height: 200px;
        border: 1px solid #ccc;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
    }

    .body-left {
        margin-left: 10px;
        height: 110px;
        width: 100%;
        position: relative;
        overflow-x: hidden;
        overflow-y: scroll;
    }

    .body-right {
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
        border-radius: 10px;
        margin-bottom: 5px;
        padding: 0px 0px 0px 0px;
        width: 100%;
    }

    .group-item-right-top {
        height: 400px;
        border: 1px solid #ccc;
        border-radius: 10px;
        margin-bottom: 5px;
        width: 100%;
    }

    .group-item-right-bottom {
        height: 400px;
        border: 1px solid #ccc;
        border-radius: 10px;
        margin-bottom: 5px;
        width: 100%;
    }

    .item-header {
        border-bottom: 1px solid #ccc;
        height: 29px;
        line-height: 29px;
        padding-left: 15px;
    }

    .item-body-left {
        height: 320px;
        overflow-y: auto;
    }

    .item-body-right-top {
        height: 360px;
        overflow-y: auto;
    }

    .item-body-right-bottom {
        height: 152px;
        overflow-y: auto;
    }

    .el-collapse {
        border: none;
    }

    ::v-deep .el-dialog {
        margin-top: 10px !important;
    }

    ::v-deep .el-collapse-item__header {
        padding-left: 10px;
        border: none;
    }

    ::v-deep .el-collapse-item__wrap {
        border: none;
    }

    ::v-deep .el-collapse-item__arrow {
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

    >>> .cg {
        color: #0a5d7c;
    }

    >>> .fname {
        display: inline-block;
        border-radius: 2px;
        padding: 0 5px;
        margin: 1px;
        color: #fff;
        font-size: 12px;
        line-height: 20px;
        color: #708;
        background: #fff;
    }

    >>> .cs {
        display: inline-block;
        border-radius: 2px;
        padding: 0 5px;
        margin: 1px;
        color: #fff;
        font-size: 12px;
        line-height: 20px;
        background: #178cdf;
    }

    ::v-deep .el-dialog__body {
        padding: 0px 0px 0px 0px;
    }

    .small-padding-dialog {
        /* margin-top: 0px; */
    }
</style>
