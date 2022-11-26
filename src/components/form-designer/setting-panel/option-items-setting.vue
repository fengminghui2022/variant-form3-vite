<template>
  <div class="option-items-pane">
    <el-radio-group v-if="(selectedWidget.type === 'radio') || ((selectedWidget.type === 'select') && !selectedWidget.options.multiple)"
                    v-model="optionModel.defaultValue" @change="emitDefaultValueChange">
      <draggable tag="ul" :list="optionModel.optionItems" item-key="id"
                 v-bind="{group:'optionsGroup', ghostClass: 'ghost', handle: '.drag-option'}">
        <template #item="{ element: option, index: idx }">
          <li>
            <el-radio :label="option.value">
              <el-input v-model="option.value" size="small" style="width: 100px"></el-input>
              <el-input v-model="option.label" size="small" style="width: 100px"></el-input>
              <i class="iconfont icon-drag drag-option"></i>
              <el-button circle plain size="small" type="danger" @click="deleteOption(option, idx)"
                         icon="el-icon-minus" class="col-delete-button"></el-button>
            </el-radio>
          </li>
        </template>
      </draggable>
    </el-radio-group>
    <el-checkbox-group v-else-if="(selectedWidget.type === 'checkbox') || ((selectedWidget.type === 'select') && selectedWidget.options.multiple)"
                    v-model="optionModel.defaultValue" @change="emitDefaultValueChange">
      <draggable tag="ul" :list="optionModel.optionItems" item-key="id"
                 v-bind="{group:'optionsGroup', ghostClass: 'ghost', handle: '.drag-option'}">
        <template #item="{ element: option, index: idx }">
          <li>
            <el-checkbox :label="option.value">
              <el-input v-model="option.value" size="small" style="width: 100px"></el-input>
              <el-input v-model="option.label" size="small" style="width: 100px"></el-input>
              <i class="iconfont icon-drag drag-option"></i>
              <el-button circle plain size="small" type="danger" @click="deleteOption(option, idx)"
                         icon="el-icon-minus" class="col-delete-button"></el-button>
            </el-checkbox>
          </li>
        </template>
      </draggable>
    </el-checkbox-group>
    <div v-else-if="(selectedWidget.type === 'cascader')" class="full-width-input">
      <el-cascader v-model="optionModel.defaultValue" :options="optionModel.optionItems"
                   @change="emitDefaultValueChange"
                   :placeholder="i18nt('render.hint.selectPlaceholder')">
      </el-cascader>
    </div>
    <div v-if="(selectedWidget.type === 'cascader')">
      <el-button type="text" @click="importCascaderOptions">{{i18nt('designer.setting.importOptions')}}</el-button>
      <el-button type="text" @click="resetDefault">{{i18nt('designer.setting.resetDefault')}}</el-button>
    </div>

    <div v-if="(selectedWidget.type === 'radio') || (selectedWidget.type === 'checkbox') || (selectedWidget.type === 'select')">
      <el-button type="text" @click="addOption">{{i18nt('designer.setting.addOption')}}</el-button>
      <el-button type="text" @click="importOptions">{{i18nt('designer.setting.importOptions')}}</el-button>
      <el-button type="text" @click="resetDefault">{{i18nt('designer.setting.resetDefault')}}</el-button>
    </div>

    <div v-if="showImportDialogFlag" class="" v-drag="['.drag-dialog.el-dialog', '.drag-dialog .el-dialog__header']">
      <el-dialog :title="i18nt('designer.setting.importOptions')" v-model="showImportDialogFlag"
                 :show-close="true" custom-class="drag-dialog small-padding-dialog" append-to-body
                 :close-on-click-modal="false" :close-on-press-escape="false" :destroy-on-close="true">
        <el-form-item>
          <el-input type="textarea" rows="10" v-model="optionLines"></el-input>
        </el-form-item>
        <template #footer>
          <div class="dialog-footer">
            <el-button size="large" type="primary" @click="saveOptions">{{i18nt('designer.hint.confirm')}}</el-button>
            <el-button size="large" @click="showImportDialogFlag = false">{{i18nt('designer.hint.cancel')}}</el-button>
          </div>
        </template>
      </el-dialog>
    </div>

    <div v-if="showImportCascaderDialogFlag" class="" v-drag="['.drag-dialog.el-dialog', '.drag-dialog .el-dialog__header']">
      <el-dialog :title="i18nt('designer.setting.importOptions')" v-model="showImportCascaderDialogFlag"
                 :show-close="true" custom-class="drag-dialog small-padding-dialog" append-to-body
                 :close-on-click-modal="false" :close-on-press-escape="false" :destroy-on-close="true">
        <code-editor v-model="cascaderOptions" mode="json" :readonly="false"></code-editor>
        <template #footer>
          <div class="dialog-footer">
            <el-button size="large" type="primary" @click="saveCascaderOptions">{{i18nt('designer.hint.confirm')}}</el-button>
            <el-button size="large" @click="showImportCascaderDialogFlag = false">{{i18nt('designer.hint.cancel')}}</el-button>
          </div>
        </template>
      </el-dialog>
    </div>

  </div>
