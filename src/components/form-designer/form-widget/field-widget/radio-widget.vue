<template>
  <form-item-wrapper :designer="designer" :field="field" :rules="rules" :design-state="designState"
                     :parent-widget="parentWidget" :parent-list="parentList" :index-of-parent-list="indexOfParentList"
                     :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex" :sub-form-row-id="subFormRowId">
    <el-radio-group ref="fieldEditor" v-model="fieldModel" v-show="!isReadMode"
                    :disabled="field.options.disabled"
                    :style="{display: field.options.displayStyle + ' !important'}"
                    @change="handleChangeEvent">
      <template v-if="!!field.options.buttonStyle">
        <el-radio-button v-for="(item, index) in field.options.optionItems" :key="index" :label="item.value"
                         :disabled="item.disabled" :border="field.options.border"
                         :style="{display: field.options.displayStyle}">{{item.label}}</el-radio-button>
      </template>
      <template v-else>
        <el-radio v-for="(item, index) in field.options.optionItems" :key="index" :label="item.value"
                  :disabled="item.disabled" :border="field.options.border"
                  :style="{display: field.options.displayStyle}">{{item.label}}</el-radio>
      </template>
    </el-radio-group>
    <template v-if="isReadMode">
      <span class="readonly-mode-field">{{optionLabel}}</span>
    </template>
  </form-item-wrapper>
</template>

<script>
	import { computed, reactive, toRefs, onMounted, onBeforeUnmount } from 'vue'
  import FormItemWrapper from './form-item-wrapper'

  import { useEmitter } from '@/utils/emitter'
  import { useI18n } from '@/utils/i18n'

  import { useField } from "@/components/form-designer/form-widget/field-widget/fieldMixin";

  export default {
    name: "radio-widget",
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

      onMounted(()=>{
        fieldMixin.handleOnMounted()
      })
      
      onBeforeUnmount(()=>{
        fieldMixin.unregisterFromRefList()
      })

      fieldMixin.registerToRefList()
      fieldMixin.initOptionItems()
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
