<template>
  <el-col v-if="widget.type === 'grid-col'" class="grid-cell" v-bind="layoutProps"
          :class="[selected ? 'selected' : '', customClass]" :style="colHeightStyle"
          :key="widget.id" @click.stop="selectWidget(widget)">
    <draggable :list="widget.widgetList" item-key="id" v-bind="{group:'dragGroup', ghostClass: 'ghost',animation: 200}"
               tag="transition-group" :component-data="{name: 'fade'}"
               handle=".drag-handler" @end="(evt) => onGridDragEnd(evt, widget.widgetList)"
               @add="(evt) => onGridDragAdd(evt, widget.widgetList)"
               @update="onGridDragUpdate" :move="checkContainerMove">
      <template #item="{ element: subWidget, index: swIdx }">
        <div class="form-widget-list">
          <template v-if="'container' === subWidget.category">
            <component :is="subWidget.type + '-widget'" :widget="subWidget" :designer="designer" :key="subWidget.id" :parent-list="widget.widgetList"
                              :index-of-parent-list="swIdx" :parent-widget="widget"></component>
          </template>
          <template v-else>
            <component :is="subWidget.type + '-widget'" :field="subWidget" :designer="designer" :key="subWidget.id" :parent-list="widget.widgetList"
                          :index-of-parent-list="swIdx" :parent-widget="widget" :design-state="true"></component>
          </template>
        </div>
      </template>
    </draggable>

    <div class="grid-col-action" v-if="designer.selectedId === widget.id && widget.type === 'grid-col'">
      <i :title="i18nt('designer.hint.selectParentWidget')"
         @click.stop="selectParentWidget(widget)"><svg-icon icon-class="el-back" /></i>
      <i v-if="!!parentList && (parentList.length > 1)" :title="i18nt('designer.hint.moveUpWidget')"
         @click.stop="moveUpWidget()"><svg-icon icon-class="el-move-up" /></i>
      <i v-if="!!parentList && (parentList.length > 1)" :title="i18nt('designer.hint.moveDownWidget')"
         @click.stop="moveDownWidget()"><svg-icon icon-class="el-move-down" /></i>
      <i :title="i18nt('designer.hint.cloneWidget')" @click.stop="cloneGridCol(widget)">
        <svg-icon icon-class="el-clone" />
      </i>
      <i :title="i18nt('designer.hint.remove')" @click.stop="removeWidget">
        <svg-icon icon-class="el-delete" />
      </i>
    </div>

    <div class="grid-col-handler" v-if="designer.selectedId === widget.id && widget.type === 'grid-col'">
      <i>{{i18nt('designer.widgetLabel.' + widget.type)}}</i>
    </div>
  </el-col>
</template>

