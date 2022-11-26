<template>
  <static-content-wrapper :designer="designer" :field="field" :design-state="designState" :display-style="field.options.displayStyle"
                     :parent-widget="parentWidget" :parent-list="parentList" :index-of-parent-list="indexOfParentList"
                     :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex" :sub-form-row-id="subFormRowId">
    <el-button ref="fieldEditor" :type="field.options.type" :size="field.options.size"
               :class="[(field.options.label === '') ? 'hide-text-span' : '']"
               :plain="field.options.plain" :round="field.options.round"
               :circle="field.options.circle" :icon="field.options.icon"
               :disabled="field.options.disabled"
               @click="handleButtonWidgetClick">
      {{field.options.label}}</el-button>
  </static-content-wrapper>
</template>

<script>
	import { onMounted, onBeforeUnmount } from 'vue'

  import StaticContentWrapper from './static-content-wrapper'

  import { useEmitter } from '@/utils/emitter'
  import { useI18n } from '@/utils/i18n'

  import { useField } from "@/components/form-designer/form-widget/field-widget/fieldMixin";

  export default {
    name: "button-widget",
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
      StaticContentWrapper,
    },
    setup(props){
 
      const { i18nt }=useI18n();
      const fieldMixin = useField(props,{});
      const emitterMixin =useEmitter();


      onMounted(()=>{
        fieldMixin.handleOnMounted()
      })

      onBeforeUnmount(()=>{
        fieldMixin.unregisterFromRefList()
      })


      fieldMixin.registerToRefList()
      fieldMixin.initEventHandler()
      fieldMixin.handleOnCreated()

      return {
        i18nt,
        ...fieldMixin,
        ...emitterMixin
      }

      
    }

  }
</script>

<style lang="scss" scoped>
  @import "../../../../styles/global.scss"; //* static-content-wrapper已引入，还需要重复引入吗？ *//

  .hide-text-span :deep(span) {
    display: none;
  }
</style>
