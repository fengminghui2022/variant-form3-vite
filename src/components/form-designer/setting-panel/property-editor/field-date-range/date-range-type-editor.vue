<template>
  <el-form-item :label="i18nt('designer.setting.displayType')">
    <el-select v-model="optionModel.type" @change="refreshDateRange">
      <el-option label="daterange" value="daterange"></el-option>
      <el-option label="datetimerange" value="datetimerange"></el-option>
      <el-option label="monthrange" value="monthrange"></el-option>
    </el-select>
  </el-form-item>
</template>

<script>
  import i18n from "@/utils/i18n";

  export default {
    name: "date-range-type-editor",
    mixins: [i18n],
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    methods: {
      refreshDateRange() {
        const drWidget = this.designer.formWidget.getSelectedWidgetRef()
        if (drWidget && drWidget.refreshWidgetKey) {
          drWidget.refreshWidgetKey()
        }
      },

    }
  }
</script>

<style lang="scss" scoped>

</style>
