import {addChartContainerSchema, addChartSchema} from "@/components/form-designer/widget-panel/widgetsConfig";

import {ext_chart_containers as EC_CONS, ext_charts_widgets as EC_WS} from "./charts-schema";
import SectionWidget from "@/extension/charts/section/section-widget";
import SectionItem from "@/extension/charts/section/section-item";

export const loadChartsExtension = function (app) {
  EC_CONS.forEach(con => {
    addChartContainerSchema(con)
  })
  app.component(SectionWidget.name, SectionWidget)  //注册设计期的容器组件
  app.component(SectionItem.name, SectionItem)  //注册运行期的容器组件

  EC_WS.forEach(wgt => {
    addChartSchema(wgt)
  })

}
