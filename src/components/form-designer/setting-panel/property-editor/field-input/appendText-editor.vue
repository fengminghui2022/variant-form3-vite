<template>
  <div>
    <el-form-item :label="i18nt('designer.setting.appendText')">
      <el-switch v-model="optionModel.appendText" @change="handleChangeEvent"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
  import i18n from "@/utils/i18n"

  export default {
    name: "appendText-editor",
    mixins: [i18n],
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    methods: {
      handleChangeEvent(val) {
        if (val) {
          this.selectedWidget.options.appendButton = false
        }
      },

    }
  }
</script>

<style scoped>

</style>
