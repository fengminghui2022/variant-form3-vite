<template>
  <el-form-item :label="i18nt('designer.setting.autosize')">
    <el-switch v-model="optionModel.autosize" @change="refreshTextArea"></el-switch>
  </el-form-item>
</template>

<script>
  import i18n from "@/utils/i18n"
  import propertyMixin from "@/components/form-designer/setting-panel/property-editor/propertyMixin";

  export default {
    name: "autosize-editor",
    mixins: [i18n, propertyMixin],
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    methods: {
      refreshTextArea() {
        const taWidget = this.designer.formWidget.getSelectedWidgetRef()
        if (taWidget && taWidget.refreshWidgetKey) {
          taWidget.refreshWidgetKey()
        }
      },
    }

  }
</script>

<style scoped>

</style>
