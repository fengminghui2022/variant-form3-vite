<template>
  <el-form-item :label="i18nt('designer.setting.textForAppend')">
    <el-input type="text" v-model="optionModel.textForAppend"></el-input>
  </el-form-item>
</template>

<script>
  import i18n from "@/utils/i18n"

  export default {
    name: "textForAppend-editor",
    mixins: [i18n],
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
  }
</script>

<style lang="scss" scoped>

</style>
