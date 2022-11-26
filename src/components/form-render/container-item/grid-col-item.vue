<template>
  <el-col class="grid-cell" :class="[customClass]" v-bind="layoutProps" :style="colHeightStyle"
          :key="widget.id" v-show="!widget.options.hidden">
    <template v-if="!!widget.widgetList && (widget.widgetList.length > 0)">
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
          <component :is="subWidget.type + '-widget'" :field="subWidget" :designer="null" :key="swIdx" :parent-list="widget.widgetList"
                     :index-of-parent-list="swIdx" :parent-widget="widget"
                     :sub-form-row-id="subFormRowId" :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex">
            <!-- 递归传递插槽！！！ -->
            <template v-for="slot in Object.keys($slots)" v-slot:[slot]="scope">
              <slot :name="slot" v-bind="scope"/>
            </template>
          </component>
        </template>
      </template>
    </template>
    <template v-else>
      <el-col>
        <div class="blank-cell"><span class="invisible-content">{{i18nt('render.hint.blankCellContent')}}</span></div>
      </el-col>
    </template>
  </el-col>
</template>

<script>
  import { inject, reactive, toRefs, computed, getCurrentInstance } from 'vue'

  import { useEmitter } from '@/utils/emitter'
  import { useI18n } from '@/utils/i18n'
  import { useRef } from "@/components/form-render/refMixin"
	import { useDesignRef } from "@/components/form-designer/refMixinDesign"

  import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'

  export default {
    name: "GridColItem",
    componentName: 'ContainerItem',
    components: {
      ...FieldComponents,
    },
    props: {
      widget: Object,
      parentWidget: Object,
      parentList: Array,
      indexOfParentList: Number,

      colHeight: {
        type: String,
        default: null
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
      
      const refList= inject('refList')
      const globalModel= inject('globalModel')
      const getFormConfig= inject('getFormConfig')
      const previewState= inject('previewState')

      const refMixin = useRef(props);
      const { i18nt }= useI18n();
      const { proxy } = getCurrentInstance()
		  const designRefMixin = useDesignRef(refList,props.widget);

      const formConfig=computed(()=> {
        return getFormConfig()
      })

      const customClass=computed(()=> {
        return props.widget.options.customClass || ''
      })

      const colHeightStyle=computed(()=> {
        return !!props.colHeight ? {height: props.colHeight + 'px'} : {}
      })


      const data=reactive({
        layoutProps: {
          span: props.widget.options.span,
          md: props.widget.options.md || 12,
          sm: props.widget.options.sm || 12,
          xs: props.widget.options.xs || 12,
          offset: props.widget.options.offset || 0,
          push: props.widget.options.push || 0,
          pull: props.widget.options.pull || 0,
        }
      })

      const initLayoutProps=()=> {
        if (!!props.widget.options.responsive) {
          if (!!previewState) {
            data.layoutProps.md = undefined
            data.layoutProps.sm = undefined
            data.layoutProps.xs = undefined

            let lyType = this.formConfig.layoutType
            if (lyType === 'H5') {
              data.layoutProps.span = props.widget.options.xs || 12
            } else if (lyType === 'Pad') {
              data.layoutProps.span = props.widget.options.sm || 12
            } else {
              data.layoutProps.span = props.widget.options.md || 12
            }
          } else {
            data.layoutProps.span = undefined
          }
        } else {
          data.layoutProps.md = undefined
          data.layoutProps.sm = undefined
          data.layoutProps.xs = undefined
        }
      }

      initLayoutProps()
      refMixin.initRefList()
      
      return {
        i18nt,
        ...toRefs(data),

        formConfig,
        customClass,
        colHeightStyle,

        ...refMixin
      }
    },
    computed: {
      

    },
    created() {
    
    },
    
    
  }
</script>

<style lang="scss" scoped>
  .blank-cell {
    font-style: italic;
    color: #cccccc;

    span.invisible-content {
      opacity: 0;
    }
  }
</style>
