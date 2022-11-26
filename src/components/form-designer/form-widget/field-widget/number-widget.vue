<template>
  <form-item-wrapper :designer="designer" :field="field" :rules="rules" :design-state="designState"
                     :parent-widget="parentWidget" :parent-list="parentList" :index-of-parent-list="indexOfParentList"
                     :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex" :sub-form-row-id="subFormRowId">
    <el-input-number ref="fieldEditor" v-model="fieldModel" v-show="!isReadMode" class="full-width-input"
                     :disabled="field.options.disabled"
                     :controls-position="field.options.controlsPosition"
                     :placeholder="field.options.placeholder"
                     :min="field.options.min" :max="field.options.max"
                     :precision="field.options.precision" :step="field.options.step"
                     @focus="handleFocusCustomEvent" @blur="handleBlurCustomEvent"
                     @change="handleChangeEvent">
    </el-input-number>
    <template v-if="isReadMode">
      <span class="readonly-mode-field">{{fieldModel}}</span>
    </template>
  </form-item-wrapper>
</template>

<script>
	import { reactive, toRefs, onMounted, onBeforeUnmount } from 'vue'

  import FormItemWrapper from './form-item-wrapper'
  import { useEmitter } from '@/utils/emitter'
  import { useI18n } from '@/utils/i18n'

  import { useField } from "@/components/form-designer/form-widget/field-widget/fieldMixin";

  export default {
    name: "number-widget",
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
    setup(props) {
      const { i18nt }=useI18n();
      const emitterMixin =useEmitter();

      const data=reactive({
        oldFieldValue: null, //field组件change之前的值
        fieldModel: null,
        rules: [],
      })

      const fieldMixin = useField(props,data);
      
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

  .full-width-input {
    width: 100% !important;
  }

</style>
