<template>
  <el-config-provider :locale="elLocale">
  <div id="app">
    <VFormDesigner ref="vFormRef" :designer-config="designerConfig" :global-dsv="globalDsv" />
    <!-- <test :designer="()=>{return vFormRef}"></test> -->
  </div>
  </el-config-provider>
</template>

<script>

import { 
  computed, getCurrentInstance, reactive,ref,toRefs
} from 'vue'
import VFormDesigner from './components/form-designer/index.vue'

import zhCNLang from 'element-plus/lib/locale/lang/zh-cn'
import enUSLang from 'element-plus/lib/locale/lang/en'

// import test from './test'
export default {
  name: 'App',
  components: {
    VFormDesigner,
    // test
  },
  setup(){    
    const { proxy } = getCurrentInstance()
    const vFormRef= ref(null)

    const data=reactive({
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

        elLocaleMap: {
          'zh-CN': zhCNLang,
          'en-US': enUSLang,
        }
    })

    const elLocale=computed(()=>{
      let curLocale = localStorage.getItem('v_form_locale') || 'zh-CN'
      return data.elLocaleMap[curLocale]
    })

    const submitForm=()=>{
      vFormRef.getFormData().then(formData => {
        // Form Validation OK
        alert( JSON.stringify(formData) )
      }).catch(error => {
        // Form Validation failed
        proxy.$message.error(error)
      })
    }
    return {
      vFormRef,

      ...toRefs(data),
      elLocale,

      submitForm
    }
  }
}
</script>

<style lang="scss">
  #app {
    height: 100%;
  }
</style>
