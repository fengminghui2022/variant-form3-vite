<template>
	<div>
		<el-dialog
			title="点击事件"
			:visible.sync="dialogVisible"
			:show-close="false"
			v-dialog-drag
			:close-on-click-modal="false"
			:close-on-press-escape="false"
			:modal-append-to-body="false"
			:destroy-on-close="true"
			width="65%">
			<code-editor ref="jsEditor" :mode="'javascript'" v-model="textarea"></code-editor>
		  <span slot="footer" class="dialog-footer">
		    <el-button @click="dialogVisible = false">取 消</el-button>
		    <el-button type="primary" @click="saveClickHandle">确 定</el-button>
		  </span>
		</el-dialog>
		<draggable tag="ul" :list="optionModel.buttons"
		           v-bind="{group:'optionsGroup', ghostClass: 'ghost', handle: '.drag-option'}">
		  <li v-for="(option, idx) in optionModel.buttons" :key="idx">
				<i class="iconfont icon-drag drag-option"></i>
				<el-form-item label="按钮ID">
						<el-input v-model="option.id" size="small" ></el-input>
				</el-form-item>
				<el-form-item label="按钮名称">
						<el-input v-model="option.label" size="small" ></el-input>
				</el-form-item>
				<el-form-item label="按钮图标">
						<el-input v-model="option.icon" size="small" ></el-input>
				</el-form-item>
			  <el-checkbox v-model="option.bExtend">{{i18nt('designer.hint.dropdownbtn')}}</el-checkbox>
			  <el-button-group>
				  <el-tooltip :content="i18nt('designer.hint.dropbtnset')" placement="top" v-if="option.bExtend">
				     <el-button type="primary" icon="el-icon-setting" @click="setEvent(idx)" size="small"></el-button>
				  </el-tooltip>
				  <el-tooltip :content="i18nt('designer.hint.editbtn')" placement="top">
				     <el-button type="primary" icon="el-icon-edit" @click="editEvent(option,idx)" size="small"></el-button>
				  </el-tooltip>
			   <el-tooltip :content="i18nt('designer.hint.addbtn')" placement="top">
			     <el-button type="primary" icon="el-icon-plus" @click="addOption(idx)" size="small"></el-button>
			   </el-tooltip>
			   <el-tooltip :content="i18nt('designer.hint.deletebtn')" placement="top">
			      <el-button type="primary" icon="el-icon-delete" @click="deleteOption(option, idx)" size="small"></el-button>
			   </el-tooltip>
			  </el-button-group>
		  </li>
		</draggable>

		<el-dialog :title="i18nt('designer.setting.buttonGroupEdit')"
			:visible.sync="dialogVisible2"
			:modal-append-to-body="false"
			width="65%">
			<el-tabs v-model="tableColItemActive">
				<el-tab-pane label="按钮设置" name="table">

					<el-table :data="childBtn" style="width: 100%"
						class="panes-setting" :cell-style="{padding:'1px 0'}"
						default-expand-all :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
						height="300" border row-key="btnID" ref="singleTable" stripe>

							<el-table-column label="操作" width="90" fixed="left" align="center">
								<template slot-scope="scope">
									<el-tooltip class="item" effect="dark" content="添加按钮" placement="top">
										<el-button size="small" type="success" circle
											@click="handleAdd(scope.$index)" icon="el-icon-plus"></el-button>
									</el-tooltip>
									<el-tooltip class="item" effect="dark" content="删除按钮" placement="top">
										<el-button size="small" type="danger" circle
											@click="handleDelete(scope.$index)" icon="el-icon-minus"></el-button>
									</el-tooltip>
								</template>
							</el-table-column>
							<el-table-column label="" width="30">
							  <i class="iconfont icon-drag drag-option" style="cursor:move;"
									v-bind="{group:'panesGroup', ghostClass: 'ghost', handle: '.drag-option'}"></i>
							</el-table-column>
							<el-table-column label="按钮ID" width="160" prop="label">
							  <template slot-scope="scope">
									<el-input v-model="scope.row.id" size="small"></el-input>
							  </template>
							</el-table-column>
							<el-table-column label="按钮名" width="160" prop="label">
							  <template slot-scope="scope">
									<el-input v-model="scope.row.label" size="small"></el-input>
							  </template>
							</el-table-column>

							<el-table-column label="点击事件" width="130" prop="onClick" >
								<template slot-scope="scope">
									<el-button
										size="small"
										type="info"
										icon="el-icon-edit"
										plain round
										@click="editClickEventHandler(scope.$index,scope.row.onClick)">
										{{i18nt('designer.setting.addEventHandler')}}</el-button>
								</template>
							</el-table-column>
					  </el-table>
				</el-tab-pane>

			</el-tabs>
		<div slot="footer" class="dialog-footer">
				<el-button size="large" type="primary" @click="dialogVisible2=false">{{i18nt('designer.hint.confirm')}}</el-button>
			</div>
		</el-dialog>

	</div>
