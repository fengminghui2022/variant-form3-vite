<template>
  <div>
    <el-button type="primary" @click="getFormData">获取表单Json</el-button>
    <el-button type="primary" @click="setFormData">设置表单Json</el-button>
    <el-button type="primary" @click="clearDesigner">清空表单Json</el-button>
    <el-button type="primary" @click="refreshDesigner">刷新配置</el-button>
    <el-button type="primary" @click="previewForm">预览表单</el-button>
    <el-button type="primary" @click="importJson">导入Json</el-button>
    <el-button type="primary" @click="exportJson">导出Json</el-button>
    <el-button type="primary" @click="exportCode">导出代码</el-button>
    <el-button type="primary" @click="generateSFC">导出SFC</el-button>

  </div>
</template>
<script>

import { 
  computed, getCurrentInstance, reactive,ref,toRefs,onMounted
} from 'vue'
export default {
  props: {
    designer: Function
  },
  setup(props, context) {
    let designer =ref(null);

    onMounted(()=>{
        designer.value= props.designer();
    })
    const methods =reactive( {
      getFormData: () => {
        console.log( designer.value.getFormJson())
      },
      setFormData: () => {
        let formData = {
          "widgetList": [
            {
              "key": 79483,
              "type": "grid",
              "alias": "",
              "category": "container",
              "icon": "grid",
              "cols": [
                {
                  "type": "grid-col",
                  "category": "container",
                  "icon": "grid-col",
                  "internal": true,
                  "widgetList": [
                    {
                      "key": 17754,
                      "type": "input",
                      "alias": "",
                      "icon": "text-field",
                      "formItemFlag": true,
                      "options": {
                        "name": "input101540",
                        "label": "input",
                        "labelAlign": "",
                        "type": "text",
                        "defaultValue": "",
                        "placeholder": "",
                        "columnWidth": "200px",
                        "size": "",
                        "labelWidth": null,
                        "labelHidden": false,
                        "readonly": false,
                        "disabled": false,
                        "hidden": false,
                        "clearable": true,
                        "showPassword": false,
                        "required": false,
                        "requiredHint": "",
                        "validation": "",
                        "validationHint": "",
                        "customClass": [],
                        "labelIconClass": null,
                        "labelIconPosition": "rear",
                        "labelTooltip": null,
                        "minLength": null,
                        "maxLength": null,
                        "showWordLimit": false,
                        "prefixIcon": "",
                        "suffixIcon": "",
                        "appendButton": false,
                        "appendButtonDisabled": false,
                        "buttonIcon": "custom-search",
                        "onCreated": "",
                        "onMounted": "",
                        "onInput": "",
                        "onChange": "",
                        "onFocus": "",
                        "onBlur": "",
                        "onValidate": "",
                        "onAppendButtonClick": ""
                      },
                      "id": "input101540"
                    }
                  ],
                  "options": {
                    "name": "gridCol27881",
                    "hidden": false,
                    "span": 12,
                    "offset": 0,
                    "push": 0,
                    "pull": 0,
                    "responsive": false,
                    "md": 12,
                    "sm": 12,
                    "xs": 12,
                    "customClass": ""
                  },
                  "id": "grid-col-27881"
                },
                {
                  "type": "grid-col",
                  "category": "container",
                  "icon": "grid-col",
                  "internal": true,
                  "widgetList": [],
                  "options": {
                    "name": "gridCol77775",
                    "hidden": false,
                    "span": 12,
                    "offset": 0,
                    "push": 0,
                    "pull": 0,
                    "responsive": false,
                    "md": 12,
                    "sm": 12,
                    "xs": 12,
                    "customClass": ""
                  },
                  "id": "grid-col-77775"
                }
              ],
              "options": {
                "name": "grid38170",
                "hidden": false,
                "gutter": 12,
                "colHeight": null,
                "customClass": []
              },
              "id": "grid38170"
            },
            {
              "key": 45083,
              "type": "input",
              "alias": "",
              "icon": "text-field",
              "formItemFlag": true,
              "options": {
                "name": "input95212",
                "label": "input",
                "labelAlign": "",
                "type": "text",
                "defaultValue": "",
                "placeholder": "",
                "columnWidth": "200px",
                "size": "",
                "labelWidth": null,
                "labelHidden": false,
                "readonly": false,
                "disabled": false,
                "hidden": false,
                "clearable": true,
                "showPassword": false,
                "required": false,
                "requiredHint": "",
                "validation": "",
                "validationHint": "",
                "customClass": [],
                "labelIconClass": null,
                "labelIconPosition": "rear",
                "labelTooltip": null,
                "minLength": null,
                "maxLength": null,
                "showWordLimit": false,
                "prefixIcon": "",
                "suffixIcon": "",
                "appendButton": false,
                "appendButtonDisabled": false,
                "buttonIcon": "custom-search",
                "onCreated": "",
                "onMounted": "",
                "onInput": "",
                "onChange": "",
                "onFocus": "",
                "onBlur": "",
                "onValidate": "",
                "onAppendButtonClick": ""
              },
              "id": "input95212"
            }
          ],
          "formConfig": {
            "modelName": "formData",
            "refName": "vForm",
            "rulesName": "rules",
            "labelWidth": 80,
            "labelPosition": "left",
            "size": "",
            "labelAlign": "label-left-align",
            "cssCode": "",
            "customClass": [],
            "functions": "",
            "layoutType": "PC",
            "jsonVersion": 3,
            "dataSources": [],
            "onFormCreated": "",
            "onFormMounted": "",
            "onFormDataChange": ""
          }
        }
        designer.value.setFormJson(formData)
      },
      clearDesigner: () => {
        designer.value.clearDesigner();
      },
      refreshDesigner:()=>{
        designer.value.refreshDesigner();
      },
      previewForm:()=>{
        designer.value.previewForm();
      },
      importJson:()=>{
        designer.value.importJson();
      },
      exportJson:()=>{
        designer.value.exportJson();
      },
      exportCode:()=>{
        designer.value.exportCode();
      },
      generateSFC:()=>{
        designer.value.generateSFC();
      }
    })


    return {
      ...toRefs(methods)
    }
  },
}
</script>