</template>

<script>
  import CodeEditor from '@/components/code-editor/index'
  import { getCurrentInstance,toRefs,nextTick } from 'vue'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "OptionItemsSetting",
    components: {
      CodeEditor,
    },
    props: {
      designer: Object,
      selectedWidget: Object,
    },
    setup(props){
      
      const { i18nt }=useI18n();
      
      const { proxy } = getCurrentInstance()

      const data=reactive({
        showImportDialogFlag: false,
        optionLines: '',

        cascaderOptions: '',
        showImportCascaderDialogFlag: false,

        //separator: '||',
        separator: ',',
      })

      const optionModel=computed(()=> {
        return props.selectedWidget.options
      })

      const emitDefaultValueChange=() =>{
        if (!!props.designer && !!props.designer.formWidget) {
          let fieldWidget = props.designer.formWidget.getWidgetRef(data.selectedWidget.options.name)
          console.log("123",props.designer.formWidget)
          if (!!fieldWidget && !!fieldWidget.refreshDefaultValue) {
            console.log("abc")
            fieldWidget.refreshDefaultValue()
          }
        }
      }

      const deleteOption=(option, index)=> {
        optionModel.optionItems.splice(index, 1)
      }

      const addOption=() =>{
        let newValue = optionModel.optionItems.length + 1
        optionModel.optionItems.push({
          value: newValue,
          label: 'new option'
        })
      }

      const importOptions=()=> {
        data.optionLines = ''
        if (optionModel.optionItems.length > 0) {
          optionModel.optionItems.forEach((opt) => {
            if (opt.value === opt.label) {
              data.optionLines += opt.value + '\n'
            } else {
              data.optionLines += opt.value + data.separator + opt.label + '\n'
            }
          })
        }

        data.showImportDialogFlag = true
      }

      const saveOptions=()=> {
        let lineArray = data.optionLines.split('\n')
        //console.log('test', lineArray)
        if (lineArray.length > 0) {
          optionModel.optionItems = []
          lineArray.forEach((optLine) => {
            if (!!optLine && !!optLine.trim()) {
              if (optLine.indexOf(data.separator) !== -1) {
                optionModel.optionItems.push({
                  value: optLine.split(data.separator)[0],
                  label: optLine.split(data.separator)[1]
                })
              } else {
                optionModel.optionItems.push({
                  value: optLine,
                  label: optLine
                })
              }
            }
          })
        } else {
          optionModel.optionItems = []
        }

        data.showImportDialogFlag = false
      }

      const resetDefault=() =>{
        if ((data.selectedWidget.type === 'checkbox') ||
            ((data.selectedWidget.type === 'select') && data.selectedWidget.options.multiple)) {
          optionModel.defaultValue = []
        } else {
          optionModel.defaultValue = ''
        }

        emitDefaultValueChange()
      }

      const importCascaderOptions=()=> {
        data.cascaderOptions = JSON.stringify(optionModel.optionItems, null, '  ')
        data.showImportCascaderDialogFlag = true
      }

      const saveCascaderOptions=()=> {
        try {
          let newOptions = JSON.parse(data.cascaderOptions)
          optionModel.optionItems = newOptions
          //TODO: 是否需要重置选项默认值？？

          data.showImportCascaderDialogFlag = false
        } catch (ex) {
          proxy.$message.error(i18nt('designer.hint.invalidOptionsData') + ex.message)
        }
      }


      return {
        i18nt,
        ...toRefs(data),

        optionModel,

        emitDefaultValueChange,

        deleteOption,
        addOption,
        importOptions,
        saveOptions,
        resetDefault,
        importCascaderOptions,
        saveCascaderOptions
      }

    }
  }
</script>

<style lang="scss" scoped>
  .option-items-pane {
    width: 100%;

    ul {
      padding-inline-start: 6px;
      padding-left: 6px; /* 重置IE11默认样式 */
    }
  }

  li.ghost{
    background: #fff;
    border: 2px dotted $--color-primary;
  }

  .drag-option {
    cursor: move;
  }

  .small-padding-dialog :deep(.el-dialog__body) {
    padding: 10px 15px;
  }

  .dialog-footer .el-button {
    width: 100px;
  }

  .full-width-input {
    width: 100% !important;

    :deep(.el-cascader) {
      width: 100% !important;
    }
  }

</style>
