<template>
  <div class="field-wrapper" :class="{'design-time-bottom-margin': !!designer}" :style="{display: displayStyle}">
    <div class="static-content-item" v-if="!field.options.hidden || (designState === true)" :style="{display: displayStyle}"
         :class="[selected ? 'selected' : '', customClass]" @click.stop="selectField(field)">
      <slot></slot>
    </div>

    <template v-if="!!designer">
      <div class="field-action" v-if="designer.selectedId === field.id">
        <i :title="i18nt('designer.hint.selectParentWidget')" @click.stop="selectParentWidget(field)">
          <svg-icon icon-class="el-back" />
        </i>
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
	import { computed, reactive, toRefs, onMounted, onBeforeUnmount } from 'vue'

  import SvgIcon from '@/components/svg-icon'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "static-content-wrapper",
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

      displayStyle: {
        type: String,
        default: 'block'
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
    setup(props){
      
      const { i18nt,i18n2t  }=useI18n();

      const selected=computed(()=>{
        return !!props.designer && props.field.id === props.designer.selectedId
      })

      const customClass=computed(()=>{
        return !!props.field.options.customClass ? props.field.options.customClass.join(' ') : ''
      })

      const selectField=(field)=> {
        if (!!props.designer) {
          props.designer.setSelected(field)
          props.designer.emitEvent('field-selected', this.parentWidget)  //发送选中组件的父组件对象
        }
      }

      const selectParentWidget=()=> {
        if (this.parentWidget) {
          props.designer.setSelected(this.parentWidget)
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
            if (!!this.parentWidget) {
              nextSelected = this.parentWidget
            }
          } else if (props.parentList.length === (1 + props.indexOfParentList)) {
            nextSelected = props.parentList[props.indexOfParentList - 1]
          } else {
            nextSelected = props.parentList[props.indexOfParentList + 1]
          }

          this.$nextTick(() => {
            props.parentList.splice(props.indexOfParentList, 1)
            //if (!!nextSelected) {
            props.designer.setSelected(nextSelected)
            //}

            props.designer.emitHistoryChange()
          })
        }
      }
      return {
        i18nt,i18n2t,
        ...toRefs(props),

        selected,
        customClass,

        selectField,
        selectParentWidget,
        moveUpWidget,
        moveDownWidget,
        removeFieldWidget
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
        margin: 0 5px;
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
      margin-left: 0.1em;
      margin-right: 0.1em;
    }
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
</style>
