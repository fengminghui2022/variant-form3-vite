<template>
  <div class="toolbar-container">
    <div class="left-toolbar">
      <el-button type="text" :disabled="undoDisabled" size="mini" :title="i18nt('designer.toolbar.undoHint')" @click="undoHistory">
        <svg-icon icon-class="undo" /></el-button>
      <el-button type="text" :disabled="redoDisabled" size="mini" :title="i18nt('designer.toolbar.redoHint')" @click="redoHistory">
        <svg-icon icon-class="redo" /></el-button>
      <el-button-group style="margin-left: 20px">
        <el-button :type="layoutType === 'PC' ? 'info': ''" @click="changeLayoutType('PC')">
          {{i18nt('designer.toolbar.pcLayout')}}</el-button>
        <el-button :type="layoutType === 'Pad' ? 'info': ''" @click="changeLayoutType('Pad')">
          {{i18nt('designer.toolbar.padLayout')}}</el-button>
        <el-button :type="layoutType === 'H5' ? 'info': ''" @click="changeLayoutType('H5')">
          {{i18nt('designer.toolbar.mobileLayout')}}</el-button>
      </el-button-group>
      <el-button style="margin-left: 20px" :title="i18nt('designer.toolbar.nodeTreeHint')" @click="showNodeTreeDrawer">
        <svg-icon icon-class="node-tree" /></el-button>
    </div>

    <el-drawer :title="i18nt('designer.toolbar.nodeTreeTitle')" direction="ltr" v-model="showNodeTreeDrawerFlag"
               :modal="true" :size="280" append-to-body
               :destroy-on-close="true" custom-class="node-tree-drawer">
      <el-tree ref="nodeTree" :data="nodeTreeData" node-key="id" default-expand-all highlight-current class="node-tree"
               icon-class="el-icon-arrow-right" @node-click="onNodeTreeClick"></el-tree>
    </el-drawer>

    <div class="right-toolbar" :style="{width: toolbarWidth + 'px'}">
      <div class="right-toolbar-con">
        <el-button v-if="showToolButton('clearDesignerButton')" type="text" @click="clearFormWidget">
          <svg-icon icon-class="el-delete" />{{i18nt('designer.toolbar.clear')}}</el-button>
        <el-button v-if="showToolButton('previewFormButton')" type="text" @click="previewForm">
          <svg-icon icon-class="el-view" />{{i18nt('designer.toolbar.preview')}}</el-button>
        <el-button v-if="showToolButton('importJsonButton')" type="text" @click="importJson">
          {{i18nt('designer.toolbar.importJson')}}</el-button>
        <el-button v-if="showToolButton('exportJsonButton')" type="text" @click="exportJson">
          {{i18nt('designer.toolbar.exportJson')}}</el-button>
        <el-button v-if="showToolButton('exportCodeButton')" type="text" @click="exportCode">
          {{i18nt('designer.toolbar.exportCode')}}</el-button>
        <el-button v-if="showToolButton('generateSFCButton')" type="text" @click="generateSFC">
          <svg-icon icon-class="vue-sfc" />{{i18nt('designer.toolbar.generateSFC')}}</el-button>
        <template v-for="(idx, slotName) in $slots">
          <slot :name="slotName"></slot>
        </template>
      </div>
    </div>

    <div v-if="showPreviewDialogFlag" class="" v-drag="['.drag-dialog.el-dialog', '.drag-dialog .el-dialog__header']">
      <el-dialog :title="i18nt('designer.toolbar.preview')" v-model="showPreviewDialogFlag"
                 :show-close="true" :close-on-click-modal="false" :close-on-press-escape="false" center
                 :destroy-on-close="true" :append-to-body="true" class="drag-dialog small-padding-dialog" width="75%"
                 :fullscreen="(layoutType === 'H5') || (layoutType === 'Pad')">
        <div>
          <div class="form-render-wrapper" :class="[layoutType === 'H5' ? 'h5-layout' : (layoutType === 'Pad' ? 'pad-layout' : '')]">
            <VFormRender ref="preForm" :form-json="formJson" :form-data="testFormData" :preview-state="true"
                         :option-data="testOptionData" :global-dsv="designerDsv"
                         @appendButtonClick="testOnAppendButtonClick" @buttonClick="testOnButtonClick"
                         @dataTableSelectionChange="testDTSC" @operationButtonClick="testOBC"
                         @myEmitTest="onMyEmitTest"
                         @formChange="handleFormChange">
            </VFormRender>
          </div>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="getFormData">{{i18nt('designer.hint.getFormData')}}</el-button>
            <el-button type="primary" @click="resetForm">{{i18nt('designer.hint.resetForm')}}</el-button>
            <el-button type="primary" @click="setFormDisabled">{{i18nt('designer.hint.disableForm')}}</el-button>
            <el-button type="primary" @click="setFormEnabled">{{i18nt('designer.hint.enableForm')}}</el-button>
            <el-button type="primary" plain @click="switchReadMode">{{i18nt('designer.hint.switchReadMode')}}</el-button>
            <el-button @click="showPreviewDialogFlag = false">{{i18nt('designer.hint.closePreview')}}</el-button>
            <el-button v-if="false" @click="testSetFormJson">setFormJson</el-button>
            <el-button v-if="false" @click="testSubFormHide">Test SFH</el-button>
            <el-button v-if="false" @click="testSetFormData">Test SFD</el-button>
          </div>
        </template>
      </el-dialog>
    </div>

    <div v-if="showImportJsonDialogFlag" class="" v-drag="['.drag-dialog.el-dialog', '.drag-dialog .el-dialog__header']">
      <el-dialog :title="i18nt('designer.toolbar.importJson')" v-model="showImportJsonDialogFlag"
                 :show-close="true" class="drag-dialog small-padding-dialog" :append-to-body="true" center
                 :close-on-click-modal="false" :close-on-press-escape="false" :destroy-on-close="true">
        <el-alert type="info" :title="i18nt('designer.hint.importJsonHint')" show-icon class="alert-padding"></el-alert>
        <code-editor :mode="'json'" :readonly="false" v-model="importTemplate"></code-editor>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="doJsonImport">
              {{i18nt('designer.hint.import')}}</el-button>
            <el-button @click="showImportJsonDialogFlag = false">
              {{i18nt('designer.hint.cancel')}}</el-button>
          </div>
        </template>
      </el-dialog>
    </div>

    <div v-if="showExportJsonDialogFlag" class="" v-drag="['.drag-dialog.el-dialog', '.drag-dialog .el-dialog__header']">
      <el-dialog :title="i18nt('designer.toolbar.exportJson')" v-model="showExportJsonDialogFlag"
                 :show-close="true" class="drag-dialog small-padding-dialog" center append-to-body
                 :close-on-click-modal="false" :close-on-press-escape="false" :destroy-on-close="true">
        <code-editor :mode="'json'" :readonly="true" v-model="jsonContent"></code-editor>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" class="copy-json-btn" :data-clipboard-text="jsonRawContent" @click="copyFormJson">
              {{i18nt('designer.hint.copyJson')}}</el-button>
            <el-button @click="saveFormJson">{{i18nt('designer.hint.saveFormJson')}}</el-button>
            <el-button @click="showExportJsonDialogFlag = false">
              {{i18nt('designer.hint.closePreview')}}</el-button>
          </div>
        </template>
      </el-dialog>
    </div>

    <div v-if="showExportCodeDialogFlag" class="" v-drag="['.drag-dialog.el-dialog', '.drag-dialog .el-dialog__header']">
      <el-dialog :title="i18nt('designer.toolbar.exportCode')" v-model="showExportCodeDialogFlag"
                 :show-close="true" class="drag-dialog small-padding-dialog" center append-to-body
                 width="65%" :close-on-click-modal="false" :close-on-press-escape="false" :destroy-on-close="true">
        <el-tabs type="border-card" class="no-box-shadow no-padding" v-model="activeCodeTab">
          <el-tab-pane label="Vue" name="vue">
            <code-editor :mode="'html'" :readonly="true" v-model="vueCode" :user-worker="false"></code-editor>
          </el-tab-pane>
          <el-tab-pane label="HTML" name="html">
            <code-editor :mode="'html'" :readonly="true" v-model="htmlCode" :user-worker="false"></code-editor>
          </el-tab-pane>
        </el-tabs>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" class="copy-vue-btn" :data-clipboard-text="vueCode" @click="copyVueCode">
              {{i18nt('designer.hint.copyVueCode')}}</el-button>
            <el-button type="primary" class="copy-html-btn" :data-clipboard-text="htmlCode" @click="copyHtmlCode">
              {{i18nt('designer.hint.copyHtmlCode')}}</el-button>
            <el-button @click="saveVueCode">{{i18nt('designer.hint.saveVueCode')}}</el-button>
            <el-button @click="saveHtmlCode">{{i18nt('designer.hint.saveHtmlCode')}}</el-button>
            <el-button @click="showExportCodeDialogFlag = false">
              {{i18nt('designer.hint.closePreview')}}</el-button>
          </div>
        </template>
      </el-dialog>
    </div>

    <div v-if="showFormDataDialogFlag" class="" v-drag="['.nested-drag-dialog.el-dialog', '.nested-drag-dialog .el-dialog__header']">
      <el-dialog :title="i18nt('designer.hint.exportFormData')" v-model="showFormDataDialogFlag"
                 :show-close="true" class="nested-drag-dialog dialog-title-light-bg" center
                 :close-on-click-modal="false" :close-on-press-escape="false" :destroy-on-close="true"
                 :append-to-body="true">
        <div style="border: 1px solid #DCDFE6">
          <code-editor :mode="'json'" :readonly="true" v-model="formDataJson"></code-editor>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" class="copy-form-data-json-btn" :data-clipboard-text="formDataRawJson" @click="copyFormDataJson">
              {{i18nt('designer.hint.copyFormData')}}</el-button>
            <el-button @click="saveFormData">{{i18nt('designer.hint.saveFormData')}}</el-button>
            <el-button @click="showFormDataDialogFlag = false">
              {{i18nt('designer.hint.closePreview')}}</el-button>
          </div>
        </template>
      </el-dialog>
    </div>

    <div v-if="showExportSFCDialogFlag" class="" v-drag="['.drag-dialog.el-dialog', '.drag-dialog .el-dialog__header']">
      <el-dialog :title="i18nt('designer.toolbar.generateSFC')" v-model="showExportSFCDialogFlag" append-to-body
                 v-if="showExportSFCDialogFlag" :show-close="true" class="drag-dialog small-padding-dialog" center
                 width="65%" :close-on-click-modal="false" :close-on-press-escape="false" :destroy-on-close="true">
        <el-tabs type="border-card" class="no-box-shadow no-padding" v-model="activeSFCTab">
          <el-tab-pane label="Vue2" name="vue2">
            <code-editor :mode="'html'" :readonly="true" v-model="sfcCode" :user-worker="false"></code-editor>
          </el-tab-pane>
          <el-tab-pane label="Vue3" name="vue3">
            <code-editor :mode="'html'" :readonly="true" v-model="sfcCodeV3" :user-worker="false"></code-editor>
          </el-tab-pane>
        </el-tabs>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" class="copy-vue2-sfc-btn" :data-clipboard-text="sfcCode" @click="copyV2SFC">
              {{i18nt('designer.hint.copyVue2SFC')}}</el-button>
            <el-button type="primary" class="copy-vue3-sfc-btn" :data-clipboard-text="sfcCodeV3" @click="copyV3SFC">
              {{i18nt('designer.hint.copyVue3SFC')}}</el-button>
            <el-button @click="saveV2SFC">{{i18nt('designer.hint.saveVue2SFC')}}</el-button>
            <el-button @click="saveV3SFC">{{i18nt('designer.hint.saveVue3SFC')}}</el-button>
            <el-button @click="showExportSFCDialogFlag = false">
              {{i18nt('designer.hint.closePreview')}}</el-button>
          </div>
        </template>
      </el-dialog>
    </div>

  </div>