<script>

	import { computed,watch,toRefs,inject,reactive,nextTick } from 'vue'

  import { useI18n } from '@/utils/i18n'
  import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'
  import SvgIcon from '@/components/svg-icon'
  
	import { useDesignRef } from "@/components/form-designer/refMixinDesign"
  
  export default {
    name: "GridColWidget",
    componentName: "GridColWidget",
    components: {
      ...FieldComponents,
      SvgIcon,
    },
    props: {
      widget: Object,
      parentWidget: Object,
      parentList: Array,
      indexOfParentList: Number,
      designer: Object,

      colHeight: {
        type: String,
        default: null
      },

    },
    setup(props){
      
		  const refList=inject('refList')

      const { i18nt }=useI18n();
		  const designRefMixin = useDesignRef(refList,props.widget);

      

      const data=reactive({
          layoutProps: {
            span: props.widget.options.span || 12,
            // md: this.widget.options.md || 12,
            // sm: this.widget.options.sm || 12,
            // xs: this.widget.options.xs || 12,
            offset: props.widget.options.offset || 0,
            push: props.widget.options.push || 0,
            pull: props.widget.options.pull || 0,
          }
      })

      const selected=computed(()=> {
        return props.widget.id === props.designer.selectedId
      })

      const customClass=computed(()=> {
        return props.widget.options.customClass || ''
      })

      const colHeightStyle=computed(()=> {
        return !!props.colHeight ? {height: props.colHeight + 'px'} : {}
      })



      watch(()=>props.designer.formConfig.layoutType,(val)=> {
          if (!!props.widget.options.responsive) {
            if (val === 'H5') {
              data.layoutProps.span = props.widget.options.xs || 12
            } else if (val === 'Pad') {
              data.layoutProps.span = props.widget.options.sm || 12
            } else {
              data.layoutProps.span = props.widget.options.md || 12
            }
          } else {
            data.layoutProps.span = props.widget.options.span || 12
          }
      })

      watch(()=>props.widget.options.responsive,(val)=> {
          let lyType = props.designer.formConfig.layoutType
          if (!!val) {
            if (lyType === 'H5') {
              data.layoutProps.span = props.widget.options.xs || 12
            } else if (lyType === 'Pad') {
              data.layoutProps.span = props.widget.options.sm || 12
            } else {
              data.layoutProps.span = props.widget.options.md || 12
            }
          } else {
            data.layoutProps.span = props.widget.options.span || 12
          }
      })

      watch(()=>props.widget.options.span,(val)=>{
          data.layoutProps.span = val
      })

      watch(()=>props.widget.options.md,(val)=> {
          data.layoutProps.span = val
      })

      watch(()=>props.widget.options.sm,(val)=> {
          data.layoutProps.span = val
      })

      watch(()=>props.widget.options.xs,(val)=> {
          data.layoutProps.span = val
      })

      watch(()=>props.widget.options.offset,(val)=> {
          data.layoutProps.offset = val
      })

      watch(()=>props.widget.options.push,(val)=> {      
          data.layoutProps.push = val
      })

      watch(()=>props.widget.options.pull,(val)=> {  
          data.layoutProps.pull = val
      })




      const initLayoutProps=()=>{
        if (!!props.widget.options.responsive) {
          let lyType = props.designer.formConfig.layoutType
          if (lyType === 'H5') {
            data.layoutProps.span = props.widget.options.xs || 12
          } else if (lyType === 'Pad') {
            data.layoutProps.span = props.widget.options.sm || 12
          } else {
            data.layoutProps.span = props.widget.options.md || 12
          }
        } else {
          data.layoutProps.spn = props.widget.options.span
        }
      }

      const onGridDragEnd=(evt, subList)=> {
        //
      }

      const onGridDragAdd=(evt, subList)=> {
        const newIndex = evt.newIndex
        if (!!subList[newIndex]) {
          props.designer.setSelected( subList[newIndex] )
        }

        props.designer.emitHistoryChange()
        props.designer.emitEvent('field-selected', props.widget)
      }

      const onGridDragUpdate=()=> {
        props.designer.emitHistoryChange()
      }

      const selectWidget=(widget)=> {
        console.log('id: ' + widget.id)
        props.designer.setSelected(widget)
      }

      const checkContainerMove=(evt)=> {
        return props.designer.checkWidgetMove(evt)
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
      }

      const moveDownWidget=()=> {
        props.designer.moveDownWidget(props.parentList, props.indexOfParentList)
      }

      const cloneGridCol=(widget)=> {
        props.designer.cloneGridCol(widget, props.parentWidget)
      }

      const removeWidget=()=> {
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


      designRefMixin.initRefList()
      initLayoutProps()
  
      return {
        i18nt,
        ...toRefs(data),
        
        ...designRefMixin,

        selected,
        customClass,
        colHeightStyle,

        initLayoutProps,

        selectWidget,
        selectParentWidget,


        checkContainerMove,
        onGridDragEnd,
        onGridDragUpdate,
        onGridDragAdd,

        moveUpWidget,
        moveDownWidget,

        cloneGridCol,
        removeWidget,

      }
    }
  }
</script>

<style lang="scss" scoped>
  .grid-cell {
    min-height: 38px !important;
    //margin: 6px 0;  /* 设置了margin，栅格列的offset、push、pull会失效！！ */
    padding: 3px;
    outline: 1px dashed #336699;
    position: relative;

    .form-widget-list {
      min-height: 28px;
    }

    .grid-col-action{
      position: absolute;
      bottom: 0;
      right: -2px;
      height: 28px;
      line-height: 28px;
      background: $--color-primary;
      z-index: 999;

      i {
        font-size: 14px;
        color: #fff;
        margin: 0 5px;
        cursor: pointer;
      }
    }

    .grid-col-handler {
      position: absolute;
      top: -2px;
      left: -2px;
      height: 22px;
      line-height: 22px;
      background: $--color-primary;
      z-index: 9;

      i {
        font-size: 14px;
        font-style: normal;
        color: #fff;
        margin: 4px;
        cursor: default;
      }
    }
  }

  .grid-col-action, .grid-col-handler {
    :deep(.svg-icon) {
      margin-left: 0.1em;
      margin-right: 0.1em;
    }
  }

</style>
