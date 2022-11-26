<template>
  <form-item-wrapper :designer="designer" :field="field" :rules="rules" :design-state="designState"
                     :parent-widget="parentWidget" :parent-list="parentList" :index-of-parent-list="indexOfParentList"
                     :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex" :sub-form-row-id="subFormRowId">
    <!-- el-upload增加:name="field.options.name"后，会导致又拍云上传失败！故删除之！！ -->
        <el-upload ref="fieldEditor"
               :disabled="field.options.disabled || isReadMode"
               :style="styleVariables" class="dynamicPseudoAfter"
               :action="realUploadURL" :headers="uploadHeaders" :data="uploadData"
               :with-credentials="field.options.withCredentials"
               :multiple="field.options.multipleSelect" :file-list="fileList"
               :show-file-list="field.options.showFileList" :class="{'hideUploadDiv': uploadBtnHidden || isReadMode}"
               :limit="field.options.limit" :on-exceed="handleFileExceed" :before-upload="beforeFileUpload"
               :on-success="handleFileUpload" :on-error="handleUploadError">
      <template #tip>
        <div class="el-upload__tip"
             v-if="!!field.options.uploadTip">{{field.options.uploadTip}}</div>
      </template>
      <template #default>
        <svg-icon icon-class="el-plus" /><i class="el-icon-plus avatar-uploader-icon"></i>
      </template>
      <template #file="{ file }">
        <div class="upload-file-list">
          <span class="upload-file-name" :title="file.name">{{file.name}}</span>
          <a :href="file.url" download="" target="_blank">
            <span class="el-icon-download file-action" :title="i18nt('render.hint.downloadFile')">
              <svg-icon icon-class="el-download" />
            </span></a>
          <span class="file-action" :title="i18nt('render.hint.removeFile')"
                v-if="!field.options.disabled && !isReadMode"
            @click="removeUploadFile(file.name, file.url, file.uid)"><svg-icon icon-class="el-delete" /></span>
        </div>
      </template>
    </el-upload>
  </form-item-wrapper>
</template>

