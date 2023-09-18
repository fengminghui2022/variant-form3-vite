<template>
  <el-form-item v-if="optionModel.multiple" :label="i18nt('designer.setting.collapseTags')">
    <el-switch v-model="optionModel.collapseTags"></el-switch>
  </el-form-item>
</template>

<script>
  import i18n from "@/utils/i18n"

  export default {
    name: "collapseTags-editor",
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
