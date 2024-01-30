<template>
  <form-item-wrapper :designer="designer" :field="field" :rules="rules" :design-state="designState"
                     :parent-widget="parentWidget" :parent-list="parentList" :index-of-parent-list="indexOfParentList"
                     :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex" :sub-form-row-id="subFormRowId">
    <el-checkbox-group ref="fieldEditor" v-model="fieldModel" v-show="!isReadMode"
                       :disabled="field.options.disabled"
                       @change="handleChangeEvent">
      <template v-if="!!field.options.buttonStyle">
        <el-checkbox-button v-for="(item, index) in optionItems" :key="index" :label="item.value"
                            :disabled="item.disabled" :border="field.options.border"
                            :style="{display: field.options.displayStyle}">{{item.label}}</el-checkbox-button>
      </template>
      <template v-else>
        <el-checkbox v-for="(item, index) in optionItems" :key="index" :label="item.value"
                     :disabled="item.disabled" :border="field.options.border"
                     :style="{display: field.options.displayStyle}">{{item.label}}</el-checkbox>
      </template>
    </el-checkbox-group>
    <template v-if="isReadMode">
      <span class="readonly-mode-field">{{optionLabel}}</span>
    </template>
  </form-item-wrapper>
</template>

<script>
  import FormItemWrapper from './form-item-wrapper'
  import emitter from '@/utils/emitter'
  import i18n, {translate} from "@/utils/i18n";
  import fieldMixin from "@/components/form-designer/form-widget/field-widget/fieldMixin";
  import {CustomRequest} from "@/api/server"

  export default {
    name: "checkbox-widget",
    componentName: 'FieldWidget',  //必须固定为FieldWidget，用于接收父级组件的broadcast事件
    mixins: [emitter, fieldMixin, i18n],
    props: {
      field: Object,
      parentWidget: Object,
      parentList: Array,
      indexOfParentList: Number,
      designer: Object,

      designState: {
        type: Boolean,
        default: false
      },

      subFormRowIndex: { /* 子表单组件行索引，从0开始计数 */
        type: Number,
        default: -1
      },
      subFormColIndex: { /* 子表单组件列索引，从0开始计数 */
        type: Number,
        default: -1
      },
      subFormRowId: { /* 子表单组件行Id，唯一id且不可变 */
        type: String,
        default: ''
      },
    },
    components: {
      FormItemWrapper,
    },
    inject:['optionDataSource'],
    data() {
      return {
        oldFieldValue: null, //field组件change之前的值
        fieldModel: null,
        rules: [],
        optionItems:[],
      }
    },
    computed: {

    },
    watch:{
      optionDataSource:{
        handler(newValue){
          this.renderDataSourceOption()
        },
        deep:true,
        immediate:true
      }
    },
    beforeCreate() {
      /* 这里不能访问方法和属性！！ */
    },

    created() {
      /* 注意：子组件mounted在父组件created之后、父组件mounted之前触发，故子组件mounted需要用到的prop
         需要在父组件created中初始化！！ */
      this.registerToRefList()
      this.initOptionItems()
      this.initFieldModel()
      this.initEventHandler()
      this.buildFieldRules()

      this.handleOnCreated()
    },

    mounted() {
      this.handleOnMounted()
    },

    beforeUnmount() {
      this.unregisterFromRefList()
    },

    methods: {
      /**
       * 根据元数据产生下拉项
       * @param {object} [expandParams=null] 需要新增的元数据入参对象
       */
       renderDataSourceOption(expandParams=null){
        //数据源模式
        if(this.field.options.optionSourceFlag){
            this.optionItems=[]//未请求到最新的下拉项之前，先将旧下拉项清除
            const optionsParams=this.optionDataSource.find(v=>v.widgetId==this.field.options.optionParamsSource.widgetId)
            if(!optionsParams) return
            //将传递的入参进行后端元数据接口与前端新增参数进行组合
            const paramData=optionsParams?.widgetData?{...JSON.parse(optionsParams?.widgetData),...expandParams}:null
            CustomRequest(optionsParams.widgetUrl,optionsParams.widgetMethod,optionsParams.widgetHeader,paramData).then(res=>{
              //dataStructure结构由前后端约定组成，此处注意所有元数据请求的下拉项对象中，一定存在的只有value及label两项，其他都是动态变化的，页面中涉及下拉项的函数根据此两项进行判断
              let dataStructure=JSON.parse(optionsParams.widgetResult)
              this.optionItems=res[dataStructure.key]?.length?res[dataStructure.key].map(v=>{return {...v,value:v[dataStructure.id],label:v[dataStructure.label]}}):[]
            })
          }else{
            this.optionItems=this.field.options.optionItems
          }
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../../../styles/global.scss"; /* form-item-wrapper已引入，还需要重复引入吗？ */

</style>
