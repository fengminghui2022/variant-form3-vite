
import { getCurrentInstance } from 'vue'
import { useI18n } from '@/utils/i18n'

export function useDesignRef(refList,widget) {
  
  const { i18nt }=useI18n()
  const { proxy } = getCurrentInstance()
  let $current=proxy
  let _refList=refList
  let _widget=widget


  const methods= {
    initRefList() {
      if ((_refList !== null) && !!_widget.options.name) {
        _refList[_widget.options.name] = $current
      }
    },

    getWidgetRef(widgetName, showError) {
      let foundRef = _refList[widgetName]
      if (!foundRef && !!showError) {
        $current.$message.error(i18nt('render.hint.refNotFound') + widgetName)
      }
      return foundRef
    },

    /* 该方法用于组件重名检查！！ */
    registerToRefList(oldRefName) {
      if ((_refList !== null) && !!_widget.options.name) {
        if (!!oldRefName) {
          delete _refList[oldRefName]
        }
        _refList[_widget.options.name] = $current
      }
    },

  }
  return{
    ...methods
  }
}

