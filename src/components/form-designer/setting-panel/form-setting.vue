<template>
  <div>
    <el-form :model="formConfig" size="small" label-position="left" label-width="120px"
             class="setting-form" @submit.prevent>
      <el-collapse v-model="formActiveCollapseNames" class="setting-collapse">
        <el-collapse-item name="1" :title="i18nt('designer.setting.basicSetting')">
          <el-form-item :label="i18nt('designer.setting.formSize')">
            <el-select v-model="formConfig.size">
              <el-option v-for="item in formSizes" :key="item.value" :label="item.label"
                         :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="i18nt('designer.setting.labelPosition')">
            <el-radio-group v-model="formConfig.labelPosition" class="radio-group-custom">
              <el-radio-button label="left">{{i18nt('designer.setting.leftPosition')}}</el-radio-button>
              <el-radio-button label="top">{{i18nt('designer.setting.topPosition')}}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="i18nt('designer.setting.labelAlign')">
            <el-radio-group v-model="formConfig.labelAlign" class="radio-group-custom">
              <el-radio-button label="label-left-align">{{i18nt('designer.setting.leftAlign')}}</el-radio-button>
              <el-radio-button label="label-center-align">{{i18nt('designer.setting.centerAlign')}}</el-radio-button>
              <el-radio-button label="label-right-align">{{i18nt('designer.setting.rightAlign')}}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="i18nt('designer.setting.labelWidth')">
            <el-input-number v-model="formConfig.labelWidth" :min="0" style="width: 100%"></el-input-number>
          </el-form-item>
          <el-form-item :label="i18nt('designer.setting.formCss')">
            <el-button type="info" icon="el-icon-edit" plain round @click="editFormCss">{{i18nt('designer.setting.addCss')}}</el-button>
          </el-form-item>
          <!-- -->
          <el-form-item :label="i18nt('designer.setting.customClass')">
            <el-select v-model="formConfig.customClass" multiple filterable allow-create
                       default-first-option>
              <el-option v-for="(item, idx) in cssClassList" :key="idx" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <!-- -->
          <el-form-item :label="i18nt('designer.setting.globalFunctions')">
            <el-button type="info" icon="el-icon-edit" plain round @click="editGlobalFunctions">{{i18nt('designer.setting.addEventHandler')}}</el-button>
          </el-form-item>
          <el-form-item label-width="0">
            <el-divider class="custom-divider">{{i18nt('designer.setting.formSFCSetting')}}</el-divider>
          </el-form-item>
          <el-form-item :label="i18nt('designer.setting.formModelName')">
            <el-input type="text" v-model="formConfig.modelName"></el-input>
          </el-form-item>
          <el-form-item :label="i18nt('designer.setting.formRefName')">
            <el-input type="text" v-model="formConfig.refName"></el-input>
          </el-form-item>
          <el-form-item :label="i18nt('designer.setting.formRulesName')">
            <el-input type="text" v-model="formConfig.rulesName"></el-input>
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item v-if="showEventCollapse()" name="2" :title="i18nt('designer.setting.eventSetting')">
          <el-form-item label="onFormCreated" label-width="150px">
            <el-button type="info" icon="el-icon-edit" plain round
                       :class="[getFormEventHandled('onFormCreated') ? 'button-text-highlight' : '']"
                       @click="editFormEventHandler('onFormCreated')">
              {{i18nt('designer.setting.addEventHandler')}}</el-button>
          </el-form-item>
          <el-form-item label="onFormMounted" label-width="150px">
            <el-button type="info" icon="el-icon-edit" plain round
                       :class="[getFormEventHandled('onFormMounted') ? 'button-text-highlight' : '']"
                       @click="editFormEventHandler('onFormMounted')">
              {{i18nt('designer.setting.addEventHandler')}}</el-button>
          </el-form-item>
          <!-- -->
          <el-form-item label="onFormDataChange" label-width="150px">
            <el-button type="info" icon="el-icon-edit" plain round
                       :class="[getFormEventHandled('onFormDataChange') ? 'button-text-highlight' : '']"
                       @click="editFormEventHandler('onFormDataChange')">
              {{i18nt('designer.setting.addEventHandler')}}</el-button>
          </el-form-item>
          <!-- -->
          <!--
          <el-form-item label="onFormValidate">
            <el-button type="info" icon="el-icon-edit" plain round @click="editFormEventHandler('onFormValidate')">
              {{i18nt('designer.setting.addEventHandler')}}</el-button>
          </el-form-item>
          -->
        </el-collapse-item>
      </el-collapse>
    </el-form>

    <div v-if="showFormEventDialogFlag" class="" v-drag="['.drag-dialog.el-dialog', '.drag-dialog .el-dialog__header']">
      <el-dialog :title="i18nt('designer.setting.editFormEventHandler')" v-model="showFormEventDialogFlag"
                 :show-close="true" class="drag-dialog small-padding-dialog" append-to-body
                 :close-on-click-modal="false" :close-on-press-escape="false" :destroy-on-close="true">
        <el-alert type="info" :closable="false" :title="'form.' + eventParamsMap[curEventName]"></el-alert>
        <code-editor :mode="'javascript'" :readonly="false" v-model="formEventHandlerCode" ref="ecEditor"></code-editor>
        <el-alert type="info" :closable="false" title="}"></el-alert>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="showFormEventDialogFlag = false">
              {{i18nt('designer.hint.cancel')}}</el-button>
            <el-button type="primary" @click="saveFormEventHandler">
              {{i18nt('designer.hint.confirm')}}</el-button>
          </div>
        </template>
      </el-dialog>
    </div>

    <div v-if="showEditFormCssDialogFlag" class="" v-drag="['.drag-dialog.el-dialog', '.drag-dialog .el-dialog__header']">
      <el-dialog :title="i18nt('designer.setting.formCss')" v-model="showEditFormCssDialogFlag"
                 :show-close="true" class="drag-dialog small-padding-dialog" append-to-body
                 :close-on-click-modal="false" :close-on-press-escape="false" :destroy-on-close="true">
        <code-editor :mode="'css'" :readonly="false" v-model="formCssCode"></code-editor>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="showEditFormCssDialogFlag = false">
              {{i18nt('designer.hint.cancel')}}</el-button>
            <el-button type="primary" @click="saveFormCss">
              {{i18nt('designer.hint.confirm')}}</el-button>
          </div>
        </template>
      </el-dialog>
    </div>

    <div v-if="showEditFunctionsDialogFlag" class="" v-drag="['.drag-dialog.el-dialog', '.drag-dialog .el-dialog__header']">
      <el-dialog :title="i18nt('designer.setting.globalFunctions')" v-model="showEditFunctionsDialogFlag"
                 :show-close="true" class="drag-dialog small-padding-dialog" append-to-body
                 :close-on-click-modal="false" :close-on-press-escape="false" :destroy-on-close="true">
        <code-editor :mode="'javascript'" :readonly="false" v-model="functionsCode" ref="gfEditor"></code-editor>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="showEditFunctionsDialogFlag = false">
              {{i18nt('designer.hint.cancel')}}</el-button>
            <el-button type="primary" @click="saveGlobalFunctions">
              {{i18nt('designer.hint.confirm')}}</el-button>
          </div>
        </template>
      </el-dialog>
    </div>

  </div>
