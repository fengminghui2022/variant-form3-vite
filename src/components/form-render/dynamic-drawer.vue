<template>
  <el-drawer ref="drawerRef" :title="options.title" v-model="drawerVisible" custom-class="dynamic-drawer" append-to-body destroy-on-close
             :size="options.size" :modal="options.showModal" :direction="options.direction"
             :show-close="options.showClose" :close-on-click-modal="options.closeOnClickModal"
             :close-on-press-escape="options.closeOnPressEscape"
             :before-close="handleBeforeClose" @close="handleCloseEvent" @opened="handleOpenedEvent">
    <VFormRender ref="dFormRef" :form-json="formJson" :form-data="formData"
                 :option-data="optionData" :global-dsv="globalDsv" :parent-form="parentFormRef"
                 :disabled-mode="options.disabledMode" :dynamic-creation="true">
    </VFormRender>
    <template #footer>
      <div style="float: right">
        <el-button v-if="!options.cancelButtonHidden" @click="handleCancelClick">
          {{cancelBtnLabel}}</el-button>
        <el-button v-if="!options.okButtonHidden" type="primary" @click="handleOkClick">
          {{okBtnLabel}}</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script>
  import { reactive, toRefs, computed,nextTick, getCurrentInstance, onBeforeUnmount  } from 'vue'

  import { useI18n } from '@/utils/i18n'

  export default {
    name: "dynamic-drawer",
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
      const drawerRef=ref(null);
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
        data.drawerVisible = true

        //设置readMode模式
        nextTick(() => {
          if (!!props.options.readMode) {
            dFormRef.value.setReadMode(true)
          }

          dFormRef.value.setDialogOrDrawerRef(proxy)
          props.parentFormRef.setChildFormRef(dFormRef.value)
        })
      }

      const close=()=> {
        if (!!props.options.onDrawerBeforeClose) {
          let customFn = new Function(props.options.onDrawerBeforeClose)
          let closeResult = customFn.call(proxy)
          if (closeResult === false) {
            return
          }
        }

        data.drawerVisible = false
        drawerRef.handleClose()
        setTimeout(deleteWrapperNode, 150)
      }

      const deleteWrapperNode=()=> {
        let wrapperNode = document.getElementById('vf-dynamic-drawer-wrapper' + props.wrapperId)
        if (!!wrapperNode) {
          document.body.removeChild(wrapperNode)
        }
      }

      const handleBeforeClose=(done)=> {
        if (!!props.options.onDrawerBeforeClose) {
          let customFn = new Function(props.options.onDrawerBeforeClose)
          let closeResult = customFn.call(proxy)
          return (closeResult === false) ? closeResult : done()
        }

        return done()
      }

      const handleCloseEvent=()=> {
        data.drawerVisible = false
        setTimeout(deleteWrapperNode, 150)
      }

      const handleOpenedEvent=()=> {
        if (!!props.options.onDrawerOpened) {
          let customFn = new Function(props.options.onDrawerOpened)
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

        data.drawerVisible = false
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

        data.drawerVisible = false
        setTimeout(deleteWrapperNode, 150)
      }

      const getParentFormRef=()=> {
        return props.parentFormRef
      }

      const getFormRef=()=> {
        return dFormRef.value
      }

      const getWidgetRef=(widgetName, showError = false)=> {
        return dFormRef.value.getWidgetRef(widgetName, showError)
      }

      const getExtraData=()=> {
        return props.extraData
      }


      
      onBeforeUnmount(()=>{
        props.parentFormRef.setChildFormRef(null)
      })

      return {
        i18nt,
        ...toRefs(props),

        dFormRef,
        drawerRef,

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

    },
    methods: {
     
    }
  }
</script>

<style lang="scss" scoped>
  .dynamic-drawer {
    :deep(.el-drawer__header) {
      margin-bottom: 10px;
    }

    :deep(.el-drawer__body) {
      padding: 15px;
    }
  }

</style>
