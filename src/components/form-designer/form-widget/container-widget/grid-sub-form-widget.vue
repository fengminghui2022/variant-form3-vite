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
  <container-wrapper :designer="designer" :widget="widget" :parent-widget="parentWidget" :parent-list="parentList"
                     :index-of-parent-list="indexOfParentList">

    <div :key="widget.id" class="sub-form-container"
         :class="{'selected': selected}" @click.stop="selectWidget(widget)">
      <div class="grid-sub-form">
        <draggable :list="widget.widgetList" item-key="id" v-bind="{group:'dragGroup', ghostClass: 'ghost',animation: 200}"
                   tag="transition-group" :component-data="{name: 'fade'}"
                   handle=".drag-handler"
                   @add="(evt) => onSubFormDragAdd(evt, widget.widgetList)"
                   @end="onSubFormDragEnd"
                   @update="onContainerDragUpdate" :move="checkContainerMove">
          <template #item="{ element: subWidget, index: swIdx }">
            <template v-if="'container' === subWidget.category">
              <component :is="subWidget.type + '-widget'" :widget="subWidget" :designer="designer" :key="subWidget.id" :parent-list="widget.widgetList"
                         :index-of-parent-list="swIdx" :parent-widget="widget"></component>
            </template>
          </template>
        </draggable>
      </div>
    </div>

  </container-wrapper>
</template>

<script>
	import { computed,toRefs,inject,provide ,reactive,nextTick } from 'vue'

  import { useI18n } from '@/utils/i18n'
  import ContainerWrapper from "@/components/form-designer/form-widget/container-widget/container-wrapper"
  import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'
  
  import { useContainer } from "@/components/form-designer/form-widget/container-widget/containerMixin";
	import { useDesignRef } from "@/components/form-designer/refMixinDesign"

  export default {
    name: "grid-sub-form-widget",
    componentName: 'ContainerWidget',
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
      
		  const refList=inject('refList')

      provide("getSubFormFieldFlag",() => true);
      provide("getSubFormName", () => props.widget.options.name);

      const { i18nt }=useI18n();
		  const containerMixin = useContainer();
		  const designRefMixin = useDesignRef(refList,props.widget);

      const selected=computed(()=> {
        return props.widget.id === props.designer.selectedId
      })

      const customClass=computed(()=> {
        return props.widget.options.customClass || ''
      })

      const onSubFormDragAdd=(evt, subList)=>{
        const newIndex = evt.newIndex
        if (!!subList[newIndex]) {
          props.designer.setSelected( subList[newIndex] )
        }

        props.designer.emitHistoryChange()
        props.designer.emitEvent('field-selected', props.widget)
      }

      const onSubFormDragEnd=(evt)=>{
      }

      designRefMixin.initRefList()
      return {
        i18nt,
        
        ...designRefMixin,
        ...containerMixin,

        selected,
        customClass,

        onSubFormDragAdd,
        onSubFormDragEnd
      }
    }
  }
</script>

<style lang="scss" scoped>
  .sub-form-container {
    //width: 100%;
    padding: 8px;
    border: 1px dashed #336699;

    :deep(.grid-sub-form) {
      min-height: 68px;
    }

    :deep(.ghost) {
      content: '';
      font-size: 0;
      height: 3px;
      width: 100%;
      //height: 74px;
      //width: 1px;
      box-sizing: border-box;
      display: inline-block;
      background: $--color-primary;
      border: 2px solid $--color-primary;
      outline-width: 0;
      padding: 0;
      margin: 0;
      overflow: hidden;
    }
  }

  .sub-form-container.selected {
    outline: 2px solid $--color-primary !important;
  }

</style>
