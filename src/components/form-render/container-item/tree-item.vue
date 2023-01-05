<template>
	<container-item-wrapper :widget="widget">
		<el-container>
			<el-main style="align-items: baseline;">
				<el-input :size="widget.options.size" v-if="widget.options.filter" :placeholder="i18nt('designer.setting.enterForQuery')" v-model="filterText"></el-input>
				<el-button-group>
				  <el-button type="primary" round plain :size="widget.options.size" v-if="widget.options.expandRetractAllNode" @click="expandAllNodes()">
						{{i18nt('designer.setting.expandRetractAllNode')}}
					</el-button>
				  <el-button type="primary" round plain :size="widget.options.size" v-if="widget.options.selectClearAllNode && widget.options.showCheckBox" @click="checkAllNodes()">
						{{i18nt('designer.setting.selectClearAllNode')}}
					</el-button>
				</el-button-group>
				<el-tree :data="widget.options.treeData" :props="defaultProps" ref="tree" border
					:lazy="widget.options.lazy"
					node-key="id"
					highlight-current
					:current-node-key="currentKey"
					:show-checkbox="widget.options.showCheckBox"
					:expand-on-click-node="widget.options.expandOnClickNode"
					:default-expand-all="widget.options.defaultExpandAllNode"
					:draggable="widget.options.draggable"
				    v-loading="loadingFlag"
					@node-click="handleTreeNodeClick"
					@node-contextmenu="handleTreeNodeContextmenu"
					@check="handleTreeNodeCheck"
				  @check-change="handleCheckChange"
					:filter-node-method="filterNode">
					<template #default="{ node, data }">
						<span class="custom-tree-node">
							<span>{{ node.label }}</span>
							<span v-if="widget.options.nodeEdit">
								<el-button type="primary" link :size="widget.options.size" @click.stop="append(data)">
									{{i18nt('designer.setting.add')}}
								</el-button>
								<el-button type="primary" link :size="widget.options.size" @click.stop="remove(node, data)">
									{{i18nt('designer.setting.delete')}}
								</el-button>
							</span>
						</span>
					</template>
				</el-tree>
			</el-main>
		</el-container>
	</container-item-wrapper>
