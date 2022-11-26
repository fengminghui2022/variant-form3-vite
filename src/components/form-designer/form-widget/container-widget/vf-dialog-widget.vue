<template>
  <container-wrapper :designer="designer" :widget="widget" :parent-widget="parentWidget" :parent-list="parentList"
                     :index-of-parent-list="indexOfParentList">

    <div class="dialog-container" :class="[selected ? 'selected' : '', customClass]"
         :key="widget.id" @click.stop="selectWidget(widget)">
      <draggable :list="widget.widgetList" item-key="id" v-bind="{group:'dragGroup', ghostClass: 'ghost',animation: 200}"
                 handle=".drag-handler" @end="(evt) => onDialogDragEnd(evt, widget.widgetList)"
                 @add="(evt) => onDialogDragAdd(evt, widget.widgetList)"
                 @update="onDialogDragUpdate" :move="checkContainerMove">
        <template #item="{ element: subWidget, index: swIdx }">
          <div class="vf-dialog-drop-zone">
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
    </div>

  </container-wrapper>
</template>

<script>
	import { computed,toRefs,inject,provide ,reactive,nextTick } from 'vue'
  import { useI18n } from '@/utils/i18n'

   import FieldComponents from "@/components/form-designer/form-widget/field-widget";
  import ContainerWrapper from "@/components/form-designer/form-widget/container-widget/container-wrapper";

	import { useDesignRef } from "@/components/form-designer/refMixinDesign"
 
  export default {
    name: "vf-dialog-widget",
    componentName: 'VfDialogWidget',
    inject: ['refList'],
    components: {
      ContainerWrapper,
      ...FieldComponents,
    },
    props: {
      widget: Object,
      parentWidget: Object,
      parentList: Array,
      indexOfParentList: Number,
      designer: Object,
    },
    setup(props){

      const { i18nt }=useI18n();
      const refList=inject('refList')

      const designRefMixin = useDesignRef(refList,props.widget);


      const selected=computed(()=> {
        return props.widget.id === props.designer.selectedId
      })

      const customClass=computed(()=> {
        return props.widget.options.customClass || ''
      })

      designRefMixin.initRefList()


      const onDialogDragEnd=(evt, subList) =>{
        //console.log('onDialogDragEnd', evt)
      }

      const onDialogDragAdd=(evt, subList)=> {
        const newIndex = evt.newIndex
        if (!!subList[newIndex]) {
          props.designer.setSelected( subList[newIndex] )
        }

        props.designer.emitHistoryChange()
        props.designer.emitEvent('field-selected', props.widget)
      }

      const onDialogDragUpdate=() =>{
        props.designer.emitHistoryChange()
      }

      const selectWidget=(widget)=> {
        console.log('id: ' + widget.id)
        props.designer.setSelected(widget)
      }

      const checkContainerMove=(evt)=> {
        //弹窗、抽屉不能嵌套！！
        return props.designer.checkWidgetMove(evt)
      }

      const selectParentWidget=() =>{
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

      return{
        i18nt,
        ...designRefMixin,

        selected,
        customClass,

        onDialogDragEnd,
        onDialogDragAdd,
        onDialogDragUpdate,
        selectWidget,
        checkContainerMove,
        selectParentWidget,

        moveUpWidget,
        moveDownWidget,
        removeWidget
      }
    },
    data() {
      return {
        //
      }
    },
    methods: {
      

    }
  }
</script>

<style lang="scss" scoped>
  .dialog-container {
    width: 100%;
    min-height: 120px;
    border: 2px dashed #cccccc;
    position: relative;

    .vf-dialog-drop-zone {
      min-height: 58px;
    }
  }

  .dialog-container > div:first-child {
    min-height: 58px;
  }

  .dialog-container.selected {
    outline: 2px solid $--color-primary !important;
  }

</style>
