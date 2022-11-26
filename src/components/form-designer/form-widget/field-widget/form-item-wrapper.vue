<!--
/**
 * author: vformAdmin
 * email: vdpadmin@163.com
 * website: https://www.vform666.com
 * date: 2021.08.18
 * remark: 如果要分发VForm源码，需在本文件顶部保留此文件头信息！！
 */
-->

<template>
  <div class="field-wrapper" :class="{'design-time-bottom-margin': !!designer}">
    <el-form-item v-if="!!field.formItemFlag && (!field.options.hidden || (designState === true))"
                  :label="label" :label-width="labelWidth + 'px'"
                  :title="field.options.labelTooltip"
                  :size="field.options.size"
                  :rules="rules" :prop="getPropName()"
                  :class="[selected ? 'selected' : '', labelAlign, customClass, field.options.required ? 'required' : '']"
                  @click.stop="selectField(field)">

      <template #label>
        <span v-if="!!field.options.labelIconClass" class="custom-label">
          <template v-if="field.options.labelIconPosition === 'front'">
            <template v-if="!!field.options.labelTooltip">
              <el-tooltip :content="field.options.labelTooltip" effect="light">
                <svg-icon :icon-class="field.options.labelIconClass" /></el-tooltip>{{label}}</template>
            <template v-else>
              <svg-icon :icon-class="field.options.labelIconClass" />{{label}}</template>
          </template>
          <template v-else-if="field.options.labelIconPosition === 'rear'">
            <template v-if="!!field.options.labelTooltip">
              {{label}}<el-tooltip :content="field.options.labelTooltip" effect="light">
              <svg-icon :icon-class="field.options.labelIconClass" /></el-tooltip></template>
            <template v-else>
              {{label}}<svg-icon :icon-class="field.options.labelIconClass" /></template>
          </template>
        </span>
      </template>
      <slot></slot>
    </el-form-item>

    <template v-if="!!designer">
      <div class="field-action" v-if="designer.selectedId === field.id">
        <i :title="i18nt('designer.hint.selectParentWidget')"
           @click.stop="selectParentWidget(field)"><svg-icon icon-class="el-back" /></i>
        <i v-if="!!parentList && (parentList.length > 1)" :title="i18nt('designer.hint.moveUpWidget')"
           @click.stop="moveUpWidget(field)"><svg-icon icon-class="el-move-up" /></i>
        <i v-if="!!parentList && (parentList.length > 1)" :title="i18nt('designer.hint.moveDownWidget')"
           @click.stop="moveDownWidget(field)"><svg-icon icon-class="el-move-down" /></i>
        <i :title="i18nt('designer.hint.remove')" @click.stop="removeFieldWidget">
          <svg-icon icon-class="el-delete" />
        </i>
      </div>

      <div class="drag-handler background-opacity" v-if="designer.selectedId === field.id">
        <i :title="i18nt('designer.hint.dragHandler')"><svg-icon icon-class="el-drag-move" /></i>
        <i>{{i18n2t(`designer.widgetLabel.${field.type}`, `extension.widgetLabel.${field.type}`)}}</i>
        <i v-if="field.options.hidden === true"><svg-icon icon-class="el-hide" /></i>
      </div>
    </template>
  </div>
</template>

