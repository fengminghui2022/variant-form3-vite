<template>
  <el-dialog :title="newTitle" v-model="dialogVisible" append-to-body destroy-on-close draggable
             :width="options.width" :fullscreen="options.fullscreen" :modal="options.showModal"
             :show-close="options.showClose" :close-on-click-modal="options.closeOnClickModal"
             :close-on-press-escape="options.closeOnPressEscape" :center="options.center"
             :before-close="handleBeforeClose" @close="handleCloseEvent" @opened="handleOpenedEvent">
    <VFormRender ref="dFormRef" :form-json="formJson"
                   :option-data="optionData" :global-dsv="globalDsv" :parent-form="parentFormRef"
                   :disabled-mode="options.disabledMode" :dynamic-creation="true">
      <!-- 递归传递插槽！！！ -->
      <template v-for="(slot, name) in $slots" v-slot:[name]>
        <slot :name="name"></slot>
      </template>
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
  import i18n from "@/utils/i18n"

  export default {
    name: "dynamic-dialog",
    mixins: [i18n],
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
      },
      title: {
        type: String,
        default: null
      },
    },
    data() {
      return {
        dialogVisible: false,
      }
    },
    computed: {
      cancelBtnLabel() {
        return this.options.cancelButtonLabel || this.i18nt('designer.hint.cancel')
      },

      okBtnLabel() {
        return this.options.okButtonLabel || this.i18nt('designer.hint.confirm')
      },

      newTitle() {
        return this.title || this.options.title
      },

    },
    created() {
      //
    },
    mounted() {
      //
    },
    beforeDestroy() {
      this.parentFormRef.setChildFormRef(null)
    },
    methods: {
      show() {
        this.dialogVisible = true

        //设置readMode模式
        this.$nextTick(() => {
          this.$refs['dFormRef'].setFormData(this.formData)
          this.$nextTick(() => {
            if (!!this.options.readMode) {
              this.$refs['dFormRef'].setReadMode(true)
            }
          })

          this.$refs['dFormRef'].setDialogOrDrawerRef(this)
          this.parentFormRef.setChildFormRef(this.$refs['dFormRef'])
        })
      },

      close() {
        if (!!this.options.onDialogBeforeClose) {
          let customFn = new Function('done', this.options.onDialogBeforeClose)
          let closeResult = customFn.call(this)
          if (closeResult === false) {
            return
          }
        }

        this.dialogVisible = false
        setTimeout(this.deleteWrapperNode, 150)
      },

      deleteWrapperNode() {
        let wrapperNode = document.getElementById('vf-dynamic-dialog-wrapper' + this.wrapperId)
        if (!!wrapperNode) {
          document.body.removeChild(wrapperNode)
        }
      },

      handleBeforeClose(done) {
        if (!!this.options.onDialogBeforeClose) {
          let customFn = new Function('done', this.options.onDialogBeforeClose)
          let closeResult = customFn.call(this)
          return (closeResult === false) ? closeResult : done()
        }

        return done()
      },

      handleCloseEvent() {
        this.dialogVisible = false
        setTimeout(this.deleteWrapperNode, 150)
      },

      handleOpenedEvent() {
        if (!!this.options.onDialogOpened) {
          let customFn = new Function(this.options.onDialogOpened)
          customFn.call(this)
        }
      },

      handleCancelClick() {
        if (!!this.options.onCancelButtonClick) {
          let customFn = new Function(this.options.onCancelButtonClick)
          let clickResult = customFn.call(this)
          if (clickResult === false) {
            return
          }
        }

        this.dialogVisible = false
        setTimeout(this.deleteWrapperNode, 150)
      },

      handleOkClick() {
        if (!!this.options.onOkButtonClick) {
          let customFn = new Function(this.options.onOkButtonClick)
          let clickResult = customFn.call(this)
          if (clickResult === false) {
            return
          }
        }

        this.dialogVisible = false
        setTimeout(this.deleteWrapperNode, 150)
      },

      getParentFormRef() {
        return this.parentFormRef
      },

      getTopFormRef() {
        if (!this.parentFormRef.parentForm) {
          return this.parentFormRef
        }

        let topFormRef = this.parentFormRef
        while (topFormRef.parentForm) {
          topFormRef = topFormRef.parentForm
        }

        return topFormRef
      },

      getFormRef() {
        return this.$refs['dFormRef']
      },

      getWidgetRef(widgetName, showError = false) {
        return this.$refs['dFormRef'].getWidgetRef(widgetName, showError)
      },

      getExtraData() {
        return this.extraData
      },

    }
  }
</script>

<style scoped>

</style>