</template>

<script>
	// import Draggable from 'vuedraggable'
	import CodeEditor from '@/components/code-editor/index'
	import eventMixin from "@/components/form-designer/setting-panel/property-editor/event-handler/eventMixin"
	import i18n from "@/utils/i18n";
	import Sortable from "sortablejs"
	export default{
		name:'btngroupsetting',
		mixins: [i18n,eventMixin],
		components: {
		  CodeEditor,
		},
		props: {
		  designer: Object,
		  selectedWidget: Object,
		},
    data(){
      return{
         eventParams: [],
		 dialogVisible:false,
		 dialogVisible2:false,
		 eventMethods:"",
		 textarea:"",
		 idx:0,
		 cidx:0,
		 tableColItemActive:'table',
		 modelType:''
      }
    },
	mounted() {
		console.log("dyz",this.selectedWidget.options)
	},
	computed: {
	  optionModel() {
	    return this.selectedWidget.options
	  },
	  childBtn(){
		  return this.selectedWidget.options.buttons[this.idx].extendBtns;
	  }

	},
	watch: {
	  'selectedWidget.options': {
	    deep: true,
	    handler(val) {
	      //console.log('888888', 'Options change!')
	    }
	  },
	  },
	  methods: {
		  dragSort() {
		  	const el = this.$refs.singleTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
		  	var tableData = this.selectedWidget.options.buttons[this.idx].extendBtns;
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
	  setEvent(index){
		  this.idx=index;
		  this.dialogVisible2=true;
		  this.$nextTick(()=>{
		  	this.dragSort()
		  })
	  },
	    deleteOption(option, index) {
			this.$confirm('是否确认删除?', '提示', {
			     confirmButtonText: '确定',
			     cancelButtonText: '取消',
			     type: 'warning'
			    }).then(() => {
			    this.selectedWidget.options.buttons.splice(index, 1)
			     this.$message({
			      type: 'success',
			      message: '删除成功!'
			     });
			     // 若只剩一行，删行之后添加一条空行
			     if(this.selectedWidget.options.buttons.length==0){
			       // this.$message('表格只有一列时无法删除');
			       // return false;
			       var item={disabled:false,display:true,label:'new button',icon:"el-icon-info",type:"primary",onClick:"",extendBtns:[{disabled:false,display:true,onClick:"",label:'new childBtn'}]}
			       this.selectedWidget.options.buttons.splice(index+1,0,item);
			     }
			    }).catch(() => {

			    });

	    },
		addOption(index){
			var item={disabled:false,display:true,label:'new button',icon:"el-icon-info",type:"primary",onClick:"",extendBtns:[{disabled:false,display:true,onClick:"",label:'new childBtn'}]}
			this.selectedWidget.options.buttons.splice(index+1,0,item);
		},
		editEvent(option,index){
			this.modelType="P";
			this.textarea=option.onClick
			this.idx=index;
			this.dialogVisible=true;
			this.$refs.jsEditor.aceEditor.setValue(option.onClick)
		},
		editClickEventHandler(index,option){
			this.modelType="C"
			this.textarea=option
			this.cidx=index;
			this.dialogVisible=true;
			this.$refs.jsEditor.aceEditor.setValue(option)
		},
		saveClickHandle(){
			// debugger
			if(this.modelType=="P"){
				this.selectedWidget.options.buttons[this.idx].onClick=this.textarea
			}
			if(this.modelType=="C"){
				this.selectedWidget.options.buttons[this.idx].extendBtns[this.cidx].onClick=this.textarea;
			}
			this.dialogVisible=false;
		},
		// 添加按钮
		handleAdd(index){
			let newRow = {disabled:false,display:true,onClick:"",label:'new childBtn'}
			this.selectedWidget.options.buttons[this.idx].extendBtns.splice(index+1,0,newRow);
		},

		// 删除按钮
		handleDelete(index,row){
			this.$confirm('是否确认删除?', '提示', {
			     confirmButtonText: '确定',
			     cancelButtonText: '取消',
			     type: 'warning'
			    }).then(() => {
			   this.selectedWidget.options.buttons[this.idx].extendBtns.splice(index,1)
			     this.$message({
			      type: 'success',
			      message: '删除成功!'
			     });
			     // 若只剩一行，删行之后添加一条空行
			     if(this.selectedWidget.options.buttons[this.idx].extendBtns.length==0){
			       let newRow = {disabled:false,display:true,onClick:"",label:'new childBtn'}
			       this.selectedWidget.options.buttons[this.idx].extendBtns.splice(index+1,0,newRow);
			     }
			    }).catch(() => {

			    });


		},

	},
	}

</script>

<style scoped>
	 li{ list-style: none;}
	 ul{
		 padding-left: 0px;
	 }
	 .el-button-group{
		 margin: 5px 0px 5px 16px;

	 }
</style>
