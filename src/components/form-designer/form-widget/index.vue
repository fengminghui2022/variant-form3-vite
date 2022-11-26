<template>
  <div class="form-widget-container">

    <el-form class="full-height-width widget-form" :label-position="labelPosition"
             :class="[customClass, layoutType + '-layout']" :size="size" :validate-on-rule-change="false">

      <template v-if="designer.widgetList.length === 0">
        <div class="no-widget-hint">{{i18nt('designer.noWidgetHint')}}</div>
      </template>

      <div class="form-widget-canvas" :style="{minHeight: canvasMinHeight}">
        <draggable :list="designer.widgetList" item-key="id" v-bind="{group:'dragGroup', ghostClass: 'ghost',animation: 300}"
                   tag="transition-group" :component-data="{name: 'fade'}"
                   handle=".drag-handler" @end="onDragEnd" @add="onDragAdd" @update="onDragUpdate" :move="checkMove">
          <template #item="{ element: widget, index }">
            <div class="transition-group-el">
              <template v-if="'container' === widget.category">
                <component :is="getWidgetName(widget)" :widget="widget" :designer="designer" :key="widget.id" :parent-list="designer.widgetList"
                                  :index-of-parent-list="index" :parent-widget="null"></component>
              </template>
              <template v-else>
                <component :is="getWidgetName(widget)" :field="widget" :designer="designer" :key="widget.id" :parent-list="designer.widgetList"
                              :index-of-parent-list="index" :parent-widget="null" :design-state="true"></component>
              </template>
            </div>
          </template>
        </draggable>
      </div>

    </el-form>

  </div>
</template>

<script>
  import { 
    computed, getCurrentInstance, reactive,ref ,nextTick,
    toRefs,provide,inject,watch,
    onMounted
  } from 'vue'

  import '@/components/form-designer/form-widget/container-widget/index'
  import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'
  import { useI18n } from '@/utils/i18n'

  export default {
    name: "VFormWidget",
    componentName: "VFormWidget",
    components: {
      ...FieldComponents,
    },
    props: {
      designer: Object,
      formConfig: Object,
      optionData: { //prop传入的选项数据
        type: Object,
        default: () => ({})
      },
      globalDsv: {
        type: Object,
        default: () => ({})
      },
    },
    setup(props){
      const { i18nt }=useI18n();
      
      const { proxy } = getCurrentInstance()
      let $current=proxy;

      const getDesignerConfig=inject("getDesignerConfig");
      
      const data=reactive({
        formModel: {},
        widgetRefList: {},
        dsResultCache: {},
      });


      provide('refList',data.widgetRefList)
      provide('getFormConfig', () => props.formConfig)  /* 解决provide传递formConfig属性的响应式更新问题！！ */
      provide('getGlobalDsv', () => props.globalDsv) // 全局数据源变量
      provide('globalOptionData', props.optionData)
      provide('getOptionData', () => props.optionData)
      provide('getReadMode', () => false)
      provide('globalModel', { formModel: data.formModel })
      provide('getSubFormFieldFlag', () => false)
      provide('getSubFormName', () => '')
      provide('getDSResultCache', () => data.dsResultCache)



      const labelPosition=computed(()=> {
        if (!!props.designer.formConfig && !!props.designer.formConfig.labelPosition) {
          return props.designer.formConfig.labelPosition
        }

        return 'left'
      })

      const size=computed(()=> {
        if (!!props.designer.formConfig && !!props.designer.formConfig.size) {
          return props.designer.formConfig.size
        }

        return 'default'
      })

      const customClass=computed(()=> {
        return props.designer.formConfig.customClass || ''
      })

      const layoutType=computed(()=> {
        return props.designer.getLayoutType()
      })

      const canvasMinHeight=computed(()=> {
        return (getDesignerConfig().logoHeader !== false) ? 'calc(100vh - 56px - 68px)' : 'calc(100vh - 56px - 68px + 48px)'
      })



      onMounted(()=> {
        disableFirefoxDefaultDrop()  /* 禁用Firefox默认拖拽搜索功能!! */
        props.designer.registerFormWidget($current)
      })



      const getWidgetName=(widget)=> {
        return widget.type + '-widget'
      }

      const  disableFirefoxDefaultDrop=()=> {
        let isFirefox = (navigator.userAgent.toLowerCase().indexOf("firefox") !== -1)
        if (isFirefox) {
          document.body.ondrop = function (event) {
            event.stopPropagation();
            event.preventDefault();
          }
        }
      }

      const onDragEnd=(evt)=> {
        //console.log('drag end000', evt)
      }

      const onDragAdd=(evt)=> {
        const newIndex = evt.newIndex
        if (!!props.designer.widgetList[newIndex]) {
          props.designer.setSelected( props.designer.widgetList[newIndex] )
        }

        props.designer.emitHistoryChange()
        props.designer.emitEvent('field-selected', null)
      }

      const onDragUpdate=()=> {  /* 在VueDraggable内拖拽组件发生位置变化时会触发update，未发生组件位置变化不会触发！！ */
        props.designer.emitHistoryChange()
      }

      const checkMove=(evt)=> {
        return props.designer.checkWidgetMove(evt)
      }

      const getFormData=()=> {
        return data.formModel
      }

      const getWidgetRef=(widgetName, showError = false)=>{
        let foundRef = data.widgetRefList[widgetName]
        if (!foundRef && !!showError) {
          $current.$message.error(this.i18nt('designer.hint.refNotFound') + widgetName)
        }
        return foundRef
      }

      const getSelectedWidgetRef=()=> {
        let wName = this.designer.selectedWidgetName
        return getWidgetRef(wName)
      }


      props.designer.loadPresetCssCode( getDesignerConfig().presetCssCode )
      return {
        i18nt,

        ...toRefs(data),

        labelPosition,
        size,
        customClass,
        layoutType,
        canvasMinHeight,

        getWidgetName, 
        disableFirefoxDefaultDrop,

        checkMove,
        onDragEnd,
        onDragAdd,
        onDragUpdate,

        getFormData,
        getWidgetRef,
        getSelectedWidgetRef
      }
    }   
      
  }
</script>

<style lang="scss" scoped>
  .container-scroll-bar {
    :deep(.el-scrollbar__wrap), :deep(.el-scrollbar__view) {
      overflow-x: hidden;
    }
  }

  .form-widget-container {
    padding: 10px;
    background: #f1f2f3;

    overflow-x: hidden;
    overflow-y: auto;

    .el-form.full-height-width {
      height: 100%;
      padding: 3px;
      background: #ffffff;

      .no-widget-hint {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-size: 18px;
        color: #999999;
      }

      .form-widget-canvas {
        //min-height: calc(100vh - 56px - 68px + 48px);
        padding: 3px;
      }
    }

    /* 隐藏组件拖拽状态中显示的黑点 */
    :deep(li.container-widget-item), :deep(li.field-widget-item) {
      list-style: none;
    }

    .el-form.PC-layout {
      //
    }

    .el-form.Pad-layout {
      margin: 0 auto;
      max-width: 960px;
      border-radius: 15px;
      box-shadow: 0 0 1px 10px #495060;
    }

    .el-form.H5-layout {
      margin: 0 auto;
      width: 420px;
      border-radius: 15px;
      //border-width: 10px;
      box-shadow: 0 0 1px 10px #495060;
    }

    .el-form.widget-form :deep(.el-row) {
      padding: 2px;
      border: 1px dashed rgba(170, 170, 170, 0.75);
    }
  }

  .grid-cell {
    min-height: 30px;
    border-right: 1px dotted #cccccc;

  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }

  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>
