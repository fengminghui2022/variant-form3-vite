<template>
  <td class="table-cell" :class="[selected ? 'selected' : '', customClass]"
      :style="{width: widget.options.cellWidth + '!important' || '', height: widget.options.cellHeight + '!important' || ''}"
      :colspan="widget.options.colspan || 1" :rowspan="widget.options.rowspan || 1"
      @click.stop="selectWidget(widget)">
    <draggable :list="widget.widgetList" item-key="id" v-bind="{group:'dragGroup', ghostClass: 'ghost',animation: 200}"
               tag="transition-group" :component-data="{name: 'fade'}"
               handle=".drag-handler" @end="(evt) => onTableDragEnd(evt, widget.widgetList)"
               @add="(evt) => onTableDragAdd(evt, widget.widgetList)"
               @update="onTableDragUpdate" :move="checkContainerMove">
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

    <div class="table-cell-action" v-if="designer.selectedId === widget.id && widget.type === 'table-cell'">
      <i :title="i18nt('designer.hint.selectParentWidget')"
         @click.stop="selectParentWidget()"><svg-icon icon-class="el-back" /></i>
      <el-dropdown trigger="click" @command="handleTableCellCommand" size="small">
        <i :title="i18nt('designer.hint.cellSetting')"><svg-icon icon-class="el-menu" /></i>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="insertLeftCol">{{i18nt('designer.setting.insertColumnToLeft')}}</el-dropdown-item>
            <el-dropdown-item command="insertRightCol">{{i18nt('designer.setting.insertColumnToRight')}}</el-dropdown-item>
            <el-dropdown-item command="insertAboveRow">{{i18nt('designer.setting.insertRowAbove')}}</el-dropdown-item>
            <el-dropdown-item command="insertBelowRow">{{i18nt('designer.setting.insertRowBelow')}}</el-dropdown-item>
            <el-dropdown-item command="mergeLeftCol" :disabled="mergeLeftColDisabled" divided>{{i18nt('designer.setting.mergeLeftColumn')}}</el-dropdown-item>
            <el-dropdown-item command="mergeRightCol" :disabled="mergeRightColDisabled">{{i18nt('designer.setting.mergeRightColumn')}}</el-dropdown-item>
            <el-dropdown-item command="mergeWholeRow" :disabled="mergeWholeRowDisabled">{{i18nt('designer.setting.mergeEntireRow')}}</el-dropdown-item>
            <el-dropdown-item command="mergeAboveRow" :disabled="mergeAboveRowDisabled" divided>{{i18nt('designer.setting.mergeRowAbove')}}</el-dropdown-item>
            <el-dropdown-item command="mergeBelowRow" :disabled="mergeBelowRowDisabled">{{i18nt('designer.setting.mergeRowBelow')}}</el-dropdown-item>
            <el-dropdown-item command="mergeWholeCol" :disabled="mergeWholeColDisabled">{{i18nt('designer.setting.mergeEntireColumn')}}</el-dropdown-item>
            <el-dropdown-item command="undoMergeRow" :disabled="undoMergeRowDisabled" divided>{{i18nt('designer.setting.undoMergeRow')}}</el-dropdown-item>
            <el-dropdown-item command="undoMergeCol" :disabled="undoMergeColDisabled">{{i18nt('designer.setting.undoMergeCol')}}</el-dropdown-item>
            <el-dropdown-item command="deleteWholeCol" :disabled="deleteWholeColDisabled" divided>{{i18nt('designer.setting.deleteEntireCol')}}</el-dropdown-item>
            <el-dropdown-item command="deleteWholeRow" :disabled="deleteWholeRowDisabled">{{i18nt('designer.setting.deleteEntireRow')}}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div class="table-cell-handler" v-if="designer.selectedId === widget.id && widget.type === 'table-cell'">
      <i>{{i18nt('designer.widgetLabel.' + widget.type)}}</i>
    </div>
  </td>
</template>

