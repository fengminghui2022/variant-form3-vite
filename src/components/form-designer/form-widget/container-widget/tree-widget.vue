<template>
	<container-wrapper :designer="designer" :widget="widget" :parent-widget="parentWidget" :parent-list="parentList"
	  :index-of-parent-list="indexOfParentList">
		<div :key="widget.id" class="tree-container"
	     :class="{'selected': selected}" @click.stop="selectWidget(widget)">
			<el-container>
				<el-main style="align-items: baseline;">
					<el-input v-if="widget.options.filter" :placeholder="i18nt('designer.setting.enterForQuery')" v-model="filterText"></el-input>
					<el-button-group>
							<el-button type="primary" plain v-if="widget.options.expandRetractAllNode" @click="expandAllNode()">
								{{i18nt('designer.setting.expandRetractAllNode')}}
							</el-button>
							<el-button type="primary" plain v-if="widget.options.selectClearAllNode && widget.options.showCheckBox" @click="selectAllNode()">
								{{i18nt('designer.setting.selectClearAllNode')}}
							</el-button>
					</el-button-group>
						
					<el-tree :data="widget.options.treeData" :props="defaultProps" ref="tree" border
						:lazy="widget.options.lazy" 
						node-key="id"
						highlight-current
						:current-node-key="curren"
						:show-checkbox="widget.options.showCheckBox" 
						:accordion="widget.options.accordion"
						:default-expanded-keys="widget.options.defaultEK"
						:default-checked-keys="widget.options.defaultCK"
						:expand-on-click-node="widget.options.expandOnClickNode"
						:default-expand-all="widget.options.defultExpandAll"
						:draggable="widget.options.draggable"
						:filter-node-method="filterNode">
						<template #default="{ node, data }">
							<span class="custom-tree-node">
								<span>{{ node.label }}</span>
								<span v-if="widget.options.nodeEdit">
									<a > {{i18nt('designer.setting.add')}} </a>
									<a style="margin-left: 8px"> {{i18nt('designer.setting.delete')}} </a>
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
  import i18n from "@/utils/i18n"
  import containerMixin from "@/components/form-designer/form-widget/container-widget/containerMixin"
  import ContainerWrapper from "@/components/form-designer/form-widget/container-widget/container-wrapper"
  import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'
  import refMixinDesign from "@/components/form-designer/refMixinDesign"
	
	let id = 1000;
  export default {
    name: "TreeWidget",
    componentName: 'ContainerWidget',  //必须固定为ContainerWidget，用于接收父级组件的broadcast事件
		mixins: [i18n, containerMixin, refMixinDesign],
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
		computed: {
		  selected() {
		    return this.widget.id === this.designer.selectedId
		  },
		  customClass() {
		    return this.widget.options.customClass || ''
		  },
		},
		data() {
			return {
				isexpand:true,
				isSelected:false,
				curren:'',
				filterText: '',
				defaultProps: {
					children: 'children',
					label: 'label'
				}
			}
		},
		watch:{
      filterText(val) {
        this.$refs.tree.filter(val);
      }
    },
    created() {
			this.initRefList()
    },
    methods: {
			setDataSource(data){
				this.widget.options.treeData=data;
				this.curren=data[0].id;
			},
			// 给当前节点添加下级节点
			append(data) {
				this.$prompt(this.i18nt('designer.setting.inputNodeName'), 
				this.i18nt('designer.setting.tips'), {
					confirmButtonText: this.i18nt('designer.hint.confirm'),
					cancelButtonText: this.i18nt('designer.hint.cancel'),
				}).then(({ value }) => {
					const newChild = { id: id++, label: value, children: [] };
					if (!data.children) {
						this.$set(data, 'children', []);
					}
					data.children.push(newChild);
				}).catch(() => {
					return;     
				});
			},
			// 删除节点
			remove(node, data) {
				this.$confirm(this.i18nt('designer.setting.deleteNode'), 
					this.i18nt('designer.setting.tips'), {
					confirmButtonText: this.i18nt('designer.hint.confirm'),
					cancelButtonText: this.i18nt('designer.hint.cancel'),
					type: 'warning'
				}).then(() => {
					const parent = node.parent;
					const children = parent.data.children || parent.data;
					const index = children.findIndex(d => d.id === data.id);
					children.splice(index, 1);
					this.$message({
						type: 'success',
						message: '删除成功!'
					});
				}).catch(() => {
					         
				});
			},
			expandAllNode(){
				this.isexpand = !this.isexpand;
				this.changeTreeNodeExpaned(this.$refs.tree.store.root);
			},
			//改变节点的展开/收缩状态
			changeTreeNodeExpaned(node) {
				node.expanded = this.isexpand;
				for(let i = 0; i < node.childNodes.length; i++ ) {
				 //改变节点的自身expanded状态
					node.childNodes[i].expanded = this.isexpand;
				 //看看他孩子的长度，有的话就调用自己往下找
					if(node.childNodes[i].childNodes.length > 0) {
						this.changeTreeNodeExpaned(node.childNodes[i]);
					}
				}
			},
			selectAllNode(){ 
				this.isSelected = !this.isSelected;
				this.changeTreeNodeSelected(this.$refs.tree.store.root);
			},
			//改变节点的勾选状态
			changeTreeNodeSelected(node) {
				node.checked = this.isSelected;
				for(let i = 0; i < node.childNodes.length; i++ ) {
				 //改变节点的自身checked状态
					node.childNodes[i].checked = this.isSelected;
				 //看看他孩子的长度，有的话就调用自己往下找
					if(node.childNodes[i].childNodes.length > 0) {
						this.changeTreeNodeSelected(node.childNodes[i]);
					}
				}
			},
			filterNode(value, data) {
				if (!value) return true;
				return data.label.indexOf(value) !== -1;
			},
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