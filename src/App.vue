<template>
  <div id="app">
    <VFormDesigner :designer-config="designerConfig" :global-dsv="globalDsv" ref="vfdRef">
      <!--
      <template #customToolButtons>
        <el-button link @click="doTest">test</el-button>
      </template>
      --> 
    </VFormDesigner>
  </div>
</template>

<script>
import VFormDesigner from './components/form-designer/index.vue'

export default {
  name: 'App',
  components: {
    VFormDesigner,
  },
  data() {
    return {
      formJson: {"widgetList":[],"formConfig":{"modelName":"formData","refName":"vForm","rulesName":"rules","labelWidth":80,"labelPosition":"left","size":"","labelAlign":"label-left-align","cssCode":"","customClass":"","functions":"","layoutType":"PC","onFormCreated":"","onFormMounted":"","onFormDataChange":"","onFormValidate":""}},
      formData: {},
      optionData: {},

      designerConfig: {
        //logoHeader: false,
      },

      //全局数据源变量
      globalDsv: {
        testApiHost: 'http://www.test.com/api'
      },

    }
  },
  computed: {
    //
  },
  methods: {
    doTest() {
      console.info('form data schema is: ' + JSON.stringify( this.$refs.vfdRef.buildFormDataSchema() ))
    },

  }
}
</script>

<style lang="scss">
  #app {
    height: 100%;
  }
</style>
