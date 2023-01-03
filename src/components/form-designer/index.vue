<!--
/**
 * author: vformAdmin
 * email: vdpadmin@163.com
 * website: https://www.vform666.com
 * date: 2021.08.18
 * remark: 如果要分发VForm源码，需在本文件顶部保留此文件头信息！！
 */
-->

<template>
  <el-container class="main-container full-height">
    <el-header class="main-header" v-if="designerConfig.logoHeader !== false">
      <div class="float-left main-title">
        <img src="../../assets/vform-logo.png" @click="openHome">
        <span class="bold">{{vfProductName}}</span> {{vfProductTitle}} <span class="version-span">Ver {{vFormVersion}}</span></div>
      <div class="float-right external-link">
        <el-dropdown v-if="showLink('languageMenu')" :hide-timeout="2000" @command="handleLanguageChanged">
          <span class="el-dropdown-link">{{curLangName}}<svg-icon icon-class="el-arrow-down" /></span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh-CN">{{i18nt('application.zh-CN')}}</el-dropdown-item>
              <el-dropdown-item command="en-US">{{i18nt('application.en-US')}}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <a v-if="showLink('externalLink')" href="javascript:void(0)" @click="(ev) => openUrl(ev, gitUrl)" target="_blank"><svg-icon icon-class="github" />{{i18nt('application.github')}}</a>
        <a v-if="showLink('externalLink')" href="javascript:void(0)" @click="(ev) => openUrl(ev, docUrl)" target="_blank"><svg-icon icon-class="document" />{{i18nt('application.document')}}</a>
        <a v-if="showLink('externalLink')" href="javascript:void(0)" @click="(ev) => openUrl(ev, chatUrl)" target="_blank">{{i18nt('application.qqGroup')}}</a>
        <a v-if="showLink('externalLink')" href="javascript:void(0)" @click="(ev) => openUrl(ev, subScribeUrl)" target="_blank">
          {{i18nt('application.subscription')}}<i class="el-icon-top-right"></i></a>
       
        <a href="javascript:void(0)">&nbsp;</a>
      </div>
    </el-header>

    <el-container>
      <el-aside class="side-panel">
       <widget-panel :designer="designer" />
      </el-aside>

      <el-container class="center-layout-container">
       <el-header class="toolbar-header">
          <toolbar-panel :designer="designer" :global-dsv="globalDsv" ref="toolbarRef">
            <template v-for="(idx, slotName) in $slots" #[slotName]>
              <slot :name="slotName"></slot>
            </template>
          </toolbar-panel>
        </el-header>
        <el-main class="form-widget-main">
          <el-scrollbar class="container-scroll-bar" :style="{height: scrollerHeight}">
            <v-form-widget :designer="designer" :form-config="designer.formConfig" :global-dsv="globalDsv" ref="formRef">
            </v-form-widget>
          </el-scrollbar>
        </el-main>
      </el-container>

      <el-aside>
        <setting-panel :designer="designer" :selected-widget="designer.selectedWidget" :global-dsv="globalDsv"
                       :form-config="designer.formConfig" @edit-event-handler="testEEH" />
      </el-aside>
    </el-container>

  </el-container>
</template>

