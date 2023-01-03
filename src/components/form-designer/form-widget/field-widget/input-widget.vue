<template>
  <form-item-wrapper :designer="designer" :field="field" :rules="rules" :design-state="designState"
                     :parent-widget="parentWidget" :parent-list="parentList" :index-of-parent-list="indexOfParentList"
                     :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex" :sub-form-row-id="subFormRowId">
    <el-input ref="fieldEditor" v-model="fieldModel" v-show="!isReadMode"
              :disabled="field.options.disabled" :readonly="field.options.readonly"
              :size="field.options.size" class="hide-spin-button"
              :type="inputType"
              :show-password="field.options.showPassword"
              :placeholder="field.options.placeholder"
              :clearable="field.options.clearable"
              :minlength="field.options.minLength" :maxlength="field.options.maxLength"
              :show-word-limit="field.options.showWordLimit"
              :prefix-icon="field.options.prefixIcon" :suffix-icon="field.options.suffixIcon"
              @focus="handleFocusCustomEvent" @blur="handleBlurCustomEvent" @input="handleInputCustomEvent"
              @change="handleChangeEvent">
      <template #append v-if="field.options.appendButton">
        <el-button :disabled="field.options.disabled || field.options.appendButtonDisabled"
                   @click="emitAppendButtonClick"><svg-icon :icon-class="field.options.buttonIcon" /></el-button>
      </template>
    </el-input>
    <template v-if="isReadMode">
      <span class="readonly-mode-field">{{fieldModel}}</span>
    </template>
  </form-item-wrapper>
</template>

<script>
	import { computed, reactive, toRefs, onMounted, onBeforeUnmount } from 'vue'

  import FormItemWrapper from './form-item-wrapper'
  import SvgIcon from '@/components/svg-icon'
  import { useEmitter } from '@/utils/emitter'
  import { useI18n } from '@/utils/i18n'

  import { useField } from "@/components/form-designer/form-widget/field-widget/fieldMixin";

  export default {
    name: "input-widget",
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
      SvgIcon,
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

      const inputType=computed(()=> {
        if (props.field.options.type === 'number') {
          return 'text'  //当input的type设置为number时，如果输入非数字字符，则v-model拿到的值为空字符串，无法实现输入校验！故屏蔽之！！
        }
        return props.field.options.type
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

</style>
