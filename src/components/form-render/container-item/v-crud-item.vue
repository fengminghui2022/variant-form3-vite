<template>
	<container-item-wrapper v-show="!widget.options.hidden" :widget="widget">
			<!-- 查询条件面板 -->
			<el-card :key="widget.id" class="card-container" :size="widgetSize"
			         :shadow="widget.options.shadow" :style="{width: widget.options.cardWidth + '!important' || ''}">
			  <template #header>
					<div class="clear-fix" >
					 <span style="font-size: 18px;padding: 10px;">{{widget.options.label}}</span>
					 <i v-if="widget.options.showFold" class="float-right" style="padding-top: 10px;"
							 :class="[!widget.options.folded ? 'el-icon-arrow-down' : 'el-icon-arrow-up']"
							 @click="toggleCard"></i>
						<el-button-group class="float-right" :size="widgetSize">
							<el-button type="primary" icon="el-icon-search" @click="searchHandlerX">
							{{i18nt('designer.hint.search')}}</el-button>
							<el-button type="" icon="el-icon-edit" @click="resetHandler">
							{{i18nt('designer.hint.reset')}}</el-button>
						</el-button-group>
					</div>
				</template>
				<template v-if="!!widget.widgetList && (widget.widgetList.length > 0)">
				  <template v-for="(subWidget, swIdx) in widget.widgetList">
				    <template v-if="'container' === subWidget.category">
				      <component :is="subWidget.type + '-item'" :widget="subWidget" :key="swIdx" :parent-list="widget.widgetList"
				                 :index-of-parent-list="swIdx" :parent-widget="widget">
				        <!-- 递归传递插槽！！！ -->
				        <template v-for="slot in Object.keys($slots)" v-slot:[slot]="scope">
				          <slot :name="slot" v-bind="scope"/>
				        </template>
				      </component>
				    </template>
				    <template v-else>
				      <component :is="subWidget.type + '-widget'" :field="subWidget" :designer="null" :key="swIdx" :parent-list="widget.widgetList"
				                 :index-of-parent-list="swIdx" :parent-widget="widget">
				        <!-- 递归传递插槽！！！ -->
				        <template v-for="slot in Object.keys($slots)" v-slot:[slot]="scope">
				          <slot :name="slot" v-bind="scope"/>
				        </template>
				      </component>
				    </template>
				  </template>
				</template>
			</el-card>
			<!-- 工具栏按钮 -->
			<el-row>
				<el-col :span="12">
					<div style="width: 100%; " class="leftClass" v-if="widget.options.toolbarLeft">
						<el-button-group :size="widgetSize">
							<template v-for="(item,index) in widget.options.toolbarLeftButtons">
								<template v-if="!item.bExtend">
									<template v-if="item.label===''">
										<el-button
											:key="index"
											:type="item.type"
											:icon="item.icon"
											:disabled="item.disabled"
											v-show="item.display"
											@click="executeEvent(item.onClick)">
											</el-button>
									</template>
									<template v-else>
										<el-button
											:key="index"
											:type="item.type"
											:icon="item.icon"
											:disabled="item.disabled"
											v-show="item.display"
											@click="executeEvent(item.onClick)">
											{{item.label}}
										</el-button>
									</template>
								</template>
								<template v-else>
									<el-dropdown
										split-button
										:disabled="item.disabled"
										v-show="item.display"
										type="primary"
										:size="widgetSize"
										@click="executeEvent(item.onClick)"
										:key="index">
									      {{item.label}}
										<template #dropdown>
											<el-dropdown-menu>
												<el-dropdown-item
													v-for="(info,idx) in item.extendBtns"
													:key="idx"
													:disabled="info.disabled"
													v-show="info.display"
													@click.native="executeEvent(info.onClick)">
													{{info.label}}
												</el-dropdown-item>
											</el-dropdown-menu>
										</template>
									</el-dropdown>
								</template>
							</template>
						</el-button-group>
					</div>
				</el-col>
				<el-col :span="12">
					<div style="width: 100%; " class="rightClass" v-if="widget.options.toolbarRight">
						<el-button-group :size="widgetSize">
							<template v-for="(item,index) in widget.options.toolbarRightButtons">
								<template v-if="!item.bExtend">
									<template v-if="item.label===''">
										<el-button
											:key="index"
											:type="item.type"
											:icon="item.icon"
											:disabled="item.disabled"
											v-show="item.display"
											@click="executeEvent(item.onClick)">
											</el-button>
									</template>
									<template v-else>
										<el-button
											:key="index"
											:type="item.type"
											:icon="item.icon"
											:disabled="item.disabled"
											v-show="item.display"
											@click="executeEvent(item.onClick)">
											{{item.label}}
										</el-button>
									</template>
								</template>
								<template v-else>
									<el-dropdown
										split-button
										:disabled="item.disabled"
										v-show="item.display"
										type="primary"
										:size="widgetSize"
										@click="executeEvent(item.onClick)"
										:key="index">
									      {{item.label}}
										<template #dropdown>
											<el-dropdown-menu>
												<el-dropdown-item
													v-for="(info,idx) in item.extendBtns"
													:key="idx"
													:disabled="info.disabled"
													v-show="info.display"
													@click.native="executeEvent(info.onClick)">
													{{info.label}}
												</el-dropdown-item>
											</el-dropdown-menu>
										</template>
									</el-dropdown>
								</template>
							</template>
						</el-button-group>
					</div>
				</el-col>
			</el-row>
			<!-- 查询表格 -->
			<el-table :data="widget.options.tableData"
								:class="[customClass]"
								:height="widget.options.tableHeight"
								:style="{'width': widget.options.tableWidth}"
								:border="widget.options.border"
								:show-summary="widget.options.showSummary"
								:size="widgetSize"
								:stripe="widget.options.stripe"
								:cell-style="{padding: widget.options.rowSpacing + 'px 0'}"
								@header-contextmenu="contextmenu">

				<el-table-column v-if="widget.options.showIndex" type="index" width="50" fixed="left"></el-table-column>
				<el-table-column v-if="widget.options.showCheckBox" type="selection"
												 :width="!widget.options.showSummary ? 42: 53" fixed="left"></el-table-column>

				<!-- <template v-for="(item, index) in widget.options.tableColumns">
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
				</template> -->
				<!-- 渲染表格列 -->
				<template v-for="(child,groupListIndex) in getGroupList">
					<template v-if="child.type=='column'">
						<template v-for="(item,index) in child.columnList">
							<el-table-column
								:key="'col'+groupListIndex+index"
								v-if="item.show !== false"
								:prop="item.prop"
								:label="item.label"
								:sortable="item.sortable"
								:fixed="item.fixed"
								:align="item.align ? item.align:'center'"
								:formatter="formatterValue"
								:format="item.format"
								:show-overflow-tooltip="true"
								:width="item.width">
								<template #header>
									{{item.label}}
								</template>
							</el-table-column>
						</template>
					</template>
					<template v-else>
						<el-table-column :label="child.groupName" align="center">
							<template v-for="(item2,index2) in child.columnList">
								<el-table-column
								:key="'col'+groupListIndex+index2"
								v-if="item2.show !== false"
								:prop="item2.prop"
								:label="item2.label"
								:sortable="item2.sortable"
								:fixed="item2.fixed"
								:align="item2.align ? item2.align:'center'"
								:formatter="formatterValue"
								:format="item2.format"
								:show-overflow-tooltip="true"
								:width="item2.width">
									<template #header>
										{{item2.label}}
									</template>
								</el-table-column>
							</template>
						</el-table-column>
					</template>
				</template>
				<!-- 遍历表格操作列 -->
				<template v-if="!!widget.options.showButtonsColumn">
					<el-table-column fixed="right" class-name="data-table-buttons-column" :align="'center'"
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
			<!-- 表格分页 -->
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


		<!-- 自定义表格列-右键菜单 -->
		<div v-show="menuVisible"
				:style="{top:top+ &quot;px&quot;,left:left+ &quot;px&quot;}"
				class="select-menu"
				@click.stop="">
			<div style="display: flex;justify-content: space-between;align-items: center;" >
				<p>自定义表格列</p>
				<el-button-group size="small">
					<el-button type="primary" @click="saveCustomer">保存</el-button>
					<el-button type="primary" @click="resetCustomer">重置</el-button>
					<el-button type="primary" @click="menuVisible=false">关闭</el-button>
				</el-button-group>
			</div>
		  <el-table :data="widget.options.tableColumns" style="width: 100%"
		  	class="panes-setting" :cell-style="{padding:'1px 0'}"
		  	default-expand-all :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
		  	height="480" border row-key="fieldName" ref="singleTable" stripe>
				<el-table-column label="" width="30">
					<i class="iconfont icon-drag drag-option" style="cursor:move;"
						v-bind="{group:'panesGroup', ghostClass: 'ghost', handle: '.drag-option'}"></i>
				</el-table-column>
				<el-table-column prop="fieldID" v-if="false"></el-table-column>
				<el-table-column label="字段名" width="100" prop="prop">
					<template #default="scope">
						<el-input v-model="scope.row.prop" size="small" :disabled="true" ></el-input>
					</template>
				</el-table-column>
				<el-table-column label="列名" width="150" prop="label">
					<template #default="scope">
						<el-input v-model="scope.row.label" size="small"></el-input>
					</template>
				</el-table-column>
				<el-table-column label="列宽(px/%)" width="90" prop="width">
					<template #default="scope">
						<el-input v-model="scope.row.width" size="small"></el-input>
					</template>
				</el-table-column>
				<el-table-column label="展示" width="60" prop="show">
					<template #default="scope">
						<el-switch v-model="scope.row.show" size="small"></el-switch>
					</template>
				</el-table-column>
				<el-table-column label="锁定" width="60" prop="fixed">
					<template #default="scope">
						<el-switch v-model="scope.row.fixed" size="small"></el-switch>
					</template>
				</el-table-column>
				<el-table-column label="排序" width="60" prop="sortable">
					<template #default="scope">
						<el-switch v-model="scope.row.sortable" size="small"></el-switch>
					</template>
				</el-table-column>
				<el-table-column label="分组名" width="100" prop="groupName">
					<template #default="scope">
						<el-input v-model="scope.row.groupName" size="small"></el-input>
					</template>
				</el-table-column>
		  </el-table>
		</div>
	</container-item-wrapper>

