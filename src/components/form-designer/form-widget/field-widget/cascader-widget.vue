<template>
  <form-item-wrapper :designer="designer" :field="field" :rules="rules" :design-state="designState"
                     :parent-widget="parentWidget" :parent-list="parentList" :index-of-parent-list="indexOfParentList"
                     :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex" :sub-form-row-id="subFormRowId">
    <div class="full-width-input" :class="{'readonly-mode-cascader' : isReadMode}">
      <el-cascader ref="fieldEditor" :options="field.options.optionItems" v-model="fieldModel"
                   :disabled="field.options.disabled"
                   :clearable="field.options.clearable"
                   :filterable="field.options.filterable"
                   :placeholder="field.options.placeholder || i18nt('render.hint.selectPlaceholder')"
                   :show-all-levels="showFullPath"
                   :props="{ checkStrictly: field.options.checkStrictly, multiple: field.options.multiple, expandTrigger: 'hover', value: valueKey, label: labelKey, children: childrenKey }"
                   @visible-change="hideDropDownOnClick" @expand-change="hideDropDownOnClick"
                   @focus="handleFocusCustomEvent" @blur="handleBlurCustomEvent"
                   @change="handleChangeEvent">
      </el-cascader>
      <template v-if="isReadMode">
        <span class="readonly-mode-field">{{contentForReadMode}}</span>
      </template>
    </div>
  </form-item-wrapper>
</template>

<script>
	import { reactive,ref , toRefs, computed, onMounted, onBeforeUnmount } from 'vue'
  import FormItemWrapper from './form-item-wrapper'
  import { useEmitter } from '@/utils/emitter'
  import { useI18n } from '@/utils/i18n'  
  import { useField } from "@/components/form-designer/form-widget/field-widget/fieldMixin";

  export default {
    name: "cascader-widget",
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

      const fieldEditor=ref(null);

      const data=reactive({
        oldFieldValue: null, //field组件change之前的值
        fieldModel: null,
        rules: [],
      })

      
      const fieldMixin = useField(props,data);

      const labelKey=computed(()=> {
        return props.field.options.labelKey || 'label'
      })

      const valueKey=computed(()=> {
        return props.field.options.valueKey || 'value'
      })

      const childrenKey=computed(()=> {
        return props.field.options.childrenKey || 'children'
      })

      const showFullPath=computed(()=> {
        return (props.field.options.showAllLevels === undefined) || !!props.field.options.showAllLevels
      })

      const contentForReadMode=computed(()=> {
        if (!!props.field.options.multiple) {
          //console.log('test======', props.$refs.fieldEditor.presentTags)
          const curTags = fieldEditor.presentTags
          if (!curTags || (curTags.length <= 0)) {
            return '--'
          } else {
            return curTags.map(tagItem => tagItem.text).join(', ')
          }
        } else {
          return fieldEditor.presentText || '--'
        }
      })



      fieldMixin.registerToRefList()
      fieldMixin.initOptionItems()
      fieldMixin.initFieldModel()
      fieldMixin.initEventHandler()
      fieldMixin.buildFieldRules()

      fieldMixin.handleOnCreated()

      onMounted(()=>{
        fieldMixin.handleOnMounted()
      })
      
      onBeforeUnmount(()=>{
        fieldMixin.unregisterFromRefList()
      })

      const hideDropDownOnClick=()=>{
        setTimeout(() => {
          document.querySelectorAll(".el-cascader-panel .el-radio").forEach((el) => {
            el.onclick = () => {
              console.log('test====', 1111)
              fieldEditor.popperVisible = false // 单选框部分点击隐藏下拉框
            }
          })
        }, 100)
      }

      return {
        i18nt,
        fieldEditor,
        ...toRefs(props),
        ...toRefs(data),
        ...fieldMixin,

        labelKey,
        valueKey,
        childrenKey,
        showFullPath,
        contentForReadMode,

        hideDropDownOnClick
      }

    }
  }
</script>

<style lang="scss" scoped>
  @import "../../../../styles/global.scss"; /* form-item-wrapper已引入，还需要重复引入吗？ */

  .full-width-input {
    width: 100% !important;

    :deep(.el-cascader) {
      width: 100% !important;
    }
  }

  .readonly-mode-cascader :deep(.el-cascader) {
    display: none;
  }

</style>