<script>
  import { 
    computed, getCurrentInstance, reactive,ref ,nextTick,
    toRefs,provide,
    onMounted
  } from 'vue'


  import WidgetPanel from './widget-panel/index'
  import ToolbarPanel from './toolbar-panel/index'
  import SettingPanel from './setting-panel/index'
  import VFormWidget from './form-widget/index'
  import {
    addWindowResizeHandler, deepClone, getQueryParam, getAllContainerWidgets,
    getAllFieldWidgets, traverseAllWidgets
  } from "@/utils/util"
  import {MOCK_CASE_URL, VARIANT_FORM_VERSION} from "@/utils/config"  
  import { useI18n,useChangeLocale } from '@/utils/i18n'

  import { createDesigner } from "@/components/form-designer/designer3"


  import SvgIcon from "@/components/svg-icon/index"
  export default{
    name: "VFormDesigner",
    components:{
      SvgIcon,
      WidgetPanel,
      ToolbarPanel,
      SettingPanel,
      VFormWidget,
    },
    props: {
      /* 后端字段列表API */
      fieldListApi: {
        type: Object,
        default: null,
      },

      /* 禁止显示的组件名称数组 */
      bannedWidgets: {
        type: Array,
        default: () => []
      },

      /* 设计器配置参数 */
      designerConfig: {
        type: Object,
        default: () => {
          return {
            languageMenu: true,  //是否显示语言切换菜单
            externalLink: true,  //是否显示GitHub、文档等外部链接
            formTemplates: true,  //是否显示表单模板
            eventCollapse: true,  //是否显示组件事件属性折叠面板
            widgetNameReadonly: false,  //禁止修改组件名称

            clearDesignerButton: true,  //是否显示清空设计器按钮
            previewFormButton: true,  //是否显示预览表单按钮
            importJsonButton: true,  //是否显示导入JSON按钮
            exportJsonButton: true,  //是否显示导出JSON器按钮
            exportCodeButton: true,  //是否显示导出代码按钮
            generateSFCButton: true,  //是否显示生成SFC按钮
            logoHeader: true,  //是否显示Logo头部区域（仅Pro）

            toolbarMaxWidth: 420,  //设计器工具按钮栏最大宽度（单位像素）
            toolbarMinWidth: 300,  //设计器工具按钮栏最小宽度（单位像素）

            productName: '',  //自定义表单设计器名称，对应“VForm Pro”（仅Pro）
            productTitle: '',  //自定义表单设计器标题，对应“表单设计器”（仅Pro）

            presetCssCode: '',  //设计器预设CSS样式代码
            languageName: 'zh-CN',  //界面语言，默认显示中文

            resetFormJson: false,  //是否在设计器初始化时将表单内容重置为空
          }
        }
      },
      /* 全局数据源变量 */
      globalDsv: {
        type: Object,
        default: () => ({})
      },

    },
    setup(props,context){
      const { i18nt }=useI18n();
      const { proxy } = getCurrentInstance()
      let $current=proxy;

      /* 页面组件 */
      const toolbarRef= ref(null);
      const formRef= ref(null);


      /* 声明周期事件定义 */
      onMounted(()=>{
          initLocale()

          let logoHeaderHeight = (props.designerConfig.logoHeader !== false) ? 48 : 0
          data.scrollerHeight = window.innerHeight - logoHeaderHeight - 42 + 'px'
          addWindowResizeHandler(() => {
            nextTick(() => {
              data.scrollerHeight = window.innerHeight - logoHeaderHeight - 42 + 'px'
            })
          })

          loadCase()
          loadFieldListFromServer()
      })

      const data = reactive({ 
        vFormVersion: VARIANT_FORM_VERSION,
        curLangName: ref(''),
        curLocale: '',

        docUrl: 'https://www.vform666.com/document3.html',
        gitUrl: 'https://github.com/vform666/variant-form3-vite',
        chatUrl: 'https://www.vform666.com/chat-group.html',
        subScribeUrl: 'https://www.vform666.com/subscribe.html',

        scrollerHeight: 0,

        designer: createDesigner(proxy),

        fieldList: [],

        externalComponents:  {},  //外部组件实例集合 
      })

      provide("serverFieldList", data.fieldList);
      provide("getBannedWidgets",  () =>{return props.bannedWidgets });
      provide("getDesignerConfig",() =>{return props.designerConfig });


      /* 初始化设计器参数 */ 
      data.vsCodeFlag = getQueryParam('vscode') == 1
      data.caseName = getQueryParam('case')
      
      const vfProductName = computed(() =>  {
        return (data.designerConfig && data.designerConfig.productName) || 'VForm Pro'
      });
      const vfProductTitle = computed(() =>  {
        return (data.designerConfig && data.designerConfig.productTitle) ||
            i18nt('application.productTitle')
       });
      

      const testEEH=(eventName, eventParams)=>{
        console.log('test', eventName)
        console.log('test222222', eventParams)
      }

      const showLink=(configName) =>{
        if (props.designerConfig[configName] === undefined) {
          return true
        }

        return !!props.designerConfig[configName]
      }

      /* 国际化相关 */
      const initLocale=()=>{
          data.curLocale = localStorage.getItem('v_form_locale')
          if (!!data.vsCodeFlag) {
            data.curLocale = data.curLocale || 'en-US'
          } else {
            data.curLocale = data.curLocale || 'zh-CN'
          }

          data.curLangName = i18nt('application.' + data.curLocale)
          changeLanguage(data.curLocale)
      }
      const changeLanguage=(langName)=>{
        useChangeLocale(langName)
      }
      const handleLanguageChanged=(command)=>{
        changeLanguage(command)
        data.curLangName = i18nt('application.' + command)
      }



      /* 加载示例 */
      const loadCase=()=>{
        if (!data.caseName) {
          return
        }

        axios.get(MOCK_CASE_URL + data.caseName + '.txt').then(res => {
          if (!!res.data.code) {
            $current.$message.error(i18nt('designer.hint.sampleLoadedFail'))
            return
          }

          setFormJson(res.data)
          $current.$message.success(i18nt('designer.hint.sampleLoadedSuccess'))
        }).catch(error => {
          $current.$message.error(i18nt('designer.hint.sampleLoadedFail') + ':' + error)
        })
      }      
      const loadFieldListFromServer=()=>{
        if (!props.fieldListApi) {
          return
        }

        let headers = props.fieldListApi.headers || {}
        axios.get(props.fieldListApi.URL, {'headers': headers}).then(res => {
          let labelKey = props.fieldListApi.labelKey || 'label'
          let nameKey = props.fieldListApi.nameKey || 'name'

          props.fieldList.splice(0, props.fieldList.length)  //清空已有
          res.data.forEach(fieldItem => {
            props.fieldList.push({
              label: fieldItem[labelKey],
              name: fieldItem[nameKey]
            })
          })
        }).catch(error => {
          $current.$message.error(error)
        })
      }

      /* 其他方法 */
      const openHome=()=>{
        if (!!data.vsCodeFlag) {
          const msgObj = {
            cmd: 'openUrl',
            data: {
              url: 'https://www.vform666.com/'
            }
          }
          window.parent.postMessage(msgObj, '*')
        }
      }
      const openUrl=(event, url)=>{
        if (!!data.vsCodeFlag) {
          const msgObj = {
            cmd: 'openUrl',
            data: {
              url
            }
          }
          window.parent.postMessage(msgObj, '*')
        } else {
          let aDom = event.currentTarget
          aDom.href = url
          //window.open(url, '_blank') //直接打开新窗口，会被浏览器拦截
        }
      }



      /* 对外暴露方法 */
      
      const setFormJson=(formJson)=>{
        let modifiedFlag = false
        if (!!formJson) {
          if (typeof formJson === 'string') {
            modifiedFlag = data.designer.loadFormJson( JSON.parse(formJson) )
          } else if (formJson.constructor === Object) {
            modifiedFlag = data.designer.loadFormJson(formJson)
          }

          if (modifiedFlag) {
            data.designer.emitHistoryChange()
          }
        }
      }

      const getFormJson=()=> {
        return {
          widgetList: deepClone(data.designer.widgetList),
          formConfig: deepClone(data.designer.formConfig)
        }
      }

      const clearDesigner=()=> {
        toolbarRef.value.clearFormWidget()
      }


      /**
       * 刷新表单设计器
       */
      const refreshDesigner=()=> {
        //this.designer.loadFormJson( this.getFormJson() )  //只有第一次调用生效？？
        let fJson = getFormJson()
        data.designer.clearDesigner(true)  //不触发历史记录变更
        data.designer.loadFormJson(fJson)
      }

      /**
       * 预览表单
       */
      const previewForm=()=> {
        toolbarRef.value.previewForm()
      }

      /**
       * 导入表单JSON
       */
      const importJson=()=> {
        toolbarRef.value.importJson()
      }

      /**
       * 导出表单JSON
       */
      const exportJson=()=> {
        toolbarRef.value.exportJson()
      }

      /**
       * 导出Vue/HTML代码
       */
      const exportCode=()=> {
        toolbarRef.value.exportCode()
      }

      /**
       * 生成SFC代码
       */
      const generateSFC=()=> {
        toolbarRef.value.generateSFC()
      }

      /**
       * 获取所有字段组件
       * @param widgetList 默认为null，代表取当前表单json组件列表
       * @param staticWidgetsIncluded 是否包含按钮等静态组件，默认不包含
       * @returns {*[]}
       */
      const getFieldWidgets=(widgetList = null, staticWidgetsIncluded = false)=> {
        return !!widgetList ? getAllFieldWidgets(widgetList, staticWidgetsIncluded) :
            getAllFieldWidgets(data.designer.widgetList, staticWidgetsIncluded)
      }

      /**
       * 获取所有容器组件
       * @param widgetList 默认为null，代表取当前表单json组件列表
       * @returns {*[]}
       */
      const getContainerWidgets=(widgetList = null)=> {
        return !!widgetList ? getAllContainerWidgets(widgetList) : getAllContainerWidgets(data.designer.widgetList)
      }

      /**
       * 升级表单json，以补充最新的组件属性
       * @param formJson
       */
      const upgradeFormJson=(formJson)=> {
        if (!formJson.widgetList || !formJson.formConfig) {
          data.$message.error('Invalid form json!')
          return
        }

        traverseAllWidgets(formJson.widgetList, (w) => {
          data.designer.upgradeWidgetConfig(w)
        })
        data.designer.upgradeFormConfig(formJson.formConfig)

        return formJson
      }

      const getWidgetRef=(widgetName, showError = false)=> {
        return formRef.value.getWidgetRef(widgetName, showError)
      }

      const getSelectedWidgetRef=()=> {
        return formRef.value.getSelectedWidgetRef()
      }

      /**
       * 添加数据源对象
       * @param dsObj
       */
      const addDataSource=(dsObj)=> {
        data.designer.formConfig.dataSources.push(dsObj)
      }

      /**
       * 增加外部组件引用，可通过getEC()方法获取外部组件，以便在VForm内部调用外部组件方法
       * @param componentName 外部组件名称
       * @param externalComponent 外部组件实例
       */
      const addEC=(componentName, externalComponent)=> {
        data.externalComponents[componentName] = externalComponent
      }

      /**
       * 判断外部组件是否可获取
       * @param componentName 外部组件名称
       * @returns {boolean}
       */
      const hasEC=(componentName)=> {
        return data.externalComponents.hasOwnProperty(componentName)
      }

      /**
       * 获取外部组件实例
       * @param componentName
       * @returns {*}
       */
      const getEC=(componentName)=> {
        return data.externalComponents[componentName]
      }


      //初始化设计器
      data.designer.initDesigner(!!data.designer.resetFormJson);
      data.designer.loadFormContentFromStorage();

      return {
        /* 页面组件引用 */
        toolbarRef,
        formRef,

        /* 属性 */
        ...toRefs(data),
        ...props,

        /* 计算属性 */
        vfProductName,
        vfProductTitle,

        /* 方法 */
        i18nt,
        showLink,
        openHome,
        openUrl,
        handleLanguageChanged,

        testEEH,

        /* 暴露方法 */
        setFormJson,
        getFormJson,
        clearDesigner,
        refreshDesigner,
        previewForm,
        importJson,
        exportJson,
        exportCode,
        generateSFC,
        getFieldWidgets,
        getContainerWidgets,
        upgradeFormJson,
        getWidgetRef,
        getSelectedWidgetRef,
        addDataSource,
        addEC,
        hasEC,
        getEC,

      }
    }
  }