<script>
	import { computed,toRefs,inject,provide ,reactive,nextTick } from 'vue'
  import { useI18n } from '@/utils/i18n'

  import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'
  import SvgIcon from '@/components/svg-icon'
  import { useDesignRef } from "@/components/form-designer/refMixinDesign"

  export default {
    name: "TableCellWidget",
    componentName: "TableCellWidget",
    components: {
      ...FieldComponents,
      SvgIcon,
    },
    props: {
      widget: Object,
      parentWidget: Object,
      parentList: Array,

      rowIndex: Number,
      colIndex: Number,
      rowLength: Number,
      colLength: Number,
      colArray: Array,
      rowArray: Array,

      designer: Object,
    },
    setup(props){

      const { i18nt }=useI18n();
      const refList=inject('refList')

      const designRefMixin = useDesignRef(refList,props.widget);



      const selected=computed(() => {
        return props.widget.id === props.designer.selectedId
      })

      const customClassv=computed(() => {
        return props.widget.options.customClass || ''
      })

      const mergeLeftColDisabled=computed(() => {
        return (props.colIndex <= 0) || (props.colArray[props.colIndex - 1].options.rowspan !== props.widget.options.rowspan)
      })

      const mergeRightColDisabled=computed(() => {
        let rightColIndex = props.colIndex + props.widget.options.colspan
        return (props.colIndex >= props.colLength - 1) || (rightColIndex > props.colLength -1)
            || (props.colArray[rightColIndex].options.rowspan !== props.widget.options.rowspan)
      })

      const mergeWholeRowDisabled=computed(() => {
        return (props.colLength <= 1) || (props.colLength === props.widget.options.colspan)
      })

      const mergeAboveRowDisabled=computed(() => {
        return (props.rowIndex <= 0) || (props.rowArray[props.rowIndex - 1].cols[props.colIndex].options.colspan
            !== props.widget.options.colspan)

        //return props.rowIndex <= 0
        //return (props.rowIndex <= 0) || (props.widget.options.colspan !== props.rowArray) //TODO
      })

      const mergeBelowRowDisabled=computed(() => {
        let belowRowIndex = props.rowIndex + props.widget.options.rowspan
        return (props.rowIndex >= props.rowLength - 1) || (belowRowIndex > props.rowLength -1)
            || (props.rowArray[belowRowIndex].cols[props.colIndex].options.colspan !== props.widget.options.colspan)
      })

      const mergeWholeColDisabled=computed(() => {
        return (props.rowLength <= 1) || (props.rowLength === props.widget.options.rowspan)
      })

      const undoMergeColDisabled=computed(() => {
        return props.widget.merged || (props.widget.options.colspan <= 1)
      })

      const undoMergeRowDisabled=computed(() => {
        return props.widget.merged || (props.widget.options.rowspan <= 1)
      })

      const deleteWholeColDisabled=computed(() => {
        //return props.colLength === 1
        return (props.colLength === 1) || (props.widget.options.colspan === props.colLength)
      })

      const deleteWholeRowDisabled=computed(() => {
        return (props.rowLength === 1) || (props.widget.options.rowspan === props.rowLength)
      })




      const selectWidget=(widget)=> {
        props.designer.setSelected(widget)
      }

      const checkContainerMove=(evt)=> {
        return props.designer.checkWidgetMove(evt)
      }

      const onTableDragEnd=(obj, subList)=> {
        //
      }

      const onTableDragAdd=(evt, subList)=> { //重复代码，可合并
        const newIndex = evt.newIndex
        if (!!subList[newIndex]) {
          props.designer.setSelected( subList[newIndex] )
        }

        props.designer.emitHistoryChange()
        props.designer.emitEvent('field-selected', props.widget)
      }

      const onTableDragUpdate=()=> {
        props.designer.emitHistoryChange()
      }

      const selectParentWidget=()=> {
        if (props.parentWidget) {
          props.designer.setSelected(props.parentWidget)
        } else {
          props.designer.clearSelected()
        }
      }

      const handleTableCellCommand=(command) =>{
        if (command === 'insertLeftCol') {
          insertLeftCol()
        } else if (command === 'insertRightCol') {
          insertRightCol()
        } else if (command === 'insertAboveRow') {
          insertAboveRow()
        } else if (command === 'insertBelowRow') {
          insertBelowRow()
        } else if (command === 'mergeLeftCol') {
          mergeLeftCol()
        } else if (command === 'mergeRightCol') {
          mergeRightCol()
        } else if (command === 'mergeWholeCol') {
          mergeWholeCol()
        } else if (command === 'mergeAboveRow') {
          mergeAboveRow()
        } else if (command === 'mergeBelowRow') {
          mergeBelowRow()
        } else if (command === 'mergeWholeRow') {
          mergeWholeRow()
        } else if (command === 'undoMergeCol') {
          undoMergeCol()
        } else if (command === 'undoMergeRow') {
          undoMergeRow()
        } else if (command === 'deleteWholeCol') {
          deleteWholeCol()
        } else if (command === 'deleteWholeRow') {
          deleteWholeRow()
        }
      }

      const insertLeftCol=()=> {
        props.designer.insertTableCol(props.parentWidget, props.colIndex, props.rowIndex, true)
      }

      const insertRightCol=()=> {
        props.designer.insertTableCol(props.parentWidget, props.colIndex, props.rowIndex, false)
      }

      const insertAboveRow=()=> {
        props.designer.insertTableRow(props.parentWidget, props.rowIndex, props.rowIndex, props.colIndex, true)
      }

      const insertBelowRow=()=> {
        props.designer.insertTableRow(props.parentWidget, props.rowIndex, props.rowIndex, props.colIndex, false)
      }

      const mergeLeftCol=()=> {
        props.designer.mergeTableCol(props.rowArray, props.colArray, props.rowIndex, props.colIndex, true, props.widget)
      }

      const mergeRightCol=()=> {
        props.designer.mergeTableCol(props.rowArray, props.colArray, props.rowIndex, props.colIndex, false, props.widget)
      }

      const mergeWholeRow=()=> {
        props.designer.mergeTableWholeRow(props.rowArray, props.colArray, props.rowIndex, props.colIndex)
      }

      const mergeAboveRow=()=> {
        props.designer.mergeTableRow(props.rowArray, props.rowIndex, props.colIndex, true, props.widget)
      }

      const mergeBelowRow=()=> {
        props.designer.mergeTableRow(props.rowArray, props.rowIndex, props.colIndex, false, props.widget)
      }

      const mergeWholeCol=()=> {
        props.designer.mergeTableWholeCol(props.rowArray, props.colArray, props.rowIndex, props.colIndex)
      }

      const undoMergeCol=()=> {
        props.designer.undoMergeTableCol(props.rowArray, props.rowIndex, props.colIndex,
            props.widget.options.colspan, props.widget.options.rowspan)
      }

      const undoMergeRow=()=> {
        props.designer.undoMergeTableRow(props.rowArray, props.rowIndex, props.colIndex,
            props.widget.options.colspan, props.widget.options.rowspan)
      }

      const deleteWholeCol=()=> {
        props.designer.deleteTableWholeCol(props.rowArray, props.colIndex)
      }

      const deleteWholeRow=()=> {
        props.designer.deleteTableWholeRow(props.rowArray, props.rowIndex)
      }


      designRefMixin.initRefList()

      return {
        i18nt,

        ...designRefMixin,

        selected,
        customClassv,
        mergeLeftColDisabled,
        mergeRightColDisabled,
        mergeWholeRowDisabled,
        mergeAboveRowDisabled,
        mergeBelowRowDisabled,
        mergeWholeColDisabled,
        undoMergeColDisabled,
        undoMergeRowDisabled,
        deleteWholeColDisabled,
        deleteWholeRowDisabled,

        selectWidget,
        checkContainerMove,
        onTableDragEnd,
        onTableDragAdd,
        onTableDragUpdate,

        selectParentWidget,
        handleTableCellCommand,


        insertLeftCol,
        insertRightCol,
        insertAboveRow,
        insertBelowRow,
        mergeLeftCol,
        mergeRightCol,
        mergeWholeRow,
        mergeAboveRow,
        mergeBelowRow,
        mergeWholeCol,
        undoMergeCol,
        undoMergeRow,
        deleteWholeCol,
        deleteWholeRow

      }

    }
  }
</script>

<style lang="scss" scoped>
  .table-cell {
    //padding: 3px;
    border: 1px dashed #336699;
    display: table-cell;
    position: relative;

    .draggable-div {
      position: relative;
      height: 100%;
    }

    .form-widget-list {
      border: 1px dashed #336699;
      margin: 3px;
      min-height: 28px;
      //height: 100%;
    }

    .table-cell-action{
      position: absolute;
      //bottom: -30px;
      bottom: 0;
      right: -2px;
      height: 28px;
      line-height: 28px;
      background: $--color-primary;
      z-index: 999;

      display: flex;
      align-items: center;

      i {
        font-size: 14px;
        color: #fff;
        margin: 0 5px;
        cursor: pointer;
      }
    }

    .table-cell-handler {
      position: absolute;
      top: -2px;
      //bottom: -24px;  /* 拖拽手柄位于组件下方，有时无法正常拖动，原因未明？？ */
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
        cursor: default;  //cursor: move;
      }
    }

  }

  .table-cell-action, .table-cell-handler {
    :deep(.svg-icon) {
      margin-left: 0.1em;
      margin-right: 0.1em;
    }
  }

  .table-cell.selected {
    outline: 2px solid $--color-primary !important;
  }
</style>
