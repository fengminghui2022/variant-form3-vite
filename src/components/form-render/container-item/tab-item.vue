<template>
  <container-item-wrapper :widget="widget">

    <div :key="widget.id" class="tab-container"
         v-show="!widget.options.hidden">
      <el-tabs v-model="activeTabName" :type="widget.displayType" :ref="widget.id" :class="[customClass]"
               @tab-click="handleTabClick">
        <el-tab-pane v-for="(tab, index) in visibleTabs" :key="index" :label="tab.options.label"
                     :disabled="tab.options.disabled" :name="tab.options.name">
          <template v-for="(subWidget, swIdx) in tab.widgetList">
            <template v-if="'container' === subWidget.category">
              <component :is="getComponentByContainer(subWidget)" :widget="subWidget" :key="swIdx" :parent-list="tab.widgetList"
                         :index-of-parent-list="swIdx" :parent-widget="widget"
                         :sub-form-row-id="subFormRowId" :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex">
                <!-- 递归传递插槽！！！ -->
                <template v-for="slot in Object.keys($slots)" v-slot:[slot]="scope">
                  <slot :name="slot" v-bind="scope"/>
                </template>
              </component>
            </template>
            <template v-else>
              <component :is="subWidget.type + '-widget'" :field="subWidget" :key="swIdx" :parent-list="tab.widgetList"
                         :index-of-parent-list="swIdx" :parent-widget="widget"
                         :sub-form-row-id="subFormRowId" :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex">
                <!-- 递归传递插槽！！！ -->
                <template v-for="slot in Object.keys($slots)" v-slot:[slot]="scope">
                  <slot :name="slot" v-bind="scope"/>
                </template>
              </component>
            </template>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

  </container-item-wrapper>
</template>

<script>

  import { provide, inject, reactive, toRefs, computed, getCurrentInstance, onMounted, onBeforeUnmount  } from 'vue'

  import { useEmitter } from '@/utils/emitter'
  import { useI18n } from '@/utils/i18n'
  import { useRef } from "@/components/form-render/refMixin"
	import { useContainer } from "@/components/form-render/container-item/containerItemMixin"

  
  import ContainerItemWrapper from './container-item-wrapper'
  import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'

  export default {
    name: "tab-item",
    componentName: 'ContainerItem',
    components: {
      ContainerItemWrapper,
      ...FieldComponents,
    },
    props: {
      widget: Object,

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
    setup(props){
      const refList=inject('refList')
      const sfRefList=inject('sfRefList')
      const globalModel=inject('globalModel')

      const { i18nt }= useI18n();
  		const { proxy } = getCurrentInstance()

      const data=reactive({
          activeTabName: ''
      })
      
      const refMixin = useRef(props);
      const emitterMixin =useEmitter();
      const containerMixin= useContainer(props,data,{});

      const visibleTabs=computed(()=> {
        return props.widget.tabs.filter(tp => {
          return !tp.options.hidden
        })
      })

      onMounted(()=> {
        initActiveTab()
      })

      onBeforeUnmount(()=> {
        containerMixin.unregisterFromRefList()
      })

      const initActiveTab=()=> {
        if ((props.widget.type === 'tab') && (props.widget.tabs.length > 0)) {
          let activePanes = props.widget.tabs.filter((tp) => {
            return tp.options.active === true
          })
          if (activePanes.length > 0) {
            data.activeTabName = activePanes[0].options.name
          } else {
            data.activeTabName = props.widget.tabs[0].options.name
          }
        }
      }

      const handleTabClick=(tab)=> {
        if (!!props.widget.options.onTabClick) {
          let customFn = new Function('tab', props.widget.options.onTabClick)
          customFn.call(proxy, tab)
        }
      }



      refMixin.initRefList()
      return {
        i18nt,
        ...toRefs(data),

        visibleTabs,
        initActiveTab,
        handleTabClick
      }
    }

  }
</script>

<style lang="scss" scoped>


</style>
