<template>
	<container-wrapper :designer="designer" :widget="widget" :parent-widget="parentWidget" :parent-list="parentList"
	  :index-of-parent-list="indexOfParentList">
		<div :key="widget.id" class="tree-container"
	     :class="{'selected': selected}" @click.stop="selectWidget(widget)">
			<el-container>
				<el-main style="align-items: baseline;">
					<el-input v-if="widget.options.filter" :size="widget.options.size" :placeholder="i18nt('designer.setting.enterForQuery')" v-model="filterText"></el-input>
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
						:filter-node-method="filterNode">
						<template #default="{ node, data }">
							<span class="custom-tree-node">
								<span>{{ node.label }}</span>
								<span v-if="widget.options.nodeEdit" @click.stop="()=>{}">
									<el-button type="primary" link :size="widget.options.size">
										{{i18nt('designer.setting.add')}}
									</el-button>
									<el-button type="primary" link :size="widget.options.size">
										{{i18nt('designer.setting.delete')}}
									</el-button>
								</span>
							</span>
						</template>
					</el-tree>
				</el-main>
			</el-container>
		</div>
	</container-wrapper>
</template>

<script>
  import { computed, toRefs, ref, watch, inject, reactive, getCurrentInstance, nextTick } from 'vue'
  import { useI18n } from '@/utils/i18n'
  import { useEmitter } from '@/utils/emitter'
  import { useContainer } from "@/components/form-designer/form-widget/container-widget/containerMixin";
  import { useDesignRef } from "@/components/form-designer/refMixinDesign"

  import ContainerWrapper from "@/components/form-designer/form-widget/container-widget/container-wrapper"
  import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'
  
  let id = 1000;
  export default {
    name: "TreeWidget",
    componentName: 'ContainerWidget',  //必须固定为FieldWidget，用于接收父级组件的broadcast事件
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

		const { i18nt }=useI18n();
		const emitterMixin =useEmitter();
    	const { proxy } = getCurrentInstance();

		const containerMixin = useContainer();
		const designRefMixin = useDesignRef(refList,props.widget);

		const tree= ref(null);
		const data=reactive({
			isExpanded:true,
			isChecked:false,
			currentKey:'',
			filterText: '',
			defaultProps: {
				children: 'children',
				label: 'label'
			}
		})		

		const selected=computed(()=> {
		    return props.widget.id === props.designer.selectedId
		})
		
		const customClass=computed(()=> {
		    return props.widget.options.customClass || ''
		})
	
		watch(()=>data.filterText, (val) => {
			tree.value.filter(val);
		})

			
		// 给当前节点添加下级节点
		const append=(data)=>{
			proxy.$prompt(i18nt('designer.setting.inputNodeName'), 
			i18nt('designer.setting.tips'), {
				confirmButtonText: i18nt('designer.hint.confirm'),
				cancelButtonText: i18nt('designer.hint.cancel'),
			}).then(({ value }) => {
				const newChild = { id: id++, label: value, children: [] };
				if (!data.children) {
					data.children=[];
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
					message: '删除成功!'
				});
			}).catch(() => {
							
			});
		}
			
			
		const filterNode=(value, data)=> {
			if (!value) return true;
			return data.label.indexOf(value) !== -1;
		}

		//改变节点的展开/收缩状态
		const setNodeExpanded=(node, flag)=>{
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
			this.widget.options.treeData = data;
			this.currentKey = data[0].id;
		}

		const getTreeData=()=> {
			return this.widget.options.treeData;
		}

		const expandAllNodes=(flag)=>{
			data.isExpanded = flag || !data.isExpanded;
			setNodeExpanded(tree.value.store.root, data.isExpanded);
		}		
		
		const checkAllNodes=(flag)=>{
			data.isChecked = flag || !data.isChecked;
			setNodeChecked(tree.value.store.root, data.isChecked);
		}
		
		//--------------------- 以上为组件支持外部调用的API方法 end ------------------//

		designRefMixin.initRefList()

		return {
			i18nt,
			...toRefs(props),
			...toRefs(data),
			
        	...designRefMixin,
        	...containerMixin,
			tree,

			selected,
			customClass,

			append,
			remove,

			filterNode,
			getNativeTree,
			setTreeData,
			getTreeData,

			expandAllNodes,
			setNodeExpanded,
			checkAllNodes,
			setNodeChecked
		}
	}
  }
</script>
<style lang="scss" scoped>
  	@import "../../../../styles/global.scss"; /* form-item-wrapper已引入，还需要重复引入吗？ */
  	.readonly-mode-field {
  	  display: inline-block;
  	  white-space: pre-wrap;
  	  line-height: 1.5;
  	}
	.tree-container {
	  //padding: 5px;
	  margin: 2px;

	  .form-widget-list {
	    min-height: 28px;
	  }
	}
	.tree-container.selected {
	  outline: 2px solid $--color-primary !important;
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