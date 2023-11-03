<template>
  <el-form-item :label="i18nt('designer.setting.tabPosition')">
    <el-select v-model="optionModel.tabPosition">
      <el-option label="top" value="top"></el-option>
      <el-option label="right" value="right"></el-option>
      <el-option label="bottom" value="bottom"></el-option>
      <el-option label="left" value="left"></el-option>
    </el-select>
  </el-form-item>
</template>

<script>
  import i18n from "@/utils/i18n"

  export default {
    name: "tabPosition-editor",
    mixins: [i18n],
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
  }
</script>

<style scoped>

</style>