</script>

<style lang="scss" scoped>
  .el-container.main-container {
    background: #fff;

    :deep(aside) {  /* 防止aside样式被外部样式覆盖！！ */
      margin: 0;
      padding: 0;
      background: inherit;
    }
  }

  .el-container.full-height {
    height: 100%;
    overflow-y: hidden;
  }

  .el-container.center-layout-container {
    min-width: 680px;
    border-left: 2px dotted #EBEEF5;
    border-right: 2px dotted #EBEEF5;
  }

  .el-header.main-header {
    border-bottom: 2px dotted #EBEEF5;
    height: 48px !important;
    line-height: 48px !important;
    min-width: 800px;
    //background: #f5f7fa;
  }

  div.main-title {
    font-size: 18px;
    color: #242424;
    display: flex;
    align-items: center;
    justify-items: center;

    img {
      cursor: pointer;
      width: 36px;
      height: 36px;
    }

    span.bold {
      font-size: 20px;
      font-weight: bold;
      margin: 0 6px 0 6px;
    }

    span.version-span {
      font-size: 14px;
      color: #101F1C;
      margin-left: 6px;
    }
  }

  .float-left {
    float: left;
  }

  .float-right {
    float: right;
  }

  .el-dropdown-link {
    margin-right: 12px;
    cursor: pointer;
  }

  div.external-link {
    display: flex;
    align-items: center;
    justify-content: center;

    a {
      font-size: 13px;
      text-decoration: none;
      margin-right: 10px;
      color: #606266;
    }
  }

  .el-header.toolbar-header {
    font-size: 14px;
    border-bottom: 1px dotted #CCCCCC;
    height: 42px !important;
    //line-height: 42px !important;
  }

  .el-aside.side-panel {
    width: 260px !important;
    overflow-y: hidden;
  }

  .el-main.form-widget-main {
    padding: 0;

    position: relative;
    overflow-x: hidden;
  }

  .container-scroll-bar {
    :deep(.el-scrollbar__wrap), :deep(.el-scrollbar__view) {
      overflow-x: hidden;
    }
  }
</style>
