import { createApp } from 'vue'
import axios from 'axios'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/styles/index.scss'
import '@/iconfont/iconfont.css'
import Draggable from '@/../lib/vuedraggable/dist/vuedraggable.umd.js'
import {registerIcon} from '@/utils/el-icons'
import SvgIcon from '@/components/svg-icon'  //svg组件
import 'virtual:svg-icons-register'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import ContainerWidgets from '@/components/form-designer/form-widget/container-widget/index'
import ContainerItems from '@/components/form-render/container-item/index'

import { addDirective } from '@/utils/directive'
import { installI18n } from '@/utils/i18n'
import { loadExtension } from '@/extension/extension-loader'

if (typeof window !== 'undefined') {
  window.axios = axios
}

const vfApp = createApp(App)

for (const [key, iconComponent] of Object.entries(ElementPlusIconsVue)) {
  vfApp.component(key, iconComponent)
}
vfApp.use(ElementPlus)
registerIcon(vfApp)
vfApp.component('draggable', Draggable)
vfApp.component('svg-icon', SvgIcon)
addDirective(vfApp)
installI18n(vfApp)

vfApp.use(ContainerWidgets)
vfApp.use(ContainerItems)
loadExtension(vfApp)

vfApp.mount('#app')
