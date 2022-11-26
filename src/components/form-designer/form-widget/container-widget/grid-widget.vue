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

    <el-row :key="widget.id" :gutter="widget.options.gutter" class="grid-container"
            :class="[selected ? 'selected' : '', customClass]"
            @click.stop="selectWidget(widget)">
      <template v-for="(colWidget, colIdx) in widget.cols" :key="colWidget.id">
        <grid-col-widget :widget="colWidget" :designer="designer" :parent-list="widget.cols"
                         :index-of-parent-list="colIdx" :parent-widget="widget"
                         :col-height="widget.options.colHeight"></grid-col-widget>
      </template>
    </el-row>

  </container-wrapper>
</template>

<script>

	import { computed,toRefs,inject,reactive,nextTick } from 'vue'
  
  import { useI18n } from '@/utils/i18n'
  import GridColWidget from "@/components/form-designer/form-widget/container-widget/grid-col-widget"
  
  import { useContainer } from "@/components/form-designer/form-widget/container-widget/containerMixin";
  import ContainerWrapper from "@/components/form-designer/form-widget/container-widget/container-wrapper";
  

  export default {
    name: "grid-widget",
    componentName: 'ContainerWidget',
    components: {
      ContainerWrapper,
      GridColWidget
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

	    const selected=computed(()=> {
        return props.widget.id === props.designer.selectedId
      })
      const customClass=computed(()=> {
        return props.widget.options.customClass || ''
      })

       return {
        i18nt,

        ...containerMixin,

        selected,
        customClass,

      }
    }
  }
</script>

<style lang="scss" scoped>
  .el-row.grid-container {
    min-height: 50px;
    //line-height: 48px;
    //padding: 6px;
    outline: 1px dashed #336699;

    .form-widget-list {
      min-height: 28px;
    }

  }

  .grid-container.selected, .grid-cell.selected {
    outline: 2px solid $--color-primary !important;
  }

</style>
