<template>
  <el-form-item :label="i18nt('designer.setting.treeDataEdit')">
  	<el-button type="primary" plain round @click="openTreeDataEdit">{{i18nt('designer.setting.editAction')}}</el-button>
		<div v-if="dataDialogVisible" v-drag="['.drag-dialog.el-dialog', '.drag-dialog .el-dialog__header']">
			<el-dialog :title="i18nt('designer.setting.treeDataEdit')" v-model="dataDialogVisible"
								 :show-close="true" class="drag-dialog small-padding-dialog" append-to-body
								 :close-on-click-modal="false" :close-on-press-escape="false"
								 :destroy-on-close="true" width="75%">
				<code-editor :mode="'json'" :readonly="false" v-model="treeDataOptions"></code-editor>
				<template #footer>
					<div class="dialog-footer">
						<el-button size="default" type="primary" @click="saveTreeData">{{i18nt('designer.hint.confirm')}}</el-button>
						<el-button size="default" @click="dataDialogVisible = false">{{i18nt('designer.hint.cancel')}}</el-button>
					</div>
				</template>
			</el-dialog>
		</div>
  </el-form-item>
	
</template>

<script>
  import { reactive,computed,getCurrentInstance } from 'vue';
  import { useI18n } from '@/utils/i18n'
  import CodeEditor from '@/components/code-editor/index'
  export default {
    name: "treeData-editor",
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
	components: {
		CodeEditor,
	},
    setup(props){
      const { i18nt }=useI18n();
      const { proxy } = getCurrentInstance()

	  const data=reactive({
		dataDialogVisible:false,
		treeDataOptions:[],
	  })

	  const openTreeDataEdit=computed(()=>{
		data.dataDialogVisible=true;
		// this.optionModel
		data.treeDataOptions = JSON.stringify(props.optionModel.treeData, null, '  ')
	  })
	  const saveTreeData=computed(()=>{
		try {
			props.optionModel.treeData = JSON.parse(data.treeDataOptions)
			//TODO: 是否需要重置选项默认值？？
			data.dataDialogVisible = false
		} catch (ex) {
			proxy.$message.error(i18nt('designer.hint.invalidOptionsData') + ex.message)
		}
	  })

      return {
        i18nt,
		openTreeDataEdit,
		saveTreeData
      }
    }
  }
</script>

<style lang="scss" scoped>
	
	.small-padding-dialog {
	  :deep(.el-dialog__body) {
	    padding: 6px 15px 12px 15px !important;
	  }
	
		:deep(.ace-container) {
			border: 1px solid #DCDFE6;
		}
	
		.dialog-footer {
			text-align: center;
		}
	}
</style>