</template>

<script>
	import { ref,onMounted,getCurrentInstance , inject , reactive,toRefs } from 'vue'
  import { useI18n } from '@/utils/i18n'
  import CodeEditor from '@/components/code-editor/index'
  import {deepClone, insertCustomCssToHead, insertGlobalFunctionsToHtml} from "@/utils/util"

  export default {
    name: "form-setting",
    components: {
      CodeEditor,
    },
    props: {
      designer: Object,
      formConfig: Object,
    },
    setup(props){
      
      const { i18nt }=useI18n();
      const getDesignerConfig=inject('getDesignerConfig')
      
      const { proxy } = getCurrentInstance()

      const ecEditor=ref(null)
      const gfEditor=ref(null)

      const data=reactive({
        designerConfig: getDesignerConfig(),

        formActiveCollapseNames: ['1', '2'],

        formSizes: [
          {label: 'default', value: ''},
          {label: 'large', value: 'large'},
          //{label: 'medium', value: 'medium'},
          {label: 'small', value: 'small'},
          //{label: 'mini', value: 'mini'},
        ],

        showEditFormCssDialogFlag: false,
        formCssCode: '',
        cssClassList: [],

        showEditFunctionsDialogFlag: false,
        functionsCode: '',

        showFormEventDialogFlag: false,
        formEventHandlerCode: '',
        curEventName: '',

        eventParamsMap: {
          'onFormCreated':      'onFormCreated() {',
          'onFormMounted':      'onFormMounted() {',
          'onFormDataChange':   'onFormDataChange(fieldName, newValue, oldValue, formModel, subFormName, subFormRowIndex) {',
          //'onFormValidate':     'onFormValidate() {',
        },

      })


      onMounted(()=>{
          /* SettingPanel和FormWidget为兄弟组件, 在FormWidget加载formConfig时，
              此处SettingPanel可能无法获取到formConfig.cssCode, 故加个延时函数！ */
          setTimeout(() => {
              data.formCssCode = props.formConfig.cssCode
              insertCustomCssToHead(data.formCssCode)
              extractCssClass()
              props.designer.emitEvent('form-css-updated', deepClone(data.cssClassList))
          }, 1200)
      })


      const getFormEventHandled=(eventName)=> {
        return !!props.formConfig[eventName] && (props.formConfig[eventName].length > 0)
      }

      const showEventCollapse=()=> {
        if (data.designerConfig['eventCollapse'] === undefined) {
          return true
        }

        return !!data.designerConfig['eventCollapse']
      }

      const editFormCss=()=> {
        data.formCssCode = props.designer.formConfig.cssCode
        data.showEditFormCssDialogFlag = true
      }

      const extractCssClass=() =>{
        let regExp = /\..*{/g
        let result = data.formCssCode.match(regExp)
        let cssNameArray = []

        if (!!result && result.length > 0) {
          result.forEach((rItem) => {
            let classArray = rItem.split(',')  //切分逗号分割的多个class
            if (classArray.length > 0) {
              classArray.forEach((cItem) => {
                let caItem = cItem.trim()
                if (caItem.indexOf('.', 1) !== -1) {  //查找第二个.位置
                  let newClass = caItem.substring(caItem.indexOf('.') + 1, caItem.indexOf('.', 1))  //仅截取第一、二个.号之间的class
                  if (!!newClass) {
                    cssNameArray.push(newClass.trim())
                  }
                } else if (caItem.indexOf(' ') !== -1) {  //查找第一个空格位置
                  let newClass = caItem.substring(caItem.indexOf('.') + 1, caItem.indexOf(' '))  //仅截取第一、二个.号之间的class
                  if (!!newClass) {
                    cssNameArray.push(newClass.trim())
                  }
                } else {
                  if (caItem.indexOf('{') !== -1) {  //查找第一个{位置
                    let newClass = caItem.substring(caItem.indexOf('.') + 1, caItem.indexOf('{'))
                    cssNameArray.push( newClass.trim() )
                  } else {
                    let newClass = caItem.substring(caItem.indexOf('.') + 1)
                    cssNameArray.push( newClass.trim() )
                  }
                }
              })
            }
          })
        }

        //data.cssClassList.length = 0
        data.cssClassList.splice(0, data.cssClassList.length)  //清除数组必须用splice，length=0不会响应式更新！！
        data.cssClassList = Array.from( new Set(cssNameArray) )  //数组去重
      }

      const saveFormCss=()=> {
        extractCssClass()
        props.designer.formConfig.cssCode = data.formCssCode
        insertCustomCssToHead(data.formCssCode)
        data.showEditFormCssDialogFlag = false

        props.designer.emitEvent('form-css-updated', deepClone(data.cssClassList))
      }

      const editGlobalFunctions=() =>{
        data.functionsCode = props.designer.formConfig.functions
        data.showEditFunctionsDialogFlag = true
      }

      const saveGlobalFunctions=()=> {
        const codeHints = gfEditor.getEditorAnnotations()
        let syntaxErrorFlag = false
        if (!!codeHints && (codeHints.length > 0)) {
          codeHints.forEach((chItem) => {
            if (chItem.type === 'error') {
              syntaxErrorFlag = true
            }
          })

          if (syntaxErrorFlag) {
            proxy.$message.error(i18nt('designer.setting.syntaxCheckWarning'))
            return
          }
        }

        props.designer.formConfig.functions = data.functionsCode
        insertGlobalFunctionsToHtml(data.functionsCode)
        data.showEditFunctionsDialogFlag = false
      }

      const editFormEventHandler=(eventName)=> {
        data.curEventName = eventName
        data.formEventHandlerCode = props.formConfig[eventName]
        data.showFormEventDialogFlag = true
      }

      const saveFormEventHandler=()=> {
        const codeHints = ecEditor.getEditorAnnotations()
        let syntaxErrorFlag = false
        if (!!codeHints && (codeHints.length > 0)) {
          codeHints.forEach((chItem) => {
            if (chItem.type === 'error') {
              syntaxErrorFlag = true
            }
          })

          if (syntaxErrorFlag) {
            proxy.$message.error(i18nt('designer.setting.syntaxCheckWarning'))
            return
          }
        }

        props.formConfig[data.curEventName] = data.formEventHandlerCode
        data.showFormEventDialogFlag = false
      }



      //导入表单JSON后需要重新加载自定义CSS样式！！！
      props.designer.handleEvent('form-json-imported', () => {
        data.formCssCode = props.formConfig.cssCode
        insertCustomCssToHead(data.formCssCode)
        extractCssClass()
        props.designer.emitEvent('form-css-updated', deepClone(data.cssClassList))
      })
      return {
        i18nt,
        ...toRefs(data),
        
        ecEditor,
        gfEditor, 

        getFormEventHandled,
        showEventCollapse,
        editFormCss,
        extractCssClass,
        saveFormCss,
        editGlobalFunctions,
        saveGlobalFunctions,
        editFormEventHandler,
        saveFormEventHandler
      }
    }
      
  }
</script>

<style lang="scss" scoped>
  .setting-form {
    :deep(.el-form-item__label) {
      font-size: 13px;
      //text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    :deep(.el-form-item--small.el-form-item) {
      margin-bottom: 10px;
    }

    .radio-group-custom {
      :deep(.el-radio-button__inner) {
        padding-left: 12px;
        padding-right: 12px;
      }
    }

    .custom-divider.el-divider--horizontal {
      margin: 10px 0;
    }
  }

  .setting-collapse {
    :deep(.el-collapse-item__content) {
      padding-bottom: 6px;
    }

    :deep(.el-collapse-item__header) {
      font-style: italic;
      font-weight: bold;
    }
  }

  .small-padding-dialog {
    :deep(.el-dialog__body) {
      padding: 6px 15px 12px 15px;
    }
  }

</style>
