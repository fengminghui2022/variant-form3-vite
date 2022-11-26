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

    <div :key="widget.id" class="tab-container"
         :class="{'selected': selected}" @click.stop="selectWidget(widget)">
      <el-tabs :type="widget.displayType" v-model="activeTab" @tab-click="onTabClick">

        <el-tab-pane v-for="(tab, index) in widget.tabs" :key="index" :label="tab.options.label" :name="tab.options.name"
                     @click.stop="selectWidget(widget)">
          <draggable :list="tab.widgetList" item-key="id" v-bind="{group:'dragGroup', ghostClass: 'ghost',animation: 200}"
                     handle=".drag-handler" tag="transition-group" :component-data="{name: 'fade'}"
                     @add="(evt) => onContainerDragAdd(evt, tab.widgetList)"
                     @update="onContainerDragUpdate" :move="checkContainerMove">
            <template #item="{ element: subWidget, index: swIdx }">
              <div class="form-widget-list">
                <template v-if="'container' === subWidget.category">
                  <component :is="subWidget.type + '-widget'" :widget="subWidget" :designer="designer" :key="subWidget.id" :parent-list="tab.widgetList"
                                    :index-of-parent-list="swIdx" :parent-widget="widget"></component>
                </template>
                <template v-else>
                  <component :is="subWidget.type + '-widget'" :field="subWidget" :designer="designer" :key="subWidget.id" :parent-list="tab.widgetList"
                                :index-of-parent-list="swIdx" :parent-widget="widget" :design-state="true"></component>
                </template>
              </div>
            </template>
          </draggable>
        </el-tab-pane>

      </el-tabs>
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
    name: "tab-widget",
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
      
      const { i18nt }=useI18n();
      const refList=inject('refList')

      const containerMixin = useContainer();
      const designRefMixin = useDesignRef(refList,props.widget);

      const data=reactive({
          activeTab: 'tab1',
      })

      const selected=computed(()=> {
        return props.widget.id === props.designer.selectedId
      })

      const customClass=computed(()=> {
        return props.widget.options.customClass || ''
      })
      

      designRefMixin.initRefList()

      const onTabClick=(evt)=>{
            let paneName = evt.name
            props.widget.tabs.forEach((tp) => {
              tp.options.active = tp.options.name === paneName;
            })
      }
      
      return{
        i18nt,
        ...designRefMixin,
        ...containerMixin,

        selected,
        customClass,

        onTabClick
      }
    }
  }
</script>

<style lang="scss" scoped>
  .tab-container {
    //padding: 5px;
    margin: 2px;

    .form-widget-list {
      min-height: 28px;
    }
  }

  .tab-container.selected {
    outline: 2px solid $--color-primary !important;
  }

</style>
