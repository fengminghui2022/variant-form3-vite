<template>
  <div id="app">
    <VFormDesigner :designer-config="designerConfig"
                   :field-list-data="fieldListData"
                   :global-dsv="globalDsv" ref="vfdRef">
      <!--
      <template #customToolButtons>
        <el-button link @click="changeThemePrimaryColor">改色</el-button>
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

      /* 集成后端字段名称选择功能--演示 */
      fieldListData: {
        fieldList: [
          {
            label: '客户名称',
            name: 'accountName'
          },
          {
            label: '手机号',
            name: 'mobilePhone'
          },
          {
            label: '订单明细.产品编号',
            name: 'productNo'
          }
        ],
        subFormList: [
          {
            label: '订单明细',
            name: 'orderDetail'
          },
          {
            label: '发货明细',
            name: 'deliveryDetail'
          }
        ]
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

    changeThemePrimaryColor() {
      const bodyElement = document.getElementsByTagName("body")[0]
      bodyElement.style.setProperty("--vf-color-primary", "red");
      bodyElement.style.setProperty("--el-color-primary", "red");
    },

  }
}
</script>

<style lang="scss">
  #app {
    height: 100%;
  }
</style>
