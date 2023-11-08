<template>
  <el-form-item :label="i18nt('designer.setting.formulaEnabled')">
    <el-switch v-model="optionModel.formulaEnabled" @change="handleChangeEvent"></el-switch>
  </el-form-item>
</template>

<script>
  import i18n from "@/utils/i18n";

  export default {
    name: "formulaEnabled-editor",
    mixins: [i18n],
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    methods: {
      handleChangeEvent() {
        if (this.optionModel.formula === undefined) {
          this.optionModel.formula = ''
        }
      }
    },

  }
</script>

<style scoped>

</style>