</template>

<script>

  import { 
    getCurrentInstance, nextTick,
    ref,toRefs,reactive,
    inject,computed,
    onMounted
  } from 'vue'

  import VFormRender from '@/components/form-render/index'
  import CodeEditor from '@/components/code-editor/index'
  import SvgIcon from '@/components/svg-icon'
  import Clipboard from 'clipboard'
  import {
    deepClone,
    copyToClipboard,
    generateId,
    getQueryParam,
    traverseAllWidgets, addWindowResizeHandler
  } from "@/utils/util"
  import { useI18n } from '@/utils/i18n'
  import {generateCode} from "@/utils/code-generator"
  import {genSFC} from "@/utils/sfc-generator"
  import loadBeautifier from "@/utils/beautifierLoader"
  import { saveAs } from 'file-saver'

  export default {
    name: "ToolbarPanel",
    components: {
      VFormRender,
      CodeEditor,
      SvgIcon,
      Clipboard,
    },
    props: {
      designer: Object,
      globalDsv: {
        type: Object,
        default: () => ({})
      },
    },
    setup(props){
      const { i18nt }=useI18n();
      
      const { proxy } = getCurrentInstance()
      let $current=proxy;


      const getDesignerConfig=inject("getDesignerConfig");

      /* 页面组件 */
      const nodeTree=ref(null)
      const preForm=ref(null)


      const data=reactive({
        designerConfig: getDesignerConfig(),

        toolbarWidth: 420,
        showPreviewDialogFlag: false,
        showImportJsonDialogFlag: false,
        showExportJsonDialogFlag: false,
        showExportCodeDialogFlag: false,
        showFormDataDialogFlag: false,
        showExportSFCDialogFlag: false,
        showNodeTreeDrawerFlag: false,

        nodeTreeData: [],
        formReadonlyFlag: false,

        importTemplate: '',
        jsonContent: '',
        jsonRawContent: '',

        formDataJson: '',
        formDataRawJson: '',

        vueCode: '',
        htmlCode: '',

        sfcCode: '',
        sfcCodeV3: '',

        activeCodeTab: 'vue',
        activeSFCTab: 'vue2',

        testFormData: {
          // 'userName': '666888',
          // 'productItems': [
          //   {'pName': 'iPhone12', 'pNum': 10},
          //   {'pName': 'P50', 'pNum': 16},
          // ]

          'select62173': 2,
        },
        testOptionData: {
          // 'select62173': [
          //   {label: '01', value: 1},
          //   {label: '22', value: 2},
          //   {label: '333', value: 3},
          // ]

        },

      })

      onMounted(()=>{
          let maxTBWidth = data.designerConfig.toolbarMaxWidth || 450
          let minTBWidth = data.designerConfig.toolbarMinWidth || 300
          let newTBWidth = window.innerWidth - 260 - 300 - 320 - 80
          data.toolbarWidth = newTBWidth >= maxTBWidth ? maxTBWidth : (newTBWidth <= minTBWidth ? minTBWidth : newTBWidth)
          addWindowResizeHandler(() => {
            nextTick(() => {
              let newTBWidth2 = window.innerWidth - 260 - 300 - 320 - 80
              data.toolbarWidth = newTBWidth2 >= maxTBWidth ? maxTBWidth : (newTBWidth2 <= minTBWidth ? minTBWidth : newTBWidth2)
            })
          })
      })


      const formJson=computed(()=> {
        return {

          widgetList: deepClone(props.designer.widgetList),
          formConfig: deepClone(props.designer.formConfig)
        }
      })

      const undoDisabled=computed(()=> {
        return !props.designer.undoEnabled()
      })

      const redoDisabled=computed(()=> {
        return !props.designer.redoEnabled()
      })

      const layoutType=computed(()=> {
        return props.designer.getLayoutType()
      })

      const designerDsv=computed(()=> {
        return props.globalDsv
      })

    

      const showToolButton=(configName)=> {
        if (data.designerConfig[configName] === undefined) {
          return true
        }

        return !!props.designerConfig[configName]
      }

      const buildTreeNodeOfWidget=(widget, treeNode)=> {
          let curNode = {
            id: widget.id,
            label: widget.options.label || widget.type,
            //selectable: true,
          }
          treeNode.push(curNode)

          if (widget.category === undefined) {
            return
          }

          curNode.children = []
          if (widget.type === 'grid') {
            widget.cols.map(col => {
              let colNode = {
                id: col.id,
                label: col.options.name || widget.type,
                children: []
              }
              curNode.children.push(colNode)
              col.widgetList.map(wChild => {
                buildTreeNodeOfWidget(wChild, colNode.children)
              })
            })
          } else if (widget.type === 'table') {
            //TODO: 需要考虑合并单元格！！
            widget.rows.map(row => {
              let rowNode = {
                id: row.id,
                label: 'table-row',
                selectable: false,
                children: [],
              }
              curNode.children.push(rowNode)

              row.cols.map(cell => {
                if (!!cell.merged) {  //跳过合并单元格！！
                  return
                }

                let rowChildren = rowNode.children
                let cellNode = {
                  id: cell.id,
                  label: 'table-cell',
                  children: []
                }
                rowChildren.push(cellNode)

                cell.widgetList.map(wChild => {
                  buildTreeNodeOfWidget(wChild, cellNode.children)
                })
              })
            })
          } else if (widget.type === 'tab') {
            widget.tabs.map(tab => {
              let tabNode = {
                id: tab.id,
                label: tab.options.name || widget.type,
                selectable: false,
                children: []
              }
              curNode.children.push(tabNode)
              tab.widgetList.map(wChild => {
                buildTreeNodeOfWidget(wChild, tabNode.children)
              })
            })
          } else if (widget.type === 'sub-form') {
            widget.widgetList.map(wChild => {
              buildTreeNodeOfWidget(wChild, curNode.children)
            })
          } else if (widget.category === 'container') {  //自定义容器
            widget.widgetList.map(wChild => {
              buildTreeNodeOfWidget(wChild, curNode.children)
            })
          }
      }

      const refreshNodeTree=()=>{
        data.nodeTreeData.length = 0
        props.designer.widgetList.forEach(wItem => {
          buildTreeNodeOfWidget(wItem, data.nodeTreeData)
        })
      }

      const showNodeTreeDrawer=()=> {
        refreshNodeTree()
        data.showNodeTreeDrawerFlag = true
        nextTick(() => {
          if (!!props.designer.selectedId) {  //同步当前选中组件到节点树！！！
            nodeTree.value.setCurrentKey(props.designer.selectedId)
          }
        })
      }

      const undoHistory=()=> {
        props.designer.undoHistoryStep()
      }

      const redoHistory=()=> {
        props.designer.redoHistoryStep()
      }

      const changeLayoutType=(newType)=> {
        props.designer.changeLayoutType(newType)
      }

      const clearFormWidget=()=> {
        props.designer.clearDesigner()
      }

      const previewForm=()=> {
        data.showPreviewDialogFlag = true
      }

      const saveAsFile=(fileContent, defaultFileName)=>{
        $current.$prompt(i18nt('designer.hint.fileNameForSave'), i18nt('designer.hint.saveFileTitle'), {
          inputValue: defaultFileName,
          closeOnClickModal: false,
          inputPlaceholder: i18nt('designer.hint.fileNameInputPlaceholder')
        }).then(({ value }) => {
          if (!value) {
            value = defaultFileName
          }

          if (getQueryParam('vscode') == 1) {
            vsSaveFile(value, fileContent)
            return
          }

          const fileBlob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' })
          saveAs(fileBlob ,value)
        }).catch(() => {
          //
        })
      }

      const vsSaveFile=(fileName, fileContent)=> {
        const msgObj = {
          cmd: 'writeFile',
          data: {
            fileName,
            code: fileContent
          }
        }
        window.parent.postMessage(msgObj, '*')
      }

      const importJson=()=> {
        data.importTemplate = JSON.stringify(props.designer.getImportTemplate(), null, '  ')
        data.showImportJsonDialogFlag = true
      }

      const doJsonImport=()=> {
        try {
          let importObj = JSON.parse(data.importTemplate)
          //console.log('test import', this.importTemplate)
          if (!importObj || !importObj.formConfig) {
            throw new Error( i18nt('designer.hint.invalidJsonFormat') )
          }

          let fJsonVer = importObj.formConfig.jsonVersion
          if (!fJsonVer || (fJsonVer !== 3)) {
            throw new Error( i18nt('designer.hint.jsonVersionMismatch') )
          }

          props.designer.loadFormJson(importObj)

          data.showImportJsonDialogFlag = false
          $current.$message.success(i18nt('designer.hint.importJsonSuccess'))

          props.designer.emitHistoryChange()

          props.designer.emitEvent('form-json-imported', [])
        } catch(ex) {
          $current.$message.error(ex + '')
        }
      }

      const exportJson=()=>{
          let widgetList = deepClone(props.designer.widgetList)
          let formConfig = deepClone(props.designer.formConfig)
          data.jsonContent = JSON.stringify({widgetList, formConfig}, null, '  ')
          data.jsonRawContent = JSON.stringify({widgetList, formConfig})
          data.showExportJsonDialogFlag = true
      }

      const copyFormJson=(e)=>{
        copyToClipboard(data.jsonRawContent, e,
            $current.$message,
            i18nt('designer.hint.copyJsonSuccess'),
            i18nt('designer.hint.copyJsonFail')
        )
      }

      const saveFormJson=()=> {
          saveAsFile(data.jsonContent, `vform${generateId()}.json`)
      }

      const exportCode=()=> {
        data.vueCode = generateCode(data.formJson)
        data.htmlCode = generateCode(data.formJson, 'html')
        data.showExportCodeDialogFlag = true
      }

      const copyVueCode=(e)=> {
        copyToClipboard(data.vueCode, e,
            $current.$message,
            i18nt('designer.hint.copyVueCodeSuccess'),
            i18nt('designer.hint.copyVueCodeFail')
        )
      }

      const copyHtmlCode=(e)=> {
        copyToClipboard(data.htmlCode, e,
            $current.$message,
            i18nt('designer.hint.copyHtmlCodeSuccess'),
            i18nt('designer.hint.copyHtmlCodeFail')
        )
      }

      const saveVueCode=()=> {
        saveAsFile(data.vueCode, `vform${generateId()}.vue`)
      }

      const saveHtmlCode=()=> {
        saveAsFile(data.htmlCode, `vform${generateId()}.html`)
      }

      const generateSFC=()=> {
        loadBeautifier(beautifier => {
          data.sfcCode = genSFC(props.designer.formConfig, props.designer.widgetList, beautifier)
          data.sfcCodeV3 = genSFC(props.designer.formConfig, props.designer.widgetList, beautifier, true)
          data.showExportSFCDialogFlag = true
        })
      }

      const copyV2SFC=(e)=>{
        copyToClipboard(data.sfcCode, e,
            $current.$message,
            i18nt('designer.hint.copySFCSuccess'),
            i18nt('designer.hint.copySFCFail')
        )
      }

      const copyV3SFC=(e)=>{
        copyToClipboard(data.sfcCodeV3, e,
            $current.$message,
            i18nt('designer.hint.copySFCSuccess'),
            i18nt('designer.hint.copySFCFail')
        )
      }

      const saveV2SFC=()=>{
        saveAsFile(data.sfcCode, `vformV2-${generateId()}.vue`)
      }

      const saveV3SFC=()=>{
        saveAsFile(data.sfcCodeV3, `vformV3-${generateId()}.vue`)
      }

      const getFormData=()=>{
        preForm.value.getFormData().then(formData => {
          data.formDataJson = JSON.stringify(formData, null, '  ')
          data.formDataRawJson = JSON.stringify(formData)

          data.showFormDataDialogFlag = true
        }).catch(error => {
          console.log(error)
          $current.$message.error(error)
        })
      }

      const copyFormDataJson=(e)=>{
        copyToClipboard(data.formDataRawJson, e,
            $current.$message,
            i18nt('designer.hint.copyJsonSuccess'),
            i18nt('designer.hint.copyJsonFail')
        )
      }

      const saveFormData=()=>{
        saveAsFile(data.htmlCode, `formData${generateId()}.json`)
      }

      const resetForm=()=>{
        preForm.value.resetForm()
      }

      const setFormDisabled=()=>{
        preForm.value.disableForm()
      }

      const setFormEnabled=()=>{
        preForm.value.enableForm()
      }

      const switchReadMode=()=>{
        data.formReadonlyFlag = !data.formReadonlyFlag
        preForm.value.setReadMode(data.formReadonlyFlag)
      }

      const testSetFormJson=()=>{
        //let newJson = {"widgetList":[{"key":106933,"type":"input","icon":"text-field","formItemFlag":true,"options":{"name":"input40302","label":"input-new","labelAlign":"","type":"text","defaultValue":"","placeholder":"","columnWidth":"200px","size":"","labelWidth":null,"labelHidden":false,"readonly":false,"disabled":false,"hidden":false,"clearable":true,"showPassword":false,"required":false,"validation":"","validationHint":"","customClass":[],"labelIconClass":null,"labelIconPosition":"rear","labelTooltip":null,"minLength":null,"maxLength":null,"showWordLimit":false,"prefixIcon":"","suffixIcon":"","appendButton":false,"appendButtonDisabled":false,"buttonIcon":"custom-search","onCreated":"","onMounted":"","onInput":"","onChange":"","onFocus":"","onBlur":"","onValidate":""},"id":"input40302"}],"formConfig":{"modelName":"formData","refName":"vForm","rulesName":"rules","labelWidth":120,"labelPosition":"left","size":"","labelAlign":"label-left-align","cssCode":"","customClass":[],"functions":"","layoutType":"PC","jsonVersion":3,"onFormCreated":"","onFormMounted":"","onFormDataChange":""}}
        let newJson = {"widgetList":[{"key":75094,"type":"input","icon":"text-field","formItemFlag":true,"options":{"name":"input30696","label":"input","labelAlign":"","type":"text","defaultValue":"","placeholder":"","columnWidth":"200px","size":"","labelWidth":null,"labelHidden":false,"readonly":false,"disabled":false,"hidden":false,"clearable":true,"showPassword":false,"required":false,"validation":"","validationHint":"","customClass":[],"labelIconClass":null,"labelIconPosition":"rear","labelTooltip":null,"minLength":null,"maxLength":null,"showWordLimit":false,"prefixIcon":"","suffixIcon":"","appendButton":false,"appendButtonDisabled":false,"buttonIcon":"custom-search","onCreated":"","onMounted":"","onInput":"","onChange":"","onFocus":"","onBlur":"","onValidate":""},"id":"input30696"}],"formConfig":{"modelName":"formData","refName":"vForm","rulesName":"rules","labelWidth":120,"labelPosition":"left","size":"","labelAlign":"label-left-align","cssCode":"","customClass":"","functions":"","layoutType":"PC","jsonVersion":3,"onFormCreated":"","onFormMounted":"","onFormDataChange":""}}
        //let newJson = {"widgetList":[{"key":70118,"type":"input","icon":"text-field","formItemFlag":true,"options":{"name":"input37241","label":"input","labelAlign":"","type":"text","defaultValue":"","placeholder":"","columnWidth":"200px","size":"","labelWidth":null,"labelHidden":false,"readonly":false,"disabled":false,"hidden":false,"clearable":true,"showPassword":false,"required":false,"validation":"","validationHint":"","customClass":[],"labelIconClass":null,"labelIconPosition":"rear","labelTooltip":null,"minLength":null,"maxLength":null,"showWordLimit":false,"prefixIcon":"","suffixIcon":"","appendButton":false,"appendButtonDisabled":false,"buttonIcon":"custom-search","onCreated":"","onMounted":"","onInput":"","onChange":"","onFocus":"","onBlur":"","onValidate":""},"id":"input37241"}],"formConfig":{"modelName":"formData","refName":"vForm","rulesName":"rules","labelWidth":150,"labelPosition":"left","size":"","labelAlign":"label-right-align","cssCode":"","customClass":"","functions":"","layoutType":"PC","jsonVersion":3,"onFormCreated":"","onFormMounted":"","onFormDataChange":""}}
        preForm.setFormJson(newJson)
      }

      const testSubFormHide=()=>{
        preForm.hideWidgets('input73220')
      }

      const testSetFormData=()=>{
        let testFormData = {
          "picTest01": [
            {
              "name": "QQ浏览器截图20200730103242.png",
              "url": "http://image-2021.test.upcdn.net/QQ浏览器截图20200730103242.png"
            },
            {
              "name": "QQ浏览器截图20201218155618.jpg",
              "url": "http://image-2021.test.upcdn.net/QQ浏览器截图20201218155618.jpg"
            }
          ],
          "fileTest01": [
            {
              "name": "吉林大学2019-2020《公文写作》大作业.doc",
              "url": "http://image-2021.test.upcdn.net/吉林大学2019-2020《公文写作》大作业.doc"
            },
            {
              "name": "资源包抵扣明细.xlsx",
              "url": "http://image-2021.test.upcdn.net/资源包抵扣明细.xlsx"
            }
          ]
        }
        preForm.setFormData(testFormData)
      }

      const handleFormChange=(fieldName, newValue, oldValue, formModel)=>{
        /*
        console.log('---formChange start---')
        console.log('fieldName', fieldName)
        console.log('newValue', newValue)
        console.log('oldValue', oldValue)
        console.log('formModel', formModel)
        console.log('---formChange end---')
        */
      }

      const testOnAppendButtonClick=(clickedWidget) => {
        console.log('test', clickedWidget)
      }

      const testOnButtonClick=(button)=> {
        console.log('test', button)
      }

      const testDTSC=(dt, s1, s2)=> {
        console.log('test dt', dt)
        console.log('test s1', s1)
        console.log('test s2', s2)
      }

      const testOBC=(aa)=> {
        console.log('test=====', aa)
      }

      const onMyEmitTest=(aaa)=> {
        console.log('test emit', aaa)
      }

      const findWidgetById=(wId)=> {
        let foundW = null
        traverseAllWidgets(props.designer.widgetList, (w) => {
          if (w.id === wId) {
            foundW = w
          }
        })

        return foundW
      }

      const onNodeTreeClick=(nodeData, node, nodeEl)=> {
        //console.log('test', JSON.stringify(nodeData))

        if ((nodeData.selectable !== undefined) && !nodeData.selectable) {
          $current.$message.info(i18nt('designer.hint.currentNodeCannotBeSelected'))
        } else {
          const selectedId = nodeData.id
          const foundW = findWidgetById(selectedId)
          if (!!foundW) {
            props.designer.setSelected(foundW)
          }
        }
      
      }


      return {
        i18nt,

        ...toRefs(data),
        /* 页面组件 */
        nodeTree,
        preForm,

        /* 计算属性 */
        formJson,
        undoDisabled,
        redoDisabled,
        layoutType,
        designerDsv,


        
        /* 方法 */
        showToolButton,
        buildTreeNodeOfWidget,
        refreshNodeTree,
        showNodeTreeDrawer,

        undoHistory,
        redoHistory,

        changeLayoutType,
        clearFormWidget,
        previewForm,

        saveAsFile,

        importJson,
        doJsonImport,
        exportJson,
        copyFormJson,
        saveFormJson,
        exportCode,
        copyVueCode,
        copyHtmlCode,
        saveVueCode,
        saveHtmlCode,
        generateSFC,
        copyV2SFC,
        copyV3SFC,
        saveV2SFC,
        saveV3SFC,

        copyFormDataJson,
        saveFormData,
        resetForm,
        setFormDisabled,
        setFormEnabled,
        switchReadMode,

        getFormData,
        handleFormChange,
        findWidgetById,
        onNodeTreeClick,


        //测试的方法
        testSetFormJson,
        testSubFormHide,
        testSetFormData,
        testOnAppendButtonClick,
        testOnButtonClick,
        testDTSC,
        testOBC,
        onMyEmitTest



      }
    }
    
  }
