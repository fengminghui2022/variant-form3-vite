<template>
  <div>
    <el-form-item :label="i18nt('designer.setting.colSpanTitle')" v-if="!optionModel.responsive">
    </el-form-item>
    <el-form-item label-width="0" v-if="!optionModel.responsive">
      <el-slider v-model="optionModel.span" :max="24" :step="2" show-stops show-input />
    </el-form-item>

    <el-form-item :label="i18nt('designer.setting.colSpanTitle') + '(PC)'"
                  v-if="!!optionModel.responsive && (formConfig.layoutType === 'PC')">
    </el-form-item>
    <el-form-item label-width="0"
                  v-if="!!optionModel.responsive && (formConfig.layoutType === 'PC')">
      <el-slider v-model="optionModel.md" :max="24" :step="2" show-stops show-input />
    </el-form-item>

    <el-form-item :label="i18nt('designer.setting.colSpanTitle') + '(Pad)'"
                  v-if="!!optionModel.responsive && (formConfig.layoutType === 'Pad')">
    </el-form-item>
    <el-form-item label-width="0"
                  v-if="!!optionModel.responsive && (formConfig.layoutType === 'Pad')">
      <el-slider v-model="optionModel.sm" :max="24" :step="2" show-stops show-input />
    </el-form-item>

    <el-form-item :label="i18nt('designer.setting.colSpanTitle') + '(H5)'"
                  v-if="!!optionModel.responsive && (formConfig.layoutType === 'H5')">
    </el-form-item>
    <el-form-item label-width="0"
                  v-if="!!optionModel.responsive && (formConfig.layoutType === 'H5')">
      <el-slider v-model="optionModel.xs" :max="24" :step="2" show-stops show-input />
    </el-form-item>
  </div>
</template>

<script>
  import i18n from "@/utils/i18n";

  export default {
    name: "grid-col-span-editor",
    mixins: [i18n],
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    data() {
      return {
        marks: {
          4: '1/6',
          6: '1/4',
          8: '1/3',
          12: '1/2',
          16: '2/3',
          18: '3/4'
        }
      }
    },
    computed: {
      formConfig() {
        return this.designer.formConfig
      },


    }
  }
</script>

<style scoped>
  :deep(.el-slider__input) {
    width: 90px;
  }

</style>