<script>
	import { toRefs ,reactive,inject, getCurrentInstance, computed, onMounted, onBeforeUnmount } from 'vue'
  import FormItemWrapper from './form-item-wrapper'
  
  import { useEmitter } from '@/utils/emitter'
  import { useI18n,translate } from '@/utils/i18n'
  
  import {deepClone} from "@/utils/util";
  import { useField } from "@/components/form-designer/form-widget/field-widget/fieldMixin";

  import SvgIcon from "@/components/svg-icon/index";

  let selectFileText = "'" + translate('render.hint.selectFile') + "'"

  export default {
    name: "file-upload-widget",
    componentName: 'FieldWidget',  //必须固定为FieldWidget，用于接收父级组件的broadcast事件
    props: {
      field: Object,
      parentWidget: Object,
      parentList: Array,
      indexOfParentList: Number,
      designer: Object,

      designState: {
        type: Boolean,
        default: false
      },

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
      },

    },
    components: {
      SvgIcon,
      FormItemWrapper,
    },
    setup(props){
      
      const { i18nt }=useI18n();
      const emitterMixin =useEmitter();
      
      
      const { proxy } = getCurrentInstance()
      const data=reactive({
        oldFieldValue: null, //field组件change之前的值
        fieldModel: [],
        rules: [],

        uploadHeaders: {},
        uploadData: {
          key: '',  //七牛云上传文件名
          //token: '',  //七牛云上传token

          //policy: '',  //又拍云上传policy
          //authorization: '',  //又拍云上传签名
        },
        fileList: [],  //上传文件列表
        uploadBtnHidden: false,

        styleVariables: {
          '--select-file-action': selectFileText,
        },
      })
      
      const fieldMixin = useField(props,data);

      const realUploadURL=computed(()=> {
        let uploadURL = props.field.options.uploadURL
        if (!!uploadURL && ((uploadURL.indexOf('DSV.') > -1) || (uploadURL.indexOf('DSV[') > -1))) {
          let DSV = fieldMixin.getGlobalDsv()
          return eval(props.field.options.uploadURL)
        }

        return props.field.options.uploadURL
      })
      
      onMounted(()=>{
        fieldMixin.handleOnMounted()
      })

      onBeforeUnmount(()=>{
        fieldMixin.unregisterFromRefList()
      })

      /* 注意：子组件mounted在父组件created之后、父组件mounted之前触发，故子组件mounted需要用到的prop
         需要在父组件created中初始化！！ */
      fieldMixin.registerToRefList()
      fieldMixin.initFieldModel()
      fieldMixin.initEventHandler()
      fieldMixin.buildFieldRules()

      fieldMixin.handleOnCreated()


      const handleFileExceed=()=> {
        let uploadLimit = props.field.options.limit
        proxy.$message.warning( i18nt('render.hint.uploadExceed').replace('${uploadLimit}', uploadLimit) )
      }

      const beforeFileUpload=(file)=> {
        let fileTypeCheckResult = false
        let extFileName = file.name.substring(file.name.lastIndexOf('.') + 1)
        if (!!props.field.options && !!props.field.options.fileTypes) {
          let uploadFileTypes = props.field.options.fileTypes
          if (uploadFileTypes.length > 0) {
            fileTypeCheckResult = uploadFileTypes.some( (ft) => {
              return extFileName.toLowerCase() === ft.toLowerCase()
            })
          }
        }
        if (!fileTypeCheckResult) {
          proxy.$message.error(i18nt('render.hint.unsupportedFileType') + extFileName)
          return false;
        }

        let fileSizeCheckResult = false
        let uploadFileMaxSize = 5  //5MB
        if (!!props.field.options && !!props.field.options.fileMaxSize) {
          uploadFileMaxSize = props.field.options.fileMaxSize
        }
        fileSizeCheckResult = file.size / 1024 / 1024 <= uploadFileMaxSize
        if (!fileSizeCheckResult) {
          proxy.$message.error(i18nt('render.hint.fileSizeExceed') + uploadFileMaxSize + 'MB')
          return false;
        }

        data.uploadData.key = file.name
        return handleOnBeforeUpload(file)
      }

      const handleOnBeforeUpload=(file)=> {
        if (!!props.field.options.onBeforeUpload) {
          let bfFunc = new Function('file', props.field.options.onBeforeUpload)
          let result = bfFunc.call(proxy, file)
          if (typeof result === 'boolean') {
            return result
          } else {
            return true
          }
        }

        return true
      }

      const updateFieldModelAndEmitDataChangeForUpload=(fileList, customResult, defaultResult)=> {
        data.fieldModel = data.fieldModel || []
        let oldValue = deepClone(data.fieldModel)
        if (!!customResult && !!customResult.name && !!customResult.url) {
          data.fieldModel.push({
            name: customResult.name,
            url: customResult.url
          })
        } else if (!!defaultResult && !!defaultResult.name && !!defaultResult.url) {
          data.fieldModel.push({
            name: defaultResult.name,
            url: defaultResult.url
          })
        } else {
          data.fieldModel = deepClone(fileList)
        }
        fieldMixin.syncUpdateFormModel(data.fieldModel)
        fieldMixin.emitFieldDataChange(data.fieldModel, oldValue)
      }

      const handleFileUpload=(res, file, fileList)=> {
        if (file.status === 'success') {
          let customResult = null
          if (!!props.field.options.onUploadSuccess) {
            let mountFunc = new Function('result', 'file', 'fileList', props.field.options.onUploadSuccess)
            customResult = mountFunc.call(proxy, res, file, fileList)
          }
          file.url=res.url
          updateFieldModelAndEmitDataChangeForUpload(fileList, customResult, res)
          if (!!customResult && !!customResult.name) {
            file.name = customResult.name
          }
          if (!!customResult && !!customResult.url) {
            file.url = customResult.url
          }
          data.fileList = deepClone(fileList)
          data.uploadBtnHidden = fileList.length >= props.field.options.limit
        }
      }

      const updateFieldModelAndEmitDataChangeForRemove=(deletedFileIdx, fileList)=> {
        let oldValue = deepClone(data.fieldModel)
        data.fieldModel.splice(deletedFileIdx, 1)
        fieldMixin.syncUpdateFormModel(data.fieldModel)
        fieldMixin.emitFieldDataChange(data.fieldModel, oldValue)
      }

      const removeUploadFile=(fileName, fileUrl, fileUid)=> {
        let foundIdx = -1
        let foundFile = null
        data.fileList.forEach((file, idx) => {
          if ((file.name === fileName) && ((file.url === fileUrl) || (!!fileUid && file.uid === fileUid))) {
            foundIdx = idx
            foundFile = file
          }
        })

        if (foundIdx >= 0) {
          data.fileList.splice(foundIdx, 1)
          updateFieldModelAndEmitDataChangeForRemove(foundIdx, data.fileList)
          data.uploadBtnHidden = data.fileList.length >= props.field.options.limit

          if (!!props.field.options.onFileRemove) {
            let customFn = new Function('file', 'fileList', props.field.options.onFileRemove)
            customFn.call(proxy, foundFile, data.fileList)
          }
        }
      }

      const handleUploadError=(err, file, fileList)=> {
        if (!!props.field.options.onUploadError) {
          let customFn = new Function('error', 'file', 'fileList', props.field.options.onUploadError)
          customFn.call(proxy, err, file, fileList)
        } else {
          proxy.$message({
            message: i18nt('render.hint.uploadError') + err,
            duration: 3000,
            type: 'error',
          })
        }
      }
      return {
        i18nt,
        ...toRefs(props),
        ...toRefs(data),
        ...fieldMixin,

        realUploadURL,

        handleFileExceed,
        beforeFileUpload,
        removeUploadFile,


        handleOnBeforeUpload,
        handleFileUpload,
        handleUploadError,


        updateFieldModelAndEmitDataChangeForUpload,
        updateFieldModelAndEmitDataChangeForRemove,
      }

    }
  }
</script>

<style lang="scss" scoped>
  @import "../../../../styles/global.scss"; /* form-item-wrapper已引入，还需要重复引入吗？ */

  .full-width-input {
    width: 100% !important;
  }

  .dynamicPseudoAfter :deep(.el-upload.el-upload--text) {
    color: $--color-primary;
    font-size: 12px;
    .el-icon-plus:after {
      content: var(--select-file-action);
    }
  }

  .hideUploadDiv {
    :deep(div.el-upload--picture-card) { /* 隐藏最后的图片上传按钮 */
      display: none;
    }

    :deep(div.el-upload--text) { /* 隐藏最后的文件上传按钮 */
      display: none;
    }

    :deep(div.el-upload__tip) { /* 隐藏最后的文件上传按钮 */
      display: none;
    }
  }

  .upload-file-list {
    font-size: 12px;

    .file-action {
      color: $--color-primary;
      margin-left: 5px;
      margin-right: 5px;
      cursor: pointer;
    }
  }

</style>
