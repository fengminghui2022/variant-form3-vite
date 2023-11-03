<template>
  <el-form-item :label="i18nt('designer.setting.tabType')">
    <el-select v-model="optionModel.tabType">
      <el-option label="default" value=""></el-option>
      <el-option label="card" value="card"></el-option>
      <el-option label="border-card" value="border-card"></el-option>
    </el-select>
  </el-form-item>
</template>

<script>
  import i18n from "@/utils/i18n"

  export default {
    name: "tabType-editor",
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
