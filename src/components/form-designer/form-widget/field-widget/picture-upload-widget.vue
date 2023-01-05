<template>
  <form-item-wrapper :designer="designer" :field="field" :rules="rules" :design-state="designState"
                     :parent-widget="parentWidget" :parent-list="parentList" :index-of-parent-list="indexOfParentList"
                     :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex" :sub-form-row-id="subFormRowId">
    <!-- el-upload增加:name="field.options.name"后，会导致又拍云上传失败！故删除之！！ -->
    <el-upload ref="fieldEditor" :disabled="field.options.disabled || isReadMode"
               :action="realUploadURL" :headers="uploadHeaders" :data="uploadData"
               :with-credentials="field.options.withCredentials"
               :multiple="field.options.multipleSelect" :file-list="fileList" :show-file-list="field.options.showFileList"
               list-type="picture-card" :class="{'hideUploadDiv': uploadBtnHidden || isReadMode}"
               :limit="field.options.limit" :on-exceed="handlePictureExceed" :on-preview="handlePicturePreview"
               :before-upload="beforePictureUpload"
               :on-success="handlePictureUpload" :on-error="handleUploadError"
               :before-remove="handleBeforeRemove" :on-remove="handlePictureRemove">
      <template #tip>
        <div class="el-upload__tip"
             v-if="!!field.options.uploadTip">{{field.options.uploadTip}}</div>
      </template>
      <div class="uploader-icon"><svg-icon icon-class="el-plus" /></div>
    </el-upload>

    <div v-if="showPreviewDialogFlag" v-drag="['.drag-dialog.el-dialog', '.drag-dialog .el-dialog__header']">
      <el-dialog title="" v-model="showPreviewDialogFlag"
                 append-to-body width="60%"
                 :show-close="true" class="drag-dialog small-padding-dialog"
                 :close-on-click-modal="true" :close-on-press-escape="true" :destroy-on-close="true">
        <img :src="previewUrl" style="width: 100%" alt="" />
      </el-dialog>
    </div>
  </form-item-wrapper>
</template>

<script>
	import { toRefs ,reactive, getCurrentInstance, computed, onMounted, onBeforeUnmount } from 'vue'

  import FormItemWrapper from './form-item-wrapper'
  import SvgIcon from '@/components/svg-icon'
  import {deepClone} from "@/utils/util";

  import { useEmitter } from '@/utils/emitter'
  import { useI18n } from '@/utils/i18n'

  import { useField } from "@/components/form-designer/form-widget/field-widget/fieldMixin";

  

  export default {
    name: "picture-upload-widget",
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
      FormItemWrapper,
      SvgIcon,
    },
    setup(props) {
      
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
        fileListBeforeRemove: [],  //删除前的文件列表
        uploadBtnHidden: false,

        previewUrl: '',
        showPreviewDialogFlag: false,
      })

      const fieldMixin = useField(props,data);

      const realUploadURL=computed(()=> {
        let uploadURL = props.field.options.uploadURL
        if (!!uploadURL && ((uploadURL.indexOf('DSV.') > -1) || (uploadURL.indexOf('DSV[') > -1))) {
          let DSV = fieldMixin.getGlobalDsv()
          console.log('test DSV: ', DSV)  //防止DSV被打包工具优化！！！
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


      fieldMixin.registerToRefList()
      fieldMixin.initOptionItems()
      fieldMixin.initFieldModel()
      fieldMixin.initEventHandler()
      fieldMixin.buildFieldRules()

      fieldMixin.handleOnCreated()


      
      const handlePictureExceed=()=> {
        let uploadLimit = props.field.options.limit
        proxy.$message.warning( i18nt('render.hint.uploadExceed').replace('${uploadLimit}', uploadLimit) )
      }

      const handlePicturePreview=(file)=> {
        data.previewUrl = file.url
        data.showPreviewDialogFlag = true
      }

      const beforePictureUpload=(file)=> {
        let fileTypeCheckResult = false
        if (!!props.field.options && !!props.field.options.fileTypes) {
          let uploadFileTypes = props.field.options.fileTypes
          if (uploadFileTypes.length > 0) {
            fileTypeCheckResult = uploadFileTypes.some( (ft) => {
              return file.type === 'image/' + ft
            })
          }
        }
        if (!fileTypeCheckResult) {
          proxy.$message.error(i18nt('render.hint.unsupportedFileType') + file.type)
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

      const handlePictureUpload=(res, file, fileList)=> {
        if (file.status === 'success') {
          let customResult = null
          if (!!props.field.options.onUploadSuccess) {
            let customFn = new Function('result', 'file', 'fileList', props.field.options.onUploadSuccess)
            customResult = customFn.call(proxy, res, file, fileList)
          }

          updateFieldModelAndEmitDataChangeForUpload(fileList, customResult, res)
          data.fileList = deepClone(fileList)
          data.uploadBtnHidden = fileList.length >= props.field.options.limit
        }
      }

      const updateFieldModelAndEmitDataChangeForRemove=(file, fileList)=> {
        let oldValue = deepClone(data.fieldModel)
        let foundFileIdx = -1
        data.fileListBeforeRemove.map((fi, idx) => {  /* 跟element-ui不同，element-plus删除文件时data.fileList数组对应元素已被删除！！ */
          if ((fi.name === file.name) && ((fi.url === file.url) || (!!fi.uid && fi.uid === file.uid))) {  /* 这个判断有问题？？ */
            foundFileIdx = idx
          }
        })
        if (foundFileIdx > -1) {
          data.fieldModel.splice(foundFileIdx, 1)
        }

        fieldMixin.syncUpdateFormModel(data.fieldModel)
        fieldMixin.emitFieldDataChange(data.fieldModel, oldValue)
      }

      const handleBeforeRemove=(file, fileList)=> {
        /* 保留删除之前的文件列表！！ */
        data.fileListBeforeRemove = deepClone(fileList)
      }

      const handlePictureRemove=(file, fileList)=> {
        updateFieldModelAndEmitDataChangeForRemove(file, fileList)
        data.fileList = deepClone(fileList)
        data.uploadBtnHidden = fileList.length >= props.field.options.limit

        if (!!props.field.options.onFileRemove) {
          let customFn = new Function('file', 'fileList', props.field.options.onFileRemove)
          customFn.call(proxy, file, fileList)
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

        handlePictureExceed,
        handlePicturePreview,
        beforePictureUpload,
        handleOnBeforeUpload,
        updateFieldModelAndEmitDataChangeForUpload,
        handlePictureUpload,
        updateFieldModelAndEmitDataChangeForRemove,
        handleBeforeRemove,
        handlePictureRemove,
        handleUploadError
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../../../styles/global.scss"; /* form-item-wrapper已引入，还需要重复引入吗？ */

  .full-width-input {
    width: 100% !important;
  }

  .hideUploadDiv {
    :deep(div.el-upload--picture-card) { /* 隐藏最后的图片上传按钮 */
      display: none;
    }

    :deep(div.el-upload--text) { /* 隐藏最后的文件上传按钮 */
      display: none;
    }

    :deep(div.el-upload__tip) { /* 隐藏最后的文件上传按钮提示 */
      display: none;
    }
  }

  .uploader-icon {
    height: 100%;
    display: flex;
    color: #8c939d;
    font-size: 28px;
    justify-content: center;
    align-items: center;
  }

</style>
