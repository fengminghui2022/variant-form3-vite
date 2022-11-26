<template>
  <static-content-wrapper :designer="designer" :field="field" :design-state="designState"
                          :parent-widget="parentWidget" :parent-list="parentList" :index-of-parent-list="indexOfParentList"
                          :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex" :sub-form-row-id="subFormRowId">
    <div ref="fieldEditor" v-html="field.options.htmlContent"></div>
  </static-content-wrapper>
</template>

<script>
	import { reactive, toRefs, onMounted, onBeforeUnmount } from 'vue'

  import StaticContentWrapper from './static-content-wrapper'
  import { useEmitter } from '@/utils/emitter'
  import { useI18n } from '@/utils/i18n'
  import { useField } from "@/components/form-designer/form-widget/field-widget/fieldMixin";

  export default {
    name: "html-text-widget",
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
    computed: {

    },
    beforeCreate() {
      /* 这里不能访问方法和属性！！ */
    },
    setup(props) {
      
      const { i18nt }=useI18n();
      const fieldMixin = useField(props,{});


      onMounted(()=>{
        fieldMixin.handleOnMounted()
      })
      
      onBeforeUnmount(()=>{
        fieldMixin.unregisterFromRefList()
      })
      
      
      /* 注意：子组件mounted在父组件created之后、父组件mounted之前触发，故子组件mounted需要用到的prop
         需要在父组件created中初始化！！ */
      fieldMixin.registerToRefList()
      fieldMixin.initEventHandler()
      fieldMixin.handleOnCreated()

      return {
        i18nt,
        ...toRefs(props),
        ...fieldMixin
      }
    }
    

  }
</script>

<style lang="scss" scoped>
  @import "../../../../styles/global.scss"; //* static-content-wrapper已引入，还需要重复引入吗？ *//

</style>
