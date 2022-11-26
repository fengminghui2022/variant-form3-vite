<template>

	<container-item-wrapper v-show="!widget.options.hidden" :widget="widget">

			<el-table ref="dataTable" :data="widget.options.tableData" :class="[customClass]"
								:height="tableHeight" :style="{'width': widget.options.tableWidth}"
								:border="widget.options.border" :show-summary="widget.options.showSummary"
								:row-key="widget.options.rowKey" :tree-props="{ children: widget.options.childrenKey }"
								:size="widgetSize" :stripe="widget.options.stripe"
								:highlight-current-row="singleRowSelectFlag"
								:row-class-name="getRowClassName"
								:span-method="getSpanMethod"
								@current-change="handleCurrentChange"
								@selection-change="handleSelectionChange"
								@sort-change="handleSortChange"
								@header-click="handleHeaderClick"
								@row-click="handleRowClick"
								@row-dblclick="handleRowDoubleClick"
								@cell-click="handleCellClick"
								@cell-dblclick="handleCellDoubleClick"
								@select="handleRowSelect"
								@select-all="handleAllSelect"
								:cell-style="{padding: widget.options.rowSpacing + 'px 0'}" >

				<el-table-column v-if="widget.options.showIndex" type="index" width="50" fixed="left"></el-table-column>
				<el-table-column v-if="widget.options.showCheckBox" type="selection"
												 :width="selectionWidth"  fixed="left"></el-table-column>

				<template v-for="(item, index) in widget.options.tableColumns">
					<el-table-column
													 v-if="item.show !== false"
													 :key="index"
													 :prop="item.prop"
													 :label="item.label"
													 :sortable="item.sortable"
													 :fixed="!item.fixed ? false : item.fixed"
													 :align="item.align ? item.align:'center'"
													 :formatter="formatterValue"
													 :format="item.format"
													 :show-overflow-tooltip="true"
													 :min-width="item.width">
						<template #default="scope">
							<template v-if="item.formatS === 'render' && !!item.render">
								<table-column-custom-render :row="scope.row" :column="item" :renderFn="getColumnRender(scope.row, item)" />
							</template>
							<template v-else-if="!!item.formatS && (item.formatS !== 'renders')">
								<span>{{formatterValue(scope.row, item, scope.row[item.prop])}}</span>
							</template>
							<template v-else>
								<span>{{scope.row[item.prop]}}</span>
							</template>
						</template>
					</el-table-column>
				</template>

				<template v-if="!!widget.options.showButtonsColumn">
					<el-table-column :fixed="buttonsColumnFixed"
													 class-name="data-table-buttons-column" :align="'center'"
													 :label="widget.options.buttonsColumnTitle"
													 :width="widget.options.buttonsColumnWidth">
						<template #default="scope">
							<template v-for="(ob) in widget.options.operationButtons">
								<el-button v-show="showOperationButton(ob, scope.$index, scope.row)"
													 :type="ob.type" :size="ob.size" :round="ob.round"
													 :disabled="disableOperationButton(ob, scope.$index, scope.row)"
													 @click="handleOperationButtonClick(ob.name, scope.$index, scope.row)"
													 :class="['data-table-' + ob.name + '-button']">{{getOperationButtonLabel(ob, scope.$index, scope.row)}}</el-button>
							</template>
						</template>
					</el-table-column>
				</template>

			</el-table>
			<el-pagination v-if="widget.options.showPagination"
										 :small="widget.options.smallPagination"
										 :current-page="currentPage"
										 :page-sizes="pageSizes"
										 :page-size="pageSize"
										 :layout="paginationLayout"
										 :total="total"
										 @size-change="handlePageSizeChange"
										 @current-change="handleCurrentPageChange">
			</el-pagination>

	</container-item-wrapper>
