<template>
  <td class="table-cell" :class="[customClass]"
      :colspan="widget.options.colspan || 1" :rowspan="widget.options.rowspan || 1"
      :style="{width: widget.options.cellWidth + ' !important' || '', height: widget.options.cellHeight + ' !important' || ''}">
    <template v-for="(subWidget, swIdx) in widget.widgetList">
      <template v-if="'container' === subWidget.category">
        <component :is="getComponentByContainer(subWidget)" :widget="subWidget" :key="swIdx" :parent-list="widget.widgetList"
                   :index-of-parent-list="swIdx" :parent-widget="widget"
                   :sub-form-row-id="subFormRowId" :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex">
          <!-- 递归传递插槽！！！ -->
          <template v-for="slot in Object.keys($slots)" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope"/>
          </template>
        </component>
      </template>
      <template v-else>
        <component :is="subWidget.type + '-widget'" :field="subWidget" :key="swIdx" :parent-list="widget.widgetList"
                   :index-of-parent-list="swIdx" :parent-widget="widget"
                   :sub-form-row-id="subFormRowId" :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex">
          <!-- 递归传递插槽！！！ -->
          <template v-for="slot in Object.keys($slots)" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope"/>
          </template>
        </component>
      </template>
    </template>
  </td>
</template>

<script>

  import { provide, inject, reactive, toRefs, computed,nextTick, getCurrentInstance, onMounted, onBeforeUnmount  } from 'vue'
  import { useEmitter } from '@/utils/emitter'
  import { useI18n } from '@/utils/i18n'
  import { useRef } from "@/components/form-render/refMixin"

  import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'

  export default {
    name: "TableCellItem",
    componentName: "ContainerItem",
    components: {
      ...FieldComponents,
    },
    props: {
      widget: Object,

      rowIndex: Number,
      colIndex: Number,

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
      const { i18nt }= useI18n();
  		const { proxy } = getCurrentInstance()
      
      const refList=inject('refList')
      const globalModel=inject('globalModel')

      
      const refMixin = useRef(props);
      const customClass=computed(()=> {
        return proxy.widget.options.customClass || ''
      })

      return {
        i18nt,
        ...toRefs(props),

        customClass,
        ...refList
      }
    }
  }
</script>

<style lang="scss" scoped>
  td.table-cell {
    display: table-cell;
    height: 36px;
    //border: 1px dashed #336699;
    border: 1px solid #e5e5e5;
  }

</style>
