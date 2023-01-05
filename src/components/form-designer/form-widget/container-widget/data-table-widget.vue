<template>

	<container-wrapper :designer="designer" :widget="widget" :parent-widget="parentWidget" :parent-list="parentList"
		:index-of-parent-list="indexOfParentList">
		<div :key="widget.id" class="collapse-container data-table-container"
			:class="{'selected': selected}" @click.stop="selectWidget(widget)">

			<el-table ref="dataTable" :data="widget.options.tableData" :class="[customClass]"
								:height="tableHeight" :style="{'width': widget.options.tableWidth}"
								:border="widget.options.border" :show-summary="widget.options.showSummary"
								:row-key="tableRowKey" :tree-props="{ children: widget.options.childrenKey }"
								:size="widgetSize" @click.native.stop="selectWidget(widget)" :stripe="widget.options.stripe"
								@select="handleRowSelect" @select-all="handleAllSelect"
								:cell-style="{padding: widget.options.rowSpacing + 'px 0'}">

				<el-table-column v-if="widget.options.showIndex" type="index" width="50" fixed="left"></el-table-column>
				<el-table-column v-if="widget.options.showCheckBox" type="selection"
												 :width="selectionWidth" fixed="left"></el-table-column>

				<template v-for="(item, index) in widget.options.tableColumns">
					<el-table-column v-if="item.show !== false"
													 :key="index"
													 :prop="item.prop"
													 :label="item.label"
													 :sortable="item.sortable"
													 :fixed="!item.fixed ? false : item.fixed"
													 :align="item.align ? item.align:'center'"
													 :formatter="formatterValue"
													 :format="item.format"
													 :show-overflow-tooltip="true"
													 :width="item.width">
						<template #header>{{item.label}}</template>
					</el-table-column>
				</template>

				<template v-if="!!widget.options.showButtonsColumn">
					<el-table-column :fixed="buttonsColumnFixed"
													 class-name="data-table-buttons-column" :align="'center'"
													 :label="widget.options.buttonsColumnTitle"
													 :width="widget.options.buttonsColumnWidth">
						<template #default="scope">
							<template v-for="(ob, idx) in widget.options.operationButtons">
								<el-button v-if="!ob.hidden" :type="ob.type" :size="ob.size" :round="ob.round" :disabled="ob.disabled"
													 :class="['data-table-' + ob.name + '-button']">
									{{ob.label}}</el-button>
							</template>
						</template>
					</el-table-column>
				</template>

			</el-table>
			<el-pagination v-if="widget.options.showPagination"
									 	 :small="widget.options.smallPagination"
										 :current-page="widget.options.pagination.currentPage"
										 :page-sizes="widget.options.pagination.pageSizes"
										 :page-size="widget.options.pagination.pageSize"
										 :layout="paginationLayout"
										 :total="widget.options.pagination.total"
										 @size-change="handlePageSizeChange"
										 @current-change="handleCurrentPageChange"
			>
			</el-pagination>

		</div>
	</container-wrapper>

</template>

