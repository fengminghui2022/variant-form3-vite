<template>
  <container-item-wrapper :widget="widget">
    <el-card :key="widget.id" class="card-container" :class="[!!widget.options.folded ? 'folded' : '', customClass]"
             :shadow="widget.options.shadow" :style="{width: widget.options.cardWidth + '!important' || ''}"
             :ref="widget.id" v-show="!widget.options.hidden">
      <template #header>
        <div class="clear-fix">
          <span>{{widget.options.label}}</span>
          <i v-if="widget.options.showFold" class="float-right" @click="toggleCard">
            <template v-if="!widget.options.folded">
              <el-icon><ArrowDown /></el-icon>
            </template>
            <template v-else>
              <el-icon><ArrowUp /></el-icon>
            </template>
          </i>
        </div>
      </template>
      <template v-if="!!widget.widgetList && (widget.widgetList.length > 0)">
        <template v-for="(subWidget, swIdx) in widget.widgetList">
          <template v-if="'container' === subWidget.category">
            <component :is="getComponentByContainer(subWidget)" :widget="subWidget" :key="swIdx" :parent-list="widget.widgetList"
                       :index-of-parent-list="swIdx" :parent-widget="widget"
                       :sub-form-row-id="subFormRowId" :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex">
              <!-- 递归传递插槽！！！ -->
              <template v-for="slot in Object.keys($slots)" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope"/>
              </template>
            </component>
          </template>
          <template v-else>
            <component :is="subWidget.type + '-widget'" :field="subWidget" :designer="null" :key="swIdx" :parent-list="widget.widgetList"
                       :index-of-parent-list="swIdx" :parent-widget="widget">
              <!-- 递归传递插槽！！！ -->
              <template v-for="slot in Object.keys($slots)" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope"/>
              </template>
            </component>
          </template>
        </template>
      </template>
    </el-card>
  </container-item-wrapper>
</template>

<script>

  import { inject, toRefs, computed, getCurrentInstance, onBeforeUnmount  } from 'vue'
  import { useEmitter } from '@/utils/emitter'
  import { useI18n } from '@/utils/i18n'
  import { useRef } from "@/components/form-render/refMixin"
	import { useContainer } from "@/components/form-render/container-item/containerItemMixin"

import ContainerItemWrapper from '@/components/form-render/container-item/container-item-wrapper'
  import FieldComponents from '@/components/form-designer/form-widget/field-widget/index'
  import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'

  export default {
    name: "card-item",
    componentName: 'ContainerItem',
    components: {
      ContainerItemWrapper,
      ...FieldComponents,
      ArrowDown,
      ArrowUp
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
      const { i18nt }= useI18n();
  		const { proxy } = getCurrentInstance()
      
      const refList=inject('refList')
      const sfRefList=inject('sfRefList')
      const globalModel=inject('globalModel')

      const refMixin = useRef(props);
      const containerMixin= useContainer(props,{},{});


      const customClass=computed(()=>{
        return props.widget.options.customClass || ''
      });
      

      beforeUnmount(()=> {
        containerMixin.unregisterFromRefList()
      })

      const toggleCard=()=> {
        props.widget.options.folded = !props.widget.options.folded
      }

      refMixin.initRefList()


      return {
        i18nt,
        ...toRefs(props),
        ...refMixin,

        customClass,

        toggleCard
      }

    }
  }
</script>

<style lang="scss" scoped>
  :deep(.el-card__header) {
    padding: 10px 12px;
  }

  .folded :deep(.el-card__body) {
    display: none;
  }

  .clear-fix:before, .clear-fix:after {
    display: table;
    content: "";
  }

  .clear-fix:after {
    clear: both;
  }

  .float-right {
    float: right;
  }

</style>
