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
        this.drawerVisible = true

        //设置readMode模式
        nextTick(() => {
          if (!!this.options.readMode) {
            dFormRef.value.setReadMode(true)
          }

          dFormRef.value.setDialogOrDrawerRef(this)
          this.parentFormRef.setChildFormRef(dFormRef.value)
        })
      }

      const close=()=> {
        if (!!this.options.onDrawerBeforeClose) {
          let customFn = new Function(this.options.onDrawerBeforeClose)
          let closeResult = customFn.call(this)
          if (closeResult === false) {
            return
          }
        }

        this.drawerVisible = false
        this.$refs['drawerRef'].handleClose()
        setTimeout(this.deleteWrapperNode, 150)
      }

      const deleteWrapperNode=()=> {
        let wrapperNode = document.getElementById('vf-dynamic-drawer-wrapper' + this.wrapperId)
        if (!!wrapperNode) {
          document.body.removeChild(wrapperNode)
        }
      }

      const handleBeforeClose=(done)=> {
        if (!!this.options.onDrawerBeforeClose) {
          let customFn = new Function(this.options.onDrawerBeforeClose)
          let closeResult = customFn.call(this)
          return (closeResult === false) ? closeResult : done()
        }

        return done()
      }

      const handleCloseEvent=()=> {
        this.drawerVisible = false
        setTimeout(this.deleteWrapperNode, 150)
      }

      const handleOpenedEvent=()=> {
        if (!!this.options.onDrawerOpened) {
          let customFn = new Function(this.options.onDrawerOpened)
          customFn.call(this)
        }
      }

      const handleCancelClick=()=> {
        if (!!this.options.onCancelButtonClick) {
          let customFn = new Function(this.options.onCancelButtonClick)
          let clickResult = customFn.call(this)
          if (clickResult === false) {
            return
          }
        }

        this.drawerVisible = false
        setTimeout(this.deleteWrapperNode, 150)
      }

      const handleOkClick=()=> {
        if (!!this.options.onOkButtonClick) {
          let customFn = new Function(this.options.onOkButtonClick)
          let clickResult = customFn.call(this)
          if (clickResult === false) {
            return
          }
        }

        this.drawerVisible = false
        setTimeout(this.deleteWrapperNode, 150)
      }

      const getParentFormRef=()=> {
        return this.parentFormRef
      }

      const getFormRef=()=> {
        return dFormRef.value
      }

      const getWidgetRef=(widgetName, showError = false)=> {
        return dFormRef.value.getWidgetRef(widgetName, showError)
      }

      const getExtraData=()=> {
        return this.extraData
      }


      
      onBeforeUnmount(()=>{
        props.parentFormRef.setChildFormRef(null)
      })

      return {
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