</template>
<script>
	import { computed,ref,getCurrentInstance,toRefs,inject,reactive,nextTick,onMounted,onBeforeUnmount } from 'vue'

	import { useEmitter } from '@/utils/emitter'
  	import { useI18n } from '@/utils/i18n'
	import { useRef } from "@/components/form-render/refMixin"
	import { useContainer } from "@/components/form-render/container-item/containerItemMixin"


	import ContainerItemWrapper from '@/components/form-render/container-item/container-item-wrapper'
	import {formatDate1, formatDate2, formatDate3, formatDate4, formatDate5,
					formatNumber1, formatNumber2, formatNumber3, formatNumber4,
					formatNumber5, formatNumber6, formatNumber7} from "@/utils/format"
	import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'
	import TableColumnCustomRender from '@/components/form-render/table-column-custom-render'
	import {deepClone, getDSByName, overwriteObj, runDataSourceRequest} from "@/utils/util"

  export default {
    name: "DataTableItem",
    componentName: 'ContainerItem',  //必须固定为ContainerItem，用于接收父级组件的broadcast事件
    // mixins: [emitter, i18n, refMixin, containerItemMixin],
	components: {
		ContainerItemWrapper,
		TableColumnCustomRender,
		...FieldComponents,
	},
	props: {
		widget: Object,
		parentWidget: Object,
		parentList: Array,
		indexOfParentList: Number,

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
      	const { i18nt }= useI18n();
		const refList= inject('refList')
		const sfRefList = inject('sfRefList')
		const globalModel = inject('globalModel')
		const getFormConfig = inject('getFormConfig')
		const getGlobalDsv = inject('getGlobalDsv')

		const dataTable=ref(null)

  		const { proxy } = getCurrentInstance()
		const data=reactive({
		
			selectAllFlag: false,

			selectedIndices: [],
			selectedRows: [],
			pageSize: props.widget.options.pagination.pageSize,
			pageSizes: props.widget.options.pagination.pageSizes,
			currentPage: props.widget.options.pagination.currentPage,
			total: props.widget.options.pagination.total,

			//是否跳过selectionChange事件
			skipSelectionChangeEvent: false
		})
		
      const refMixin = useRef(props);
      const emitterMixin =useEmitter();
      const containerMixin= useContainer(props,data,{});

		const formConfig=computed(()=> {
			return getFormConfig()
		})

		const paginationLayout=computed(()=> {
			return !!props.widget.options.smallPagination ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'
		})

		const customClass=computed(()=> {
			return props.widget.options.customClass || ''
		})

		const widgetSize=computed(()=> {
			return props.widget.options.tableSize || "default"
		})

		const singleRowSelectFlag=computed(()=> {
			return !props.widget.options.showCheckBox
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



		onMounted(()=> {
			if (!!props.widget.options.dsEnabled) {
				loadDataFromDS({})
			}

			nextTick(() => {
				handleOnMounted()
			})
		})

		onBeforeUnmount(()=> {
			containerMixin.unregisterFromRefList()
		})

		const selectWidget=(widget)=> {
			// this.designer.setSelected(widget)
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

		const formatterValue=(row, column, cellValue)=> {
			if (!cellValue) {
				return ''
			}

			if(!!column.formatS) {
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

		const getColumnRender=(row, column)=> {
			/* TODO: 每个table-cell，render函数会执行2次，原因不明！！！ */
			return new Function('h', 'params', 'components', column.render)
		}

				/* 注意：在加载树形结构数据时，此方法只能获取第一级选中节点，选择子节点时返回-1，应在文档中加以说明！！！ */
		const getRowIndex=(row)=> {
			return props.widget.options.tableData.lastIndexOf(row)
		}

		const findColumnAndSetHidden=(columnName, hiddenFlag)=> {
			props.widget.options.tableColumns.forEach(tc => {
				if (tc.prop === columnName) {
					tc.show = !hiddenFlag
				}
			})
		}

		const handleOnCreated=()=> {
			if (!!props.widget.options.onCreated) {
				let customFunc = new Function(props.widget.options.onCreated)
				customFunc.call(proxy)
			}
		}

		const handleOnMounted=()=> {
			if (!!props.widget.options.onMounted) {
				let customFunc = new Function(props.widget.options.onMounted)
				customFunc.call(proxy)
			}
		}

		const handleCurrentChange=(currentRow, oldCurrentRow)=> {
			if (!!data.skipSelectionChangeEvent) {
				return
			}

			if (!!props.widget.options.showCheckBox) {
				return
			}

			data.selectedIndices.length = 0
			data.selectedRows.length = 0
			let rowIndex = getRowIndex(currentRow)
			data.selectedIndices.push(rowIndex)
			data.selectedRows.push(currentRow)

			if (!!props.widget.options.onSelectionChange) {
				let customFn = new Function('selection', 'selectedIndices', props.widget.options.onSelectionChange)
				customFn.call(proxy, [currentRow], data.selectedIndices)
			} else {
				/* 必须调用mixins中的dispatch方法逐级向父组件发送消息！！ */
				emitter.dispatch('VFormRender', 'dataTableSelectionChange', [proxy, [currentRow], data.selectedIndices])
			}
		}

		/**
		 * 注意：加载树形数据后，选中行如包含子节点则会触发两次该事件！！
		 * @param selection
		 */
		const handleSelectionChange=(selection)=> {
			if (!!data.skipSelectionChangeEvent) {
				return
			}

			data.selectedIndices.length = 0
			data.selectedRows.length = 0
			selection.map((row) => {
				let rowIndex = getRowIndex(row)
				data.selectedIndices.push(rowIndex)
				data.selectedRows.push(row)
			})

			if (!!props.widget.options.onSelectionChange) {
				let customFn = new Function('selection', 'selectedIndices', props.widget.options.onSelectionChange)
				customFn.call(proxy, selection, data.selectedIndices)
			} else {
				/* 必须调用mixins中的dispatch方法逐级向父组件发送消息！！ */
				emitter.dispatch('VFormRender', 'dataTableSelectionChange', [proxy, selection, data.selectedIndices])
			}
		}

		const handleSortChange=({column, prop, order})=> {
			// emitter.dispatch('VFormRender', 'dataTableSortChange',
			// 				[proxy, column, prop, order, data.pageSize, data.currentPage])
			//
			// console.log('test====', prop)
		}

		const handlePageSizeChange=(pageSize)=> {
			data.pageSize = pageSize
			if (!!props.widget.options.dsEnabled && !!props.widget.options.dsName) {
				loadDataFromDS()
			}

			if (!!props.widget.options.onPageSizeChange) {
				let customFn = new Function('pageSize', 'currentPage', props.widget.options.onPageSizeChange)
				customFn.call(proxy, pageSize, data.currentPage)
			} else {
				emitter.dispatch('VFormRender', 'dataTablePageSizeChange', [proxy, pageSize, data.currentPage])
			}
		}

		const handleCurrentPageChange=(currentPage)=> {
			data.currentPage = currentPage
			if (!!props.widget.options.dsEnabled && !!props.widget.options.dsName) {
				loadDataFromDS()
			}

			if (!!props.widget.options.onCurrentPageChange) {
				let customFn = new Function('pageSize', 'currentPage', props.widget.options.onCurrentPageChange)
				customFn.call(proxy, data.pageSize, currentPage)
			} else {
				emitter.dispatch('VFormRender', 'dataTablePageChange', [proxy, data.pageSize, currentPage])
			}
		}

		const handleOperationButtonClick=(btnName, rowIndex, row)=> {
			data.skipSelectionChangeEvent = true
			try {
				if (!!props.widget.options.onOperationButtonClick) {
					let customFn = new Function('buttonName', 'rowIndex', 'row', props.widget.options.onOperationButtonClick)
					customFn.call(proxy, btnName, rowIndex, row)
				} else {
					emitter.dispatch('VFormRender', 'operationButtonClick', [proxy, btnName, rowIndex, row])
				}
			} finally {
				data.skipSelectionChangeEvent = false
			}
		}

		const showOperationButton=(buttonConfig, rowIndex, row)=> {
			if (!!props.widget.options.onHideOperationButton) {
				let customFn = new Function('buttonConfig', 'rowIndex', 'row', props.widget.options.onHideOperationButton)
				return !customFn.call(proxy, buttonConfig, rowIndex, row)
			} else {
				return !buttonConfig.hidden
			}
		}

		const disableOperationButton=(buttonConfig, rowIndex, row)=> {
			if (!!props.widget.options.onDisableOperationButton) {
				let customFn = new Function('buttonConfig', 'rowIndex', 'row', props.widget.options.onDisableOperationButton)
				return customFn.call(proxy, buttonConfig, rowIndex, row)
			} else {
				return buttonConfig.disabled
			}
		}

		const getOperationButtonLabel=(buttonConfig, rowIndex, row)=> {
			if (!!props.widget.options.onGetOperationButtonLabel) {
				let customFn = new Function('buttonConfig', 'rowIndex', 'row', props.widget.options.onGetOperationButtonLabel)
				//return customFn.call(proxy, buttonConfig, rowIndex, row) || buttonConfig.label
				return customFn.call(proxy, buttonConfig, rowIndex, row)
			} else {
				return buttonConfig.label
			}
		}

		const getRowClassName=({row, rowIndex})=> {
			if (!!props.widget.options.onGetRowClassName) {
				let customFn = new Function('rowIndex', 'row', props.widget.options.onGetRowClassName)
				return customFn.call(proxy, rowIndex, row)
			} else {
				return ''
			}
		}

		const getSpanMethod=({row, column, rowIndex, columnIndex})=> {
			if (!!props.widget.options.onGetSpanMethod) {
				let customFn = new Function('row', 'column', 'rowIndex', 'columnIndex', props.widget.options.onGetSpanMethod)
				return customFn.call(proxy, row, column, rowIndex, columnIndex)
			}
		}

		const handleHeaderClick=(column, event)=> {
			if (!!props.widget.options.onHeaderClick) {
				let customFn = new Function('column', 'event', props.widget.options.onHeaderClick)
				return customFn.call(proxy, column, event)
			}
		}

		const handleRowClick=(row, column, event)=> {
			if (!!props.widget.options.onRowClick) {
				let customFn = new Function('row', 'column', 'event', props.widget.options.onRowClick)
				return customFn.call(proxy, row, column, event)
			}
		}

		const handleRowDoubleClick=(row, column, event)=> {
			if (!!props.widget.options.onRowDoubleClick) {
				let customFn = new Function('row', 'column', 'event', props.widget.options.onRowDoubleClick)
				return customFn.call(proxy, row, column, event)
			}
		}

		const handleCellClick=(row, column, cell, event)=> {
			if (!!props.widget.options.onCellClick) {
				let customFn = new Function('row', 'column', 'cell', 'event', props.widget.options.onCellClick)
				return customFn.call(proxy, row, column, cell, event)
			}
		}

		const handleCellDoubleClick=(row, column, cell, event)=> {
			if (!!props.widget.options.onCellDoubleClick) {
				let customFn = new Function('row', 'column', 'cell', 'event', props.widget.options.onCellDoubleClick)
				return customFn.call(proxy, row, column, cell, event)
			}
		}

		const toggleSelection=(row, flag, selectedRows)=> {
			if (row) {
				dataTable.toggleRowSelection(row, flag)

				if (flag) {
					selectedRows.push(row)
					return
				}

				let foundRowIdx = -1
				let rowKey = props.widget.options.rowKey || 'id'
				selectedRows.forEach((sr, idx) => {
					if (sr[rowKey] === row[rowKey]) {
						foundRowIdx = idx
					}
				})

				if (foundRowIdx > -1) {
					selectedRows.splice(foundRowIdx, 1)
				}
			}
		}

		const setChildrenSelected=(children, flag, selectedRows)=> {
			let childrenKey = props.widget.options.childrenKey || 'children'
			children.map(child => {
				toggleSelection(child, flag, selectedRows)
				if (child[childrenKey]) {
					setChildrenSelected(child[childrenKey], flag, selectedRows)
				}
			})
		}

		const handleRowSelect=(selection, row)=> {
			data.skipSelectionChangeEvent = true

			let selectedRows = deepClone(selection)
			let rowKey = props.widget.options.rowKey || 'id'
			let childrenKey = props.widget.options.childrenKey || 'children'
			if (selection.some(el => { return row[rowKey] === el[rowKey] })) {
				if (row[childrenKey]) {
					setChildrenSelected(row[childrenKey], true, selectedRows)
				}
			} else {
				if (row[childrenKey]) {
					setChildrenSelected(row[childrenKey], false, selectedRows)
				}
			}

			data.skipSelectionChangeEvent = false
			// 一次性处理多行选中或取消选中，只触发一次事件！！！
			nextTick(() => {
				handleSelectionChange(selectedRows)
			})
		}

		const setSelectedFlag=(data, flag)=> {
			let childrenKey = props.widget.options.childrenKey || 'children'
			data.forEach(row => {
				dataTable.toggleRowSelection(row, flag)
				if (row[childrenKey]) {
					setSelectedFlag(row[childrenKey], flag)
				}
			})
		}

		const handleAllSelect=(selection)=> {
			data.skipSelectionChangeEvent = true
			data.selectAllFlag = !data.selectAllFlag
			setSelectedFlag(props.widget.options.tableData, data.selectAllFlag)

			data.skipSelectionChangeEvent = false
			// 一次性处理多行选中或取消选中，只触发一次事件！！！
			nextTick(() => {
				handleSelectionChange(selection)
			})
		}

		//--------------------- 以下为组件支持外部调用的API方法 begin ------------------//
		/* 提示：用户可自行扩充这些方法！！！ */
		const getTableColumns=()=> {
			return props.widget.options.tableColumns
		}

		/**
		 * 设置表格列
		 * @param tableColumns
		 */
		const setTableColumns=(tableColumns)=> {
			props.widget.options.tableColumns = tableColumns
			nextTick(() => {
				dataTable.doLayout()  //防止行列显示错位！！
			})
		}

		/**
		 * 设置表格列（为了兼容文档错误，setTableColumn应为setTableColumns）
		 * @param tableColumns
		 */
		const setTableColumn=(tableColumns)=> {
			setTableColumns(tableColumns)
		}

		/**
		 * 从数据源加载表格列
		 * @param localDsv 本地数据源变量DSV
		 * @param dsName 数据源名称
		 */
		const loadColumnsFromDS=(localDsv = {}, dsName)=> {
			let curDS = getDSByName(formConfig, dsName)
			if (!!curDS) {
				let gDsv = getGlobalDsv() || {}
				let newDsv = new Object({})
				overwriteObj(newDsv, gDsv)
				overwriteObj(newDsv, localDsv)
				newDsv.widgetName = props.widget.options.name
				runDataSourceRequest(curDS, newDsv, refMixin.getFormRef(), false, proxy.$message).then(res => {
					setTableColumns(res)
				}).catch(err => {
					proxy.$message.error(err.message)
				})
			}
		}

		/**
		 * 动态设置表格列的隐藏或显示
		 * @param columnNames
		 * @param hiddenFlag
		 */
		const setTableColumnsHidden=(columnNames, hiddenFlag)=> {
			if (!!columnNames) {
				if (typeof columnNames === 'string') {
					findColumnAndSetHidden(columnNames, hiddenFlag)
				} else if (Array.isArray(columnNames)) {
					columnNames.forEach(cn => {
						findColumnAndSetHidden(cn, hiddenFlag)
					})
				}

				nextTick(() => {
					dataTable.doLayout()  //防止行列显示错位！！
				})
			}
		}

		/**
		 * 获取表格数据
		 */
		const getTableData=()=> {
			return props.widget.options.tableData
		}

		/**
		 * 设置表格数据
		 * @param tableData
		 */
		const setTableData=(tableData)=> {
			props.widget.options.tableData = tableData
		}

		/**
		 * 从数据源加载表格数据
		 * @param localDsv 本地数据源变量DSV
		 * @param dsName 数据源名称，不传此值，则使用dsName属性绑定的数据源
		 */
		const loadDataFromDS=(localDsv = {}, dsName = '')=> {
			let curDSName = dsName || props.widget.options.dsName
			let curDSetName = props.widget.options.dataSetName
			let curDS = getDSByName(formConfig, curDSName)
			if (!!curDS) {
				let gDsv = getGlobalDsv() || {}
				let newDsv = new Object({})
				overwriteObj(newDsv, gDsv)
				overwriteObj(newDsv, localDsv)
				newDsv.widgetName = props.widget.options.name
				newDsv.pageSize = data.pageSize
				newDsv.currentPage = data.currentPage
				runDataSourceRequest(curDS, newDsv, refMixin.getFormRef(), false, proxy.$message).then(res => {
					if (!!curDSetName && res.hasOwnProperty(curDSetName)) {
						setTableData(res[curDSetName])
					} else {
						setTableData(res)
					}
				}).catch(err => {
					proxy.$message.error(err.message)
				})
			}
		}

		/**
		 * 设置表格分页
		 * @param pagination
		 */
		const setPagination=(pagination)=> {
			if (pagination.currentPage !== undefined) {
				data.currentPage = pagination.currentPage
				props.widget.options.pagination.currentPage = pagination.currentPage
			}

			if (pagination.pageSize !== undefined) {
				data.pageSize = pagination.pageSize
				props.widget.options.pagination.pageSize = pagination.pageSize
			}

			if (pagination.pageSizes !== undefined) {
				data.pageSizes = pagination.pageSizes
				props.widget.options.pagination.pageSizes = pagination.pageSizes
			}

			if (pagination.total !== undefined) {
				data.total = pagination.total
				props.widget.options.pagination.total = pagination.total
			}
		}

		/**
		 * 获取选中行数据，格式为对象数组
		 * @returns {[]}
		 */
		const getSelectedRow=()=> {
			//return dataTable.selection
			return data.selectedRows
		}

		/**
		 * 获取选中行索引，格式为数组
		 * @returns {[]}
		 */
		const getSelectedIndex=()=> {
			return data.selectedIndices
		}




		refMixin.initRefList()
		handleOnCreated()

		return {
			i18nt,
			...toRefs(data),

			dataTable,

			formConfig,
			paginationLayout,
			customClass,
			widgetSize,
			singleRowSelectFlag,
			buttonsColumnFixed,
			tableHeight,
			selectionWidth,

			selectWidget,
			renderHeader,
			formatter,
			formatterValue,
			getColumnRender,
			getRowIndex,
			findColumnAndSetHidden,

			handleCurrentChange,
			handleSelectionChange,
			handleSortChange,
			handlePageSizeChange,
			handleCurrentPageChange,
			handleOperationButtonClick,
			showOperationButton,
			disableOperationButton,
			getOperationButtonLabel,
			getRowClassName,
			getSpanMethod,
			handleHeaderClick,
			handleRowClick,
			handleRowDoubleClick,
			handleCellClick,
			handleCellDoubleClick,
			toggleSelection,
			setChildrenSelected,
			handleRowSelect,
			setSelectedFlag,
			handleAllSelect,
			getTableColumns,
			setTableColumns,
			setTableColumn,
			loadColumnsFromDS,
			setTableColumnsHidden,
			getTableData,
			setTableData,
			loadDataFromDS,
			setPagination,
			getSelectedRow,
			getSelectedIndex,
		}


	}
}
</script>

<style lang="scss" scoped>
	.collapse-container {
	  margin: 2px;

	  .form-widget-list {
	    min-height: 28px;
	  }
	}

	:deep(.el-collapsed__header) {
	  padding: 10px 12px;
	}
</style>