<script>
	import { computed,ref,toRefs,inject,reactive,nextTick } from 'vue'

	import ContainerWrapper from "@/components/form-designer/form-widget/container-widget/container-wrapper"
	import { useEmitter } from '@/utils/emitter'

  	import { useI18n } from '@/utils/i18n'
	import {formatDate1, formatDate2, formatDate3, formatDate4, formatDate5,
					formatNumber1, formatNumber2, formatNumber3, formatNumber4,
					formatNumber5, formatNumber6, formatNumber7} from "@/utils/format"
	import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'
	
  	import { useContainer } from "@/components/form-designer/form-widget/container-widget/containerMixin";
	import { useDesignRef } from "@/components/form-designer/refMixinDesign"

  export default {
    name: "DataTableWidget",
    componentName: 'DataTableWidget',	
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
		}
    },
	setup(props){
		const emitter = useEmitter();
      	const { i18nt }=useI18n();
		const refList=inject('refList')

		const containerMixin = useContainer();
		const designRefMixin = useDesignRef(refList,props.widget);

		const data=reactive({
			selectAllFlag: false
		})


		const dataTable=ref(null)


		const paginationLayout=computed(()=> {
			return !!props.widget.options.smallPagination ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'
		})
		const selected=computed(()=> {
			return props.widget.id === props.designer.selectedId
		})
		const customClass=computed(()=> {
			return props.widget.options.customClass || ''
		})
		const widgetSizev=computed(()=> {
			return props.widget.options.tableSize || "default"
		})
		const buttonsColumnFixed=computed(()=> {
			if (props.widget.options.buttonsColumnFixed === undefined) {
				return 'right'
			}

			return !props.widget.options.buttonsColumnFixed ? false : props.widget.options.buttonsColumnFixed
		})
		const tableHeight=computed(()=> {
			return props.widget.options.tableHeight || undefined
		})
		const selectionWidth=computed(()=> {
			return !props.widget.options.showSummary ? (!props.widget.options.treeDataEnabled ? 42 : 70): 53
		})
		const tableRowKey=computed(()=> {
			return !props.widget.options.treeDataEnabled ? null : props.widget.options.rowKey
		})




		const selectWidget=(widget)=>{
			props.designer.setSelected(widget)
		}
		const renderHeader=(h, { column, $index })=> {//debugger
			//console.log('column=====', column)

			let colCount = 0;
			if(props.widget.options.showIndex){
				colCount++;
			}
			if(props.widget.options.showCheckBox){
				colCount++;
			}

			column.formatS = props.widget.options.tableColumns[$index-colCount].formatS
			return column.label;
		}
		const formatter=(row, column, cellValue)=> {
			  return cellValue;
		}
		const formatterValue=(row, column, cellValue)=>{
			if(!!column.formatS && !!column.show) {
				switch(column.formatS) {
					case 'd1':
							return formatDate1(cellValue);
					case 'd2':
							return formatDate2(cellValue);
					case 'd3':
							return formatDate3(cellValue);
					case 'd4':
							return formatDate4(cellValue);
					case 'd5':
							return formatDate5(cellValue);
					case 'n1':
							return formatNumber1(cellValue);
					case 'n2':
							return formatNumber2(cellValue);
					case 'n3':
							return formatNumber3(cellValue);
					case 'n4':
							return formatNumber4(cellValue);
					case 'n5':
							return formatNumber5(cellValue);
					case 'n6':
							return formatNumber6(cellValue);
					case 'n7':
							return formatNumber7(cellValue);
				}
			}
			return cellValue;
		}
		const handlePageSizeChange=(pageSize)=>{
				//
		}
		const handleCurrentPageChange=(currentPage)=>{
				//
		}
		const getTableColumns=()=>{
			return props.widget.options.tableColumns
		}
		const setChildrenSelected=(children, flag)=>{
			let childrenKey = props.widget.options.childrenKey
			children.map(child => {
				toggleSelection(child, flag)
				if (child[childrenKey]) {
					setChildrenSelected(child[childrenKey], flag)
				}
			})
		}
		const toggleSelection=(row, flag)=>{
			if (row) {
				nextTick(() => {
					dataTable.toggleRowSelection(row, flag)
				})
			}
		}
		const handleRowSelect=(selection, row)=>{
			let childrenKey = props.widget.options.childrenKey
			if (selection.some(el => { return row.id === el.id })) {
				if (row[childrenKey]) {
					setChildrenSelected(row[childrenKey], true)
				}
			} else {
				if (row[childrenKey]) {
					setChildrenSelected(row[childrenKey], false)
				}
			}
		}
		const setSelectedFlag=(data, flag)=>{
			let childrenKey = props.widget.options.childrenKey
			data.forEach(row => {
				dataTable.toggleRowSelection(row, flag)
				if (row[childrenKey]) {
					setSelectedFlag(row[childrenKey], flag)
				}
			})
		}
		const handleAllSelect=(selection)=>{
			data.selectAllFlag = !data.selectAllFlag
			setSelectedFlag(props.widget.options.tableData, data.selectAllFlag)
		}

		designRefMixin.initRefList()

		return {
	
			i18nt,

			dataTable,
			...toRefs(data),

			...containerMixin,
			...designRefMixin,

			/* 计算属性 */
			paginationLayout,
			selected,
			customClass,
			widgetSizev,
			buttonsColumnFixed,
			tableHeight,
			selectionWidth,
			tableRowKey,

			/* 方法 */
			selectWidget,
			renderHeader,
			formatter,
			formatterValue,
			handlePageSizeChange,
			handleCurrentPageChange,
			getTableColumns,
			setChildrenSelected,
			toggleSelection,
			handleRowSelect,
			setSelectedFlag,
			handleAllSelect
		}
	}
  }
</script>

<style lang="scss" scoped>
	.collapse-container {
	  //padding: 5px;
	  margin: 2px;

	  .form-widget-list {
	    min-height: 28px;
	  }
	}

	.collapse-container.selected {
	  outline: 2px solid $--color-primary !important;
	}

	.data-table-container {
		:deep(.el-scrollbar__view)  {
			overflow-x: auto !important;  /* el-table默认显示水平滚动条！！ */
			height: 100%;  /* 水平滚动条固定在表格底部显示！！ */
		}
	}

	:deep(.el-collapsed__header) {
	  padding: 10px 12px;
	}

</style>
