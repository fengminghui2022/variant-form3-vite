<template>
  <el-form-item :label="i18nt('designer.setting.allowCreate')">
    <el-switch v-model="optionModel.allowCreate" @change="onAllowCreateChange"></el-switch>
  </el-form-item>
</template>

<script>
  import i18n from "@/utils/i18n"
  import propertyMixin from "@/components/form-designer/setting-panel/property-editor/propertyMixin";

  export default {
    name: "allowCreate-editor",
    mixins: [i18n, propertyMixin],
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    setup(props){
      const { i18nt }=useI18n();

      return {
        i18nt,
        ...toRefs(props),
      }
    }  

  }
</script>

<style scoped>

</style>
