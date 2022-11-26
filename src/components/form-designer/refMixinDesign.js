
import { getCurrentInstance } from 'vue'
import { useI18n } from '@/utils/i18n'

export function useDesignRef(refList,widget) {
  
  const { i18nt }=useI18n();
  const { proxy } = getCurrentInstance()
  let $current=proxy;


  const methods= {
    initRefList() {
      if ((refList !== null) && !!widget.options.name) {
        refList[widget.options.name] = $current
      }
    },

    getWidgetRef(widgetName, showError) {
      let foundRef = refList[widgetName]
      if (!foundRef && !!showError) {
        $current.$message.error(i18nt('render.hint.refNotFound') + widgetName)
      }
      return foundRef
    },

    /* 该方法用于组件重名检查！！ */
    registerToRefList(oldRefName) {
      if ((refList !== null) && !!widget.options.name) {
        if (!!oldRefName) {
          delete refList[oldRefName]
        }
        refList[widget.options.name] = $current
      }
    },

  }
  return{
    ...methods
  }
}


export default {
  methods: {
    initRefList() {
      if ((this.refList !== null) && !!this.widget.options.name) {
        this.refList[this.widget.options.name] = this
      }
    },

    getWidgetRef(widgetName, showError) {
      let foundRef = this.refList[widgetName]
      if (!foundRef && !!showError) {
        this.$message.error(this.i18nt('render.hint.refNotFound') + widgetName)
      }
      return foundRef
    },

    /* 该方法用于组件重名检查！！ */
    registerToRefList(oldRefName) {
      if ((this.refList !== null) && !!this.widget.options.name) {
        if (!!oldRefName) {
          delete this.refList[oldRefName]
        }
        this.refList[this.widget.options.name] = this
      }
    },

  }
}