</template>
<script>
  import { computed, toRefs, ref, watch, inject, reactive, getCurrentInstance, nextTick, onBeforeUnmount, onMounted } from 'vue'
  
  import { useI18n } from '@/utils/i18n'
  import { useEmitter } from '@/utils/emitter'
  import { useRef } from "@/components/form-render/refMixin"
  
  import { useContainer } from "@/components/form-render/container-item/containerItemMixin"
  import ContainerItemWrapper from '@/components/form-render/container-item/container-item-wrapper'
  import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'
  import {getDSByName, overwriteObj, runDataSourceRequest} from "@/utils/util";


  let id = 1000;
  export default {
    name: "TreeItem",
	componentName: 'ContainerItem',  //必须固定为ContainerItem，用于接收父级组件的broadcast事件
	components: {
		ContainerItemWrapper,
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
		const refList = inject('refList');
		const sfRefList = inject('sfRefList');
		const globalModel = inject('globalModel');
		const getFormConfig = inject('getFormConfig');
		const getGlobalDsv = inject('getGlobalDsv');

		const { i18nt }=useI18n();

		const emitterMixin =useEmitter();	

		const tree= ref(null);
    	const { proxy } = getCurrentInstance();

		const data=reactive({
			isExpanded:true,
			isChecked:false,
			currentKey:'',
			filterText: '',
			loadingFlag: false,			
			defaultProps: {
				children: 'children',
				label: 'label'
			}
		})
		
      	const refMixin = useRef(props);
      	const containerMixin= useContainer(props,data,{});


		const formConfig=computed(()=> {
			return getFormConfig()
		})

		watch(()=>data.filterText, (val) => {
			tree.value.filter(val);
		})

		onBeforeUnmount(()=>{
			containerMixin.unregisterFromRefList()
		})

		onMounted(()=>{
			if (!!props.widget.options.dsEnabled) {
				loadDataFromDS({})
			}

			nextTick(() => {
				handleOnMounted()
			})
		})

		// 给当前节点添加下级节点
		const append=(data)=> {
			proxy.$prompt(i18nt('designer.setting.inputNodeName'), 
				i18nt('designer.setting.tips'), {
					confirmButtonText: i18nt('designer.hint.confirm'),
					cancelButtonText: i18nt('designer.hint.cancel'),
			}).then(({ value }) => {
				const newChild = { id: id++, label: value, children: [] };
				if (!data.children) {
					data.children=[]
				}
				data.children.push(newChild);
			}).catch((err) => {
				console.error(err)
			});
		}
			// 删除节点
		const remove=(node, data)=> {
			proxy.$confirm(i18nt('designer.setting.deleteNode'), 
				i18nt('designer.setting.tips'), {
				confirmButtonText: i18nt('designer.hint.confirm'),
				cancelButtonText: i18nt('designer.hint.cancel'),
				type: 'warning'
			}).then(() => {
				const parent = node.parent;
				const children = parent.data.children || parent.data;
				const index = children.findIndex(d => d.id === data.id);
				children.splice(index, 1);
				proxy.$message({
					type: 'success',
					message: i18nt('designer.setting.nodeDeleted'),
				});
			}).catch((err) => {
				console.error(err)
			});
		}
		
		const filterNode=(value, data)=> {
			if (!value) return true;
			return data.label.indexOf(value) !== -1;
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
			
		/** 树节点点击事件
		 * @param {Object} data 传递给 data 属性的数组中该节点所对应的对象
		 * @param {Object} node 节点对应的 Node
		 * @param {Object} el 节点组件本身
		 */
		const handleTreeNodeClick=(data,node,el)=> {
			if (!!props.widget.options.onNodeClick) {
				let customFn = new Function('data','node','el',props.widget.options.onNodeClick)
				customFn.call(proxy,data,node,el)
			}
		}
			
		/** 树节点右键事件
		 * @param {Object} event 事件句柄
		 * @param {Object} data 传递给 data 属性的数组中该节点所对应的对象
		 * @param {Object} node 节点对应的 Node
		 * @param {Object} el 节点组件本身
		 */
		const handleTreeNodeContextmenu=(event,data,node,el)=> {
			if (!!props.widget.options.onNodeContextmenu) {
				let customFn = new Function('event','data','node','el',props.widget.options.onNodeContextmenu)
				customFn.call(proxy,event,data,node,el)
			}
		}

		/** 树组件当复选框被点击的时候触发
		 * @param {Object} checkNode
		 * @param {Object} checkNodePlus
		 */
		const handleTreeNodeCheck=(data,treeState)=> {
			if (!!props.widget.options.onNodeCheck) {
				let customFn = new Function('data', 'treeState', props.widget.options.onNodeCheck)
				customFn.call(proxy, data, treeState)
			}
		}
		
		
		const handleCheckChange=(data, checked, indeterminate)=> {
			if (!!props.widget.options.onCheckChange) {
				let customFn = new Function('data', 'checked', 'indeterminate', props.widget.options.onCheckChange)
				customFn.call(props, data, checked, indeterminate)
			}
		}
		
		//改变节点的展开/收缩状态
		const setNodeExpanded=(node, flag)=> {
			node.expanded = flag;
			for(let i = 0; i < node.childNodes.length; i++ ) {
				//改变节点的自身expanded状态
				node.childNodes[i].expanded = flag;
				//看看他孩子的长度，有的话就调用自己往下找
				if(node.childNodes[i].childNodes.length > 0) {
					setNodeExpanded(node.childNodes[i], flag);
				}
			}
		}
		//改变节点的勾选状态
		const setNodeChecked=(node, flag)=> {
			node.checked = flag;
			for(let i = 0; i < node.childNodes.length; i++ ) {
				//改变节点的自身checked状态
				node.childNodes[i].checked = flag;
				//看看他孩子的长度，有的话就调用自己往下找
				if(node.childNodes[i].childNodes.length > 0) {
					setNodeChecked(node.childNodes[i], flag);
				}
			}
		}

		//--------------------- 以下为组件支持外部调用的API方法 begin ------------------//
		/* 提示：用户可自行扩充这些方法！！！ */


		const getNativeTree=()=> {
				return tree.value
		}

		const setTreeData=(data)=> {
			props.widget.options.treeData = data;
			data.currentKey = data[0].id;
		}

		const getTreeData=()=> {
			return props.widget.options.treeData;
		}

		const expandAllNodes=(flag)=> {
			data.isExpanded = flag || !data.isExpanded;
			setNodeExpanded(tree.value.store.root, data.isExpanded);
		}


		const checkAllNodes=(flag)=> { //debugger
			data.isChecked = flag || !data.isChecked;
			setNodeChecked(tree.value.store.root, data.isChecked);
		}


		const setCheckedNodes=(nodes)=> {
			tree.value.setCheckedNodes(nodes)
		}

		const getCheckedNodes=(leafOnly, includeHalfChecked)=> {
			tree.value.getCheckedNodes(leafOnly, includeHalfChecked)
		}
		
		/**
		 * 从数据源加载数据
		 * @param localDsv 本地数据源变量DSV
		 * @param dsName 数据源名称，不传此值，则使用dsName属性绑定的数据源
		 */
		const loadDataFromDS=(localDsv = {}, dsName = '')=>{
			let curDSName = dsName || proxy.widget.options.dsName
			let curDSetName = proxy.widget.options.dataSetName
			let curDS = getDSByName(proxy.formConfig, curDSName)
			if (!!curDS) {
				let gDsv = getGlobalDsv() || {}
				let newDsv = new Object({})
				overwriteObj(newDsv, gDsv)
				overwriteObj(newDsv, localDsv)
				newDsv.widgetName = props.widget.options.name
				data.loadingFlag = true
				runDataSourceRequest(curDS, newDsv, this.getFormRef(), false, proxy.$message).then(res => {
					if (!!curDSetName && res.hasOwnProperty(curDSetName)) {
						setTreeData(res[curDSetName])
					} else {
						setTreeData(res)
					}
					data.loadingFlag = false
				}).catch(err => {
					proxy.$message.error(err.message)
					data.loadingFlag = false
				})
			}
		}

		//--------------------- 以上为组件支持外部调用的API方法 end ------------------//

		refMixin.initRefList()
		handleOnCreated()

		return {
			i18nt,
			...toRefs(props),
			...toRefs(data),
			formConfig,

			tree,

			append,
			remove,
			
			filterNode,		
			getNativeTree,	
			setTreeData,
			getTreeData,
			expandAllNodes,
			setNodeExpanded,
			setNodeChecked,
			checkAllNodes,
			setCheckedNodes,
			getCheckedNodes,
			loadDataFromDS,
			handleTreeNodeClick,
			handleTreeNodeContextmenu,
			handleTreeNodeCheck,
			handleCheckChange
		}
	}
  }
</script>
<style lang="scss" scoped>
    .readonly-mode-field {
      display: inline-block;
      white-space: pre-wrap;
      line-height: 1.5;
    }
	.custom-tree-node {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 14px;
		padding-right: 8px;
	}
</style>