</template>

<script>
	import ContainerItemWrapper from '@/components/form-render/container-item/container-item-wrapper'
	import emitter from '@/utils/emitter'
  import i18n from "@/utils/i18n"
	import {formatDate1, formatDate2, formatDate3, formatDate4, formatDate5,
					formatNumber1, formatNumber2, formatNumber3, formatNumber4,
					formatNumber5, formatNumber6, formatNumber7} from "@/utils/format"
	import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'
	import containerMixin from "@/components/form-designer/form-widget/container-widget/containerMixin"
	import refMixinDesign from "@/components/form-designer/refMixinDesign"
	import { setStorage, getStorage,removeStorageItem} from '@/utils/localstorage'
	import {traverseFieldWidgets} from "@/utils/util";
	// import {Check,RefreshLeft} from '@element-plus/icons-vue'
	import {
	  ArrowLeft,
	  ArrowRight,
	  Delete,
	  Edit,
	  Share,
	} from '@element-plus/icons-vue'
  export default {
    name: "VCrudItem",
    componentName: 'VCrudItem',
    mixins: [i18n, containerMixin, refMixinDesign],
		inject: ['refList'],
		components: {
		  ContainerItemWrapper,
		  ...FieldComponents,
		},
		data() {
			return {
				top:0,
				left:0,

				menuVisible:false,
				pageSize: this.widget.options.pagination.pageSize,
				currentPage: this.widget.options.pagination.currentPage,
			}
		},
    props: {
			widget: Object,
			parentWidget: Object,
			parentList: Array,
			indexOfParentList: Number,
			designer: Object,
    },
    created() {
			this.initRefList()
    },
		mounted() {
		  //
		},
    beforeDestroy() {
      //
    },
		computed: {
			// 计算表格列分组信息
			getGroupList(){
				var groupList=[];
				var baseColumnItem=this.widget.options.tableColumns;
				baseColumnItem.forEach((item,index)=>{
					if(item.groupName==undefined){
						item.groupName='';
					}
				})
				baseColumnItem.forEach((item)=>{
					if(item.groupName!=""){
						var flag=false;
						for(var i=0;i<groupList.length;i++){
							var child=groupList[i];
							if(child.type=='group' && child.groupName==item.groupName){
								flag=true;
								child.columnList.push(item);
								break;
							}
						}
						if(!flag){
							var info={};
							info.type="group"
							info.groupName=item.groupName
							info.columnList=[];
							info.columnList.push(item);
							groupList.push(info);
						}
					}
					else{
						var info={};
						info.type="column"
						info.columnList=[];
						info.columnList.push(item);
						groupList.push(info);
					}

				})
				return groupList;
			},
    	paginationLayout() {
				return !!this.widget.options.smallPagination ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper'
			},

			selected() {
			  return this.widget.id === this.designer.selectedId
			},

			customClass() {
			  return this.widget.options.customClass || ''
			},

			widgetSize() {
				return this.widget.options.tableSize || "default"
			},
			// 按钮组对齐
			buttonGroupAlignClass(){
				return this.widget.options.buttonGroupAlign+"Class";
			}
		},
    methods: {
			xformatter(row,prop,format){
				var cellValue=row[prop];
				if(!!format){
					switch(format)
					{
						case 'd1':
								return formatDate1(cellValue);
								break;
						case 'd2':
								return formatDate2(cellValue);
								break;
						case 'd3':
								return formatDate3(cellValue);
								break;
						case 'd4':
								return formatDate4(cellValue);
								break;
						case 'd5':
								return formatDate5(cellValue);
								break;
						case 'n1':
								return formatNumber1(cellValue);
								break;
						case 'n2':
								return formatNumber2(cellValue);
								break;
						case 'n3':
								return formatNumber3(cellValue);
								break;
						case 'n4':
								return formatNumber4(cellValue);
								break;
						case 'n5':
								return formatNumber5(cellValue);
								break;
						case 'n6':
								return formatNumber6(cellValue);
								break;
						case 'n7':
								return formatNumber7(cellValue);
								break;
					}
				}else {
					return cellValue
				}
			},

			renderHeader(h, { column, $index }) {
				var colCount = 0;
				if(this.widget.options.showIndex){
					colCount++;
				}
				if(this.widget.options.showCheckBox){
					colCount++;
				}
				this.$set(column, "formatS", this.widget.options.tableColumns[$index-colCount].formatS)
			  return column.label;
			},

			formatter(row, column, cellValue) {
			  return cellValue;
			},

			formatterValue(row, column, cellValue) {
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
			},

			handlePageSizeChange(pageSize) {
				this.pageSize = pageSize
				if (!!this.widget.options.dsEnabled && !!this.widget.options.dsName) {
					this.loadDataFromDS()
				}

				if (!!this.widget.options.onPageSizeChange) {
					let customFn = new Function('pageSize', 'currentPage', this.widget.options.onPageSizeChange)
					customFn.call(this, pageSize, this.currentPage)
				} else {
					this.dispatch('VFormRender', 'dataTablePageSizeChange', [this, pageSize, this.currentPage])
				}
			},

			handleCurrentPageChange(currentPage) {
				this.currentPage = currentPage
				if (!!this.widget.options.dsEnabled && !!this.widget.options.dsName) {
					this.loadDataFromDS()
				}

				if (!!this.widget.options.onCurrentPageChange) {
					let customFn = new Function('pageSize', 'currentPage', this.widget.options.onCurrentPageChange)
					customFn.call(this, this.pageSize, currentPage)
				} else {
					this.dispatch('VFormRender', 'dataTablePageChange', [this, this.pageSize, currentPage])
				}
			},
			// =========================================================
			//* 按钮组方法
			// =========================================================
			executeEvent(funName){
				eval(funName);
			},
			setBtnsDisplay(btnList,display){
				for(var i=0;i<btnList.length;i++){
					for(var j=0;j<this.widget.options.toolbarButtons.length;j++){
						var item=this.widget.options.toolbarButtons[j]
						if(item.id==btnList[i]){
							item.display=display;
							break;
						}
						if(item.bExtend){
							var flag=false;
							for(var k=0;k<item.extendBtns.length;k++){
								if(item.extendBtns[k].id==btnList[i]){
									item.extendBtns[k].display=display
									flag=true;
									break;
								}
							}
							if(flag)break;
						}
					}
				}
			},
			setBtnsDisabled(btnList,disabled){
				for(var i=0;i<btnList.length;i++){
					for(var j=0;j<this.widget.options.toolbarButtons.length;j++){
						var item=this.widget.options.toolbarButtons[j]
						if(item.id==btnList[i]){
							item.disabled=disabled;
							break;
						}
						if(item.bExtend){
							var flag=false;
							for(var k=0;k<item.extendBtns.length;k++){
								if(item.extendBtns[k].id==btnList[i]){
									item.extendBtns[k].disabled=disabled
									flag=true;
									break;
								}
							}
							if(flag)break;
						}
					}
				}
			},
			// =========================================================
			// 查询面板相关方法
			// =========================================================
			resetHandler(){
				var widgetList=this.widget.widgetList;
				var that=this;
				// 应用查询默认值设置
				traverseFieldWidgets(widgetList, (widget,_this=this) => {
					that.getWidgetRef(widget.options.name).setValue("");
				})
				// removeStorageItem(this.getFormRef().optionData.pageID+"-"+this.widget.options.name);
			},
			searchHandlerX(requestPara){
				if(!this.checkSource()){
					return;
				}
				let widgetList=this.widget.widgetList;
				let that=this;
				let searchList=[];
				// 应用查询默认值设置
				traverseFieldWidgets(widgetList, (widget,_this=this) => {
					//console.log(widget);
					let value=that.getWidgetRef(widget.options.name).getValue("");//widget.id
					if(value!=''&&value!=null&&value!=undefined){
						let operator =widget.options.operator;
						if(operator==undefined)operator='like';
						let controlType=widget.type;
						if(controlType=="date-range"||controlType=="time-range"){
							let item1={column:widget.options.name,operate:'>=',value:value[0]};
							let item2={column:widget.options.name,operate:'<=',value:value[1]};
							searchList.push(item1);
							searchList.push(item2);
						}
						else{
							if(operator=="like")value="%"+value+"%";
							else if(operator=="leftlike"){operator="like";value="%"+value;}
							else if(operator=="rightlike"){operator="like";value=value+"%";}
							let item={column:widget.options.name,operate:operator,value:value};
							searchList.push(item);
						}

					}
				})
				// setStorage(this.getFormRef().optionData.pageID+"-"+this.widget.options.name,searchList);
				console.log("requestPara==========外传参数",requestPara)
				this.searchJson.searchDataItemlist=searchList;
				this.searchJson.pageSize=this.getPageSize();
				this.searchJson.pageNo =1;

				if(!!requestPara.type){
					if(requestPara.type === "currentPage"){
						this.searchJson.pageNo = requestPara.value
					}
					if(requestPara.type === "pageSize"){
						this.searchJson.pageSize = requestPara.value
					}
				}
				console.log("searchJson==========请求参数",this.searchJson)
				let tableWidget=that.getWidgetRef(that.sourceTableName);
				tableWidget.setLoading(true);
				tableWidget.setCurrentPage(1);
				this.axios.post("/syj/autoMapperData/searchdata",this.searchJson).then(res=>{
					console.log("searchResult",res)

					tableWidget.setTableData(res.result.data)
					tableWidget.setTotal(res.result.total);
					tableWidget.setLoading(false);
					//loading.close();
				}).catch(error=>{
					tableWidget.setLoading(false);
					console.log("searcherror",error)
				})
			},

			// =========================================================
			// 表格右键菜单相关方法
			// =========================================================
			saveCustomer(){
				this.menuVisible=false;
				setStorage(this.widget.id,this.widget.options.tableColumns);
			},
			resetCustomer(){
				this.menuVisible=false;
				removeStorageItem(this.widget.id);
				 this.$message({
				          showClose: true,
				          message: '重置成功，刷新页面生效',
				          type: 'success'
				        });
			},
			contextmenu(row, event) {
				this.menuVisible = true;
				window.event.returnValue = false;
				document.addEventListener("click", this.closeMenu);
				this.top = event.clientY-300;
				this.left = event.clientX-300;
				this.$nextTick(()=>{
					this.dragSort()
				})
			},
			closeMenu() {
				document.removeEventListener("click", this.closeMenu); // 取消监听事件
			  this.menuVisible = false;
			},
			dragSort() {
				const el = this.$refs.singleTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
				var tableData = this.widget.options.tableColumns;
				this.sortable = Sortable.create(el, {
					ghostClass: 'sortable-ghost',
					setData: function (dataTransfer) {
						dataTransfer.setData('Text', '')
					},
					onEnd: e => {
					//e.oldIndex为拖动一行原来的位置，e.newIndex为拖动后新的位置
						const targetRow = tableData.splice(e.oldIndex, 1)[0];
						tableData.splice(e.newIndex, 0, targetRow);
						let dragId = tableData[e.newIndex].id;//拖动行的id
						let oneId,twoId
						//拖动行的前一行
						if( tableData[e.newIndex-1]){
						 oneId = tableData[e.newIndex-1].id;}
						else {
						 oneId = ""
						}
						//拖动行的后一行
						if( tableData[e.newIndex+1]){
						 twoId = tableData[e.newIndex+1].id;}
						else {
						 twoId = ""
						}
					}
				})

			},
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

	.card-container {
	  margin: 3px;

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

	.float-right {
	  float: right;
		padding: 0px 10px;
	}
	.el-dropdown{
		margin-left:-2px;
		margin-right: -2px;
		border-left: 1px solid rgba(255,255,255,.5);
		border-right: 1px solid rgba(255,255,255,.5);
		border-radius: 0px;
	}
	.el-button{
		border-left: 1px solid rgba(255,255,255,.5);
		border-right: 1px solid rgba(255,255,255,.5);
	}
	.leftClass{
		text-align: left;
	}
	.centerClass{
		text-align: center;
	}
	.rightClass{
		text-align: right;
	}
	.el-button-group>.el-button{
		float: none;
	}
	.select-menu{
	  position: absolute;
	  background-color: #ffffff;
	  border-radius: 5px;
	  border: 1px solid #ccc;
	  padding: 5px;
	  z-index: 100;
	}
</style>