</script>

<style lang="scss" scoped>
  div.toolbar-container {
    //min-width: 728px;  /* 解决工具按钮栏换行的问题！！ */
    /* 上一行css有问题，当窗口宽度不足时会把按钮挤出到右边的属性设置区，弃之！ */
  }

  .left-toolbar {
    display: flex;
    margin-top: 4px;
    float: left;
    font-size: 16px;
  }

  .right-toolbar {
    display: flex;
    margin-top: 5px;
    float: right;
    text-align: right;
    overflow: hidden;

    .right-toolbar-con {
      text-align: left;
      width: 600px;
    }

    :deep(.el-button) {
      margin-left: 10px;
    }

    :deep(.el-button--text) {
      font-size: 14px !important;
    }

    :deep(.svg-icon) {
      margin-left: 0;
      margin-right: 0.05em;
    }
  }

  .el-button i {
    margin-right: 3px;
  }

  .small-padding-dialog {
    :deep(.el-dialog__header) {
      //padding-top: 3px;
      //padding-bottom: 3px;
      background: #f1f2f3;
    }

    :deep(.el-dialog__body) {
      padding: 12px 15px 12px 15px;

      .el-alert.alert-padding {
        padding: 0 10px;
      }
    }

    :deep(.ace-container) {
      border: 1px solid #DCDFE6;
    }
  }

  .dialog-title-light-bg {
    :deep(.el-dialog__header) {
      background: #f1f2f3;
    }
  }

  .no-box-shadow {
    box-shadow: none;
  }

  .no-padding.el-tabs--border-card {
    :deep(.el-tabs__content) {
      padding: 0;
    }
  }

  .form-render-wrapper {
    //height: calc(100vh - 142px);
    //all: revert !important; /* 防止表单继承el-dialog等外部样式，未生效，原因不明？？ */
  }

  .form-render-wrapper.h5-layout {
    margin: 0 auto;
    width: 420px;
    border-radius: 15px;
    //border-width: 10px;
    box-shadow: 0 0 1px 10px #495060;
    height: calc(100vh - 175px);
    overflow-y: auto;
    overflow-x: hidden;
  }

  .form-render-wrapper.pad-layout {
    margin: 0 auto;
    width: 960px;
    border-radius: 15px;
    //border-width: 10px;
    box-shadow: 0 0 1px 10px #495060;
    height: calc(100vh - 175px);
    overflow-y: auto;
    overflow-x: hidden;
  }

  .node-tree-drawer {
    :deep(.el-drawer) {
      padding: 10px;
      overflow: auto;
    }

    :deep(.el-drawer__header) {
      margin-bottom: 12px;
      padding: 5px 5px 0;
    }

    :deep(.el-drawer__body) {
      padding-left: 5px;
    }
  }

  /*.node-tree-scroll-bar {*/
  /*  height: 100%;*/
  /*  overflow: auto;*/
  /*}*/

  :deep(.node-tree) {
    .el-tree > .el-tree-node:after {
      border-top: none;
    }
    .el-tree-node {
      position: relative;
      padding-left: 12px;
    }

    .el-tree-node__content {
      padding-left: 0 !important;
    }

    .el-tree-node__expand-icon.is-leaf{
      display: none;
    }

    .el-tree-node__children {
      padding-left: 12px;
      overflow: visible !important; /* 加入此行让el-tree宽度自动撑开，超出宽度el-draw自动出现水平滚动条！ */
    }

    .el-tree-node :last-child:before {
      height: 38px;
    }

    .el-tree > .el-tree-node:before {
      border-left: none;
    }

    .el-tree > .el-tree-node:after {
      border-top: none;
    }

    .el-tree-node:before {
      content: "";
      left: -4px;
      position: absolute;
      right: auto;
      border-width: 1px;
    }

    .el-tree-node:after {
      content: "";
      left: -4px;
      position: absolute;
      right: auto;
      border-width: 1px;
    }

    .el-tree-node:before {
      border-left: 1px dashed #4386c6;
      bottom: 0px;
      height: 100%;
      top: -10px;
      width: 1px;
    }

    .el-tree-node:after {
      border-top: 1px dashed #4386c6;
      height: 20px;
      top: 12px;
      width: 16px;
    }

    .el-tree-node.is-current > .el-tree-node__content {
      background: #c2d6ea !important;
    }

    .el-tree-node__expand-icon {
      margin-left: -3px;
      padding: 6px 6px 6px 0px;
      font-size: 16px;
    }

  }
</style>
