<template>
  <el-dialog :title="options.title" v-model="dialogVisible" append-to-body destroy-on-close draggable
             :width="options.width" :fullscreen="options.fullscreen" :modal="options.showModal"
             :show-close="options.showClose" :close-on-click-modal="options.closeOnClickModal"
             :close-on-press-escape="options.closeOnPressEscape" :center="options.center"
             :before-close="handleBeforeClose" @close="handleCloseEvent" @opened="handleOpenedEvent">
    <VFormRender ref="dFormRef" :form-json="formJson" :form-data="formData"
                   :option-data="optionData" :global-dsv="globalDsv" :parent-form="parentFormRef"
                   :disabled-mode="options.disabledMode" :dynamic-creation="true">
    </VFormRender>
    <template #footer>
      <div>
        <el-button v-if="!options.cancelButtonHidden" @click="handleCancelClick">
          {{cancelBtnLabel}}</el-button>
        <el-button v-if="!options.okButtonHidden" type="primary" @click="handleOkClick">
          {{okBtnLabel}}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
  import { reactive, toRefs, computed,nextTick, getCurrentInstance, onBeforeUnmount  } from 'vue'

  import { useI18n } from '@/utils/i18n'

  export default {
    name: "dynamic-dialog",
    props: {
      options: {
        type: Object,
        default: () => ({})
      },
      formJson: {
        type: Object,
      },
      formData: {
        type: Object,
        default: () => ({})
      },
      optionData: { //prop传入的选项数据
        type: Object,
        default: () => ({})
      },
      globalDsv: { // 全局数据源变量
        type: Object,
        default: () => ({})
      },
      parentFormRef: {
        type: Object,
        default: null
      },
      extraData: {
        type: Object,
        default: () => ({})
      },
      wrapperId: {
        type: String,
        default: null
      }
    },
    setup(props){
      const { i18nt }= useI18n();
  		const { proxy } = getCurrentInstance()

      const dFormRef=ref(null);
      const data=reactive( {
        dialogVisible: false,
      })

      const cancelBtnLabel=computed(()=> {
         return props.options.cancelButtonLabel || i18nt('designer.hint.cancel')
      })

      const okBtnLabel=computed(()=> {
         return props.options.okButtonLabel || i18nt('designer.hint.confirm')
      })

      const show=()=> {
        data.dialogVisible = true

        //设置readMode模式
        nextTick(() => {
          if (!!props.options.readMode) {
            dFormRef.valuesetReadMode(true)
          }

          dFormRef.valuesetDialogOrDrawerRef(proxy)
          props.parentFormRef.setChildFormRef(dFormRef)
        })
      }

      const close=()=> {
        if (!!props.options.onDialogBeforeClose) {
          let customFn = new Function('done', props.options.onDialogBeforeClose)
          let closeResult = customFn.call(proxy)
          if (closeResult === false) {
            return
          }
        }

        data.dialogVisible = false
        setTimeout(deleteWrapperNode, 150)
      }

      const deleteWrapperNode=()=> {
        let wrapperNode = document.getElementById('vf-dynamic-dialog-wrapper' + props.wrapperId)
        if (!!wrapperNode) {
          document.body.removeChild(wrapperNode)
        }
      }

      const handleBeforeClose=(done)=> {
        if (!!props.options.onDialogBeforeClose) {
          let customFn = new Function('done', props.options.onDialogBeforeClose)
          let closeResult = customFn.call(proxy)
          return (closeResult === false) ? closeResult : done()
        }

        return done()
      }

      const handleCloseEvent=()=> {
        data.dialogVisible = false
        setTimeout(deleteWrapperNode, 150)
      }

      const handleOpenedEvent=()=> {
        if (!!props.options.onDialogOpened) {
          let customFn = new Function(props.options.onDialogOpened)
          customFn.call(proxy)
        }
      }

      const handleCancelClick=()=> {
        if (!!props.options.onCancelButtonClick) {
          let customFn = new Function(props.options.onCancelButtonClick)
          let clickResult = customFn.call(proxy)
          if (clickResult === false) {
            return
          }
        }

        data.dialogVisible = false
        setTimeout(deleteWrapperNode, 150)
      }

      const handleOkClick=()=> {
        if (!!props.options.onOkButtonClick) {
          let customFn = new Function(props.options.onOkButtonClick)
          let clickResult = customFn.call(proxy)
          if (clickResult === false) {
            return
          }
        }

        data.dialogVisible = false
        setTimeout(deleteWrapperNode, 150)
      }

      const getParentFormRef=()=> {
        return props.parentFormRef
      }

      const getFormRef=()=> {
        return dFormRef
      }

      const getWidgetRef=(widgetName, showError = false)=> {
        return dFormRef.valuegetWidgetRef(widgetName, showError)
      }

      const getExtraData=()=> {
        return props.extraData
      }


      onBeforeUnmount(()=>{
        props.parentFormRef.setChildFormRef(null)
      })

      return{
        i18nt,
        ...toRefs(props),

        dFormRef,

        cancelBtnLabel,
        okBtnLabel,

        show,
        close,
        deleteWrapperNode,
        handleBeforeClose,
        handleCloseEvent,
        handleOpenedEvent,
        handleCancelClick,
        handleOkClick,
        getParentFormRef,
        getFormRef,
        getWidgetRef,
        getExtraData
      }
    }
  }
</script>

<style scoped>

</style>