<script>
  import SvgIcon from '@/components/svg-icon'
  import { useI18n } from '@/utils/i18n'
  import { computed,inject,toRefs } from 'vue-demi';

  export default {
    name: "form-item-wrapper",
    components: {
      SvgIcon
    },
    props: {
      field: Object,
      designer: Object,
      parentWidget: Object,
      parentList: Array,
      indexOfParentList: Number,

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

      rules: Array,
    },
    setup(props) {
     const { i18nt }=useI18n();

     const getFormConfig=inject('getFormConfig')
     const getSubFormFieldFlag=inject('getSubFormFieldFlag')
     const getSubFormName=inject('getSubFormName')


     const formConfig=computed(() =>{
        return getFormConfig()
      })

     const selected=computed(() =>{
        return !!props.designer && props.field.id === props.designer.selectedId
     })

     const label=computed(() =>{
        if (!!props.field.options.labelHidden) {
          return ''
        }

        return props.field.options.label
     })

    const labelWidth=computed(() =>{
        if (!!props.field.options.labelHidden) {
          return 0
        }

        if (!!props.field.options.labelWidth) {
          return props.field.options.labelWidth
        }

        if (!!props.designer) {
          return props.designer.formConfig.labelWidth
        } else {
          return formConfig.labelWidth
        }
     })

    const labelAlign=computed(() =>{
        if (!!props.field.options.labelAlign) {
          return props.field.options.labelAlign
        }

        if (!!props.designer) {
          return props.designer.formConfig.labelAlign || 'label-left-align'
        } else {
          return formConfig.labelAlign || 'label-left-align'
        }
     })

    const customClass=computed(() =>{
        return !!props.field.options.customClass ? props.field.options.customClass.join(' ') : ''
    })

     const subFormName=computed(() =>{
        return !!getFormConfig ? getFormConfig() : ''
    })

    const subFormItemFlag=computed(() =>{
        return !!getFormConfig ? getSubFormFieldFlag() : false
     })
     

    const selectField=(field)=> {
        if (!!props.designer) {
          props.designer.setSelected(field)
          props.designer.emitEvent('field-selected', props.parentWidget)  //发送选中组件的父组件对象
        }
    }

    const selectParentWidget=()=> {
        if (props.parentWidget) {
          props.designer.setSelected(props.parentWidget)
        } else {
          props.designer.clearSelected()
        }
    }

    const moveUpWidget=()=> {
        props.designer.moveUpWidget(props.parentList, props.indexOfParentList)
        props.designer.emitHistoryChange()
    }

    const moveDownWidget=()=> {
        props.designer.moveDownWidget(props.parentList, props.indexOfParentList)
        props.designer.emitHistoryChange()
    }

    const removeFieldWidget=()=> {
        if (!!props.parentList) {
          let nextSelected = null
          if (props.parentList.length === 1) {
            if (!!props.parentWidget) {
              nextSelected = props.parentWidget
            }
          } else if (props.parentList.length === (1 + props.indexOfParentList)) {
            nextSelected = props.parentList[props.indexOfParentList - 1]
          } else {
            nextSelected = props.parentList[props.indexOfParentList + 1]
          }

          nextTick(() => {
            props.parentList.splice(props.indexOfParentList, 1)
            //if (!!nextSelected) {
            props.designer.setSelected(nextSelected)
            //}

            props.designer.emitHistoryChange()
          })
        }
    }

    const getPropName=()=> {
        if (subFormItemFlag && !props.designState) {
          return subFormName + "." + props.subFormRowIndex + "." + props.field.options.name + ""
        } else {
          return props.field.options.name
        }
    }

    return {
       i18nt,
        ...toRefs(props),

        formConfig, 
        selected,
        label,
        labelWidth,
        labelAlign,
        customClass,
        subFormName,
        subFormItemFlag,

        selectField,
        selectParentWidget,
        moveUpWidget,
        moveDownWidget,
        removeFieldWidget,
        getPropName,
    }


    }
  }
</script>

<style lang="scss" scoped>
  @import "../../../../styles/global.scss";

  .design-time-bottom-margin {
    margin-bottom: 5px;
  }

  .field-wrapper {
    position: relative;

    .field-action{
      position: absolute;
      //bottom: -24px;
      bottom: 0;
      right: -2px;
      height: 22px;
      line-height: 22px;
      background: $--color-primary;
      z-index: 9;

      i {
        font-size: 14px;
        color: #fff;
        margin: 0 3px;
        cursor: pointer;
      }
    }

    .drag-handler {
      position: absolute;
      top: 0;
      //bottom: -22px;  /* 拖拽手柄位于组件下方，有时无法正常拖动，原因未明？？ */
      left: -1px;
      height: 20px;
      line-height: 20px;
      //background: $--color-primary;
      z-index: 9;

      i {
        font-size: 12px;
        font-style: normal;
        color: #fff;
        margin: 4px;
        cursor: move;
      }

      &:hover {
        //opacity: 1;
        background: $--color-primary;
      }
    }
  }

  .field-action, .drag-handler {
    :deep(.svg-icon) {
      margin-left: 0;
      margin-right: 0;
    }
  }

  .el-form-item {
    //margin-bottom: 0 !important;
    //margin-bottom: 6px;

    //margin-top: 2px;
    position: relative;

    :deep(.el-form-item__label) {
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    :deep(.el-form-item__content) {
      //position: unset;  /* TODO: 忘了这个样式设置是为了解决什么问题？？ */
    }

    span.custom-label i {
      margin: 0 3px;
    }

    /* 隐藏Chrome浏览器中el-input数字输入框右侧的上下调整小箭头 */
    :deep(.hide-spin-button) input::-webkit-outer-spin-button,
    :deep(.hide-spin-button) input::-webkit-inner-spin-button {
      -webkit-appearance: none !important;
    }

    /* 隐藏Firefox浏览器中el-input数字输入框右侧的上下调整小箭头 */
    :deep(.hide-spin-button) input[type="number"] {
      -moz-appearance: textfield;
    }
  }

  .required :deep(.el-form-item__label)::before {
    content: '*';
    color: #F56C6C;
    margin-right: 4px;
  }

  .static-content-item {
    min-height: 20px;
    display: flex;  /* 垂直居中 */
    align-items: center;  /* 垂直居中 */

    :deep(.el-divider--horizontal) {
      margin: 0;
    }
  }

  .el-form-item.selected, .static-content-item.selected {
    outline: 2px solid $--color-primary;
  }

  :deep(.label-left-align) .el-form-item__label {
    text-align: left;
    justify-content: flex-start !important;
  }

  :deep(.label-center-align) .el-form-item__label {
    text-align: center;
    justify-content: center !important;
  }

  :deep(.label-right-align) .el-form-item__label {
    text-align: right;
    justify-content: flex-end !important;
  }


</style>
