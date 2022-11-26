export default {
  methods: {
    initRefList() {
      if ((this.subFormRowIndex === -1) || (this.subFormRowIndex === undefined)) {  //容器组件未被嵌套于多行子表单之内
        if ((this.refList !== null) && !!this.widget.options.name) {
          this.refList[this.widget.options.name] = this
        }
      } else {  //容器组件被嵌套于多行子表单之内
        if ((this.refList !== null) && !!this.widget.options.name) {
          this.refList[this.widget.options.name + '@row' + this.subFormRowId] = this
        }
      }
    },

    getWidgetRef(widgetName, showError) {
      let foundRef = this.refList[widgetName]
      if (!foundRef && !!showError) {
        this.$message.error(this.i18nt('render.hint.refNotFound') + widgetName)
      }
      return foundRef
    },

    getFormRef() { /* 获取VFrom引用，必须在VForm组件created之后方可调用 */
      return this.refList['v_form_ref']
    },

    getComponentByContainer(con) {
      if (con.type === 'grid') {  //grid-item跟VueGridLayout全局注册组件重名，故特殊处理！！
        return 'vf-grid-item'
      }

      return con.type + '-item'
    },

  }
}

import { inject,getCurrentInstance } from 'vue'
import { useI18n } from '@/utils/i18n'

export function useRef(props) {
  const i18nt=useI18n();
  const refList= inject('refList')
  const { proxy } = getCurrentInstance()

  const methods= {
    initRefList() {
      if ((props.subFormRowIndex === -1) || (props.subFormRowIndex === undefined)) {  //容器组件未被嵌套于多行子表单之内
        if ((refList !== null) && !!props.widget.options.name) {
          refList[props.widget.options.name] = proxy
        }
      } else {  //容器组件被嵌套于多行子表单之内
        if ((refList !== null) && !!props.widget.options.name) {
          refList[props.widget.options.name + '@row' + props.subFormRowId] = proxy
        }
      }
    },

    getWidgetRef(widgetName, showError) {
      let foundRef = v.refList[widgetName]
      if (!foundRef && !!showError) {
        proxy.$message.error(i18nt('render.hint.refNotFound') + widgetName)
      }
      return foundRef
    },

    getFormRef() { /* 获取VFrom引用，必须在VForm组件created之后方可调用 */
      return props.refList['v_form_ref']
    },

    getComponentByContainer(con) {
      if (con.type === 'grid') {  //grid-item跟VueGridLayout全局注册组件重名，故特殊处理！！
        return 'vf-grid-item'
      }

      return con.type + '-item'
    },

  }
  return {
    ...methods
  }
}
