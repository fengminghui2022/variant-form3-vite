<template>
  <form-item-wrapper :designer="designer" :field="field" :rules="rules" :design-state="designState"
                     :parent-widget="parentWidget" :parent-list="parentList" :index-of-parent-list="indexOfParentList"
                     :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex" :sub-form-row-id="subFormRowId">

    <div :class="{'readonly-mode-rich-editor': isReadMode}">
      <quill-editor
              ref="fieldEditor"
              v-model:value="fieldModel"
              :options="editorOption"
              :disabled="field.options.disabled || isReadMode"
              @blur="handleRichEditorBlurEvent"
              @focus="handleRichEditorFocusEvent"
              @change="handleRichEditorChangeEvent"
              :style="!!field.options.contentHeight ? `height: ${field.options.contentHeight};`: ''"></quill-editor>
    </div>

  </form-item-wrapper>
</template>

<script>
	import { computed, reactive, toRefs, onMounted, onBeforeUnmount } from 'vue'
  import FormItemWrapper from './form-item-wrapper'
  import { useEmitter } from '@/utils/emitter'
  import { useI18n } from '@/utils/i18n'

  import { useField } from "@/components/form-designer/form-widget/field-widget/fieldMixin";

  import { deepClone } from "@/utils/util"
  import { Quill, quillEditor } from 'vue3-quill'

  export default {
    name: "rich-editor-widget",
    componentName: 'FieldWidget',  //必须固定为FieldWidget，用于接收父级组件的broadcast事件
    props: {
      field: Object,
      parentWidget: Object,
      parentList: Array,
      indexOfParentList: Number,
      designer: Object,

      designState: {
        type: Boolean,
        default: false
      },

      subFormRowIndex: { /* 子表单组件行索引，从0开始计数 */
        type: Number,
        default: -1
      },
      subFormColIndex: { /* 子表单组件列索引，从0开始计数 */
        type: Number,
        default: -1
      },
      subFormRowId: { /* 子表单组件行Id，唯一id且不可变 */
        type: String,
        default: ''
      },

    },
    components: {
      FormItemWrapper,
      quillEditor,
    },
     setup(props){
      
      const { i18nt }=useI18n();
      const emitterMixin =useEmitter();

      const data=reactive({
        oldFieldValue: null, //field组件change之前的值
        fieldModel: null,
        rules: [],

        customToolbar: [], //富文本编辑器自定义工具栏
        valueChangedFlag: false, //vue2-editor数据值是否改变标志
      })

      const fieldMixin = useField(props,data);

      const editorOption=computed(()=> {
        return {
          placeholder: props.field.options.placeholder,
          modules: {
            //toolbar: this.customToolbar
          }
        }
      })

      onMounted(()=>{
        fieldMixin.handleOnMounted()
      })
      
      onBeforeUnmount(()=>{
        fieldMixin.unregisterFromRefList()
      })

      fieldMixin.registerToRefList()
      fieldMixin.initFieldModel()
      fieldMixin.initEventHandler()
      fieldMixin.buildFieldRules()

      fieldMixin.handleOnCreated()

      const handleRichEditorChangeEvent=()=> {
        data.valueChangedFlag = true
        fieldMixin.syncUpdateFormModel(fieldMixin.fieldModel)
      }

      const handleRichEditorFocusEvent=()=> {
        data.oldFieldValue = deepClone(fieldMixin.fieldModel)
      }

      const handleRichEditorBlurEvent=()=> {
        if (data.valueChangedFlag) {
          fieldMixin.emitFieldDataChange(data.fieldModel, data.oldFieldValue)
          data.valueChangedFlag = false
        }
      }

      return {
         i18nt,
        ...toRefs(props),
        ...toRefs(data),
        ...fieldMixin,

        editorOption,

        handleRichEditorChangeEvent,
        handleRichEditorFocusEvent,
        handleRichEditorBlurEvent
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../../../styles/global.scss"; /* form-item-wrapper已引入，还需要重复引入吗？ */

  .full-width-input {
    width: 100% !important;
  }

  .readonly-mode-rich-editor {
    :deep(.ql-toolbar) {
      display: none;
    }

    :deep(.ql-container) {
      //border-top: 1px solid #cccccc !important;
      border: 0;
    }
  }

</style>
