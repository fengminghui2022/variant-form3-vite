import axios from 'axios'

import VFormRender from '@/components/form-render/index.vue'
import ContainerItems from '@/components/form-render/container-item/index'
import TableHighLevelColumn from '@/components/form-render/table-high-level-column'

import {registerIcon} from '@/utils/el-icons'
import 'virtual:svg-icons-register'
import '@/iconfont/iconfont.css'

import { loadExtension } from '@/extension/extension-loader'

VFormRender.install = function (app) {
  loadExtension(app)

  app.use(ContainerItems)
  registerIcon(app)
  app.component(VFormRender.name, VFormRender)
  app.component(TableHighLevelColumn.name, TableHighLevelColumn)
}

const components = [
  VFormRender,
  TableHighLevelColumn
]

const install = (app) => {
  loadExtension(app)

  app.use(ContainerItems)
  registerIcon(app)
  components.forEach(component => {
    app.component(component.name, component)
  })

  window.axios = axios
}

if (typeof window !== 'undefined' && window.Vue) { /* script方式引入时赋值axios！！ */
  //window.axios = axios
}

export default {
  install,
  VFormRender
}
