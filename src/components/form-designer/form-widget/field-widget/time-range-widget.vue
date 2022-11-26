<template>
  <form-item-wrapper :designer="designer" :field="field" :rules="rules" :design-state="designState"
                     :parent-widget="parentWidget" :parent-list="parentList" :index-of-parent-list="indexOfParentList"
                     :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex" :sub-form-row-id="subFormRowId">
    <div :class="[!!field.options.autoFullWidth ? 'auto-full-width' : '', isReadMode ? 'readonly-mode-time-range' : '']">
      <el-time-picker ref="fieldEditor" is-range v-model="fieldModel"
                      :class="[!!field.options.autoFullWidth ? 'full-width-input' : '']"
                      :disabled="field.options.disabled" :readonly="field.options.readonly"
                      :clearable="field.options.clearable" :editable="field.options.editable"
                      :format="field.options.format" value-format="HH:mm:ss"
                      :start-placeholder="field.options.startPlaceholder || i18nt('render.hint.startTimePlaceholder')"
                      :end-placeholder="field.options.endPlaceholder || i18nt('render.hint.endTimePlaceholder')"
                      @focus="handleFocusCustomEvent" @blur="handleBlurCustomEvent"
                      @change="handleChangeEvent">
      </el-time-picker>
      <template v-if="isReadMode">
        <span class="readonly-mode-field">{{contentForReadMode}}</span>
      </template>
    </div>
  </form-item-wrapper>
</template>

<script>
	import { computed, reactive, toRefs, onMounted, onBeforeUnmount } from 'vue'

  import FormItemWrapper from './form-item-wrapper'
  import { useEmitter } from '@/utils/emitter'
  import { useI18n } from '@/utils/i18n'

  import { useField } from "@/components/form-designer/form-widget/field-widget/fieldMixin";
  export default {
    name: "time-range-widget",
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
    },
     setup(props){
      
      const { i18nt }=useI18n();
      const emitterMixin =useEmitter();

      const data=reactive({
        oldFieldValue: null, //field组件change之前的值
        fieldModel: null,
        rules: [],
      })

      const fieldMixin = useField(props,data);

      const contentForReadMode=computed(()=>{
          if (!this.fieldModel) {
            return '--'
          } else {
            return this.fieldModel[0] + ' - ' + this.fieldModel[1]
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


      return {
         i18nt,
        ...toRefs(props),
        ...toRefs(data),
        ...fieldMixin
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../../../styles/global.scss"; /* form-item-wrapper已引入，还需要重复引入吗？ */

  .auto-full-width {
    width: 100%;

    :deep(.el-date-editor) {
      width: 100% !important;
      padding-left: 0;
      padding-right: 0;
    }

    :deep(.el-range__icon) {
      margin-left: 10px;
    }
  }

  .readonly-mode-time-range {
    :deep(.el-date-editor) {
      display: none;
    }
  }


</style>
