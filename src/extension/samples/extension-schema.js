export const cardSchema = {
  type: 'card',
  category: 'container',
  icon: 'card',
  commonFlag: true,
  widgetList: [],
  options: {
    name: '',
    label: 'card',
    hidden: false,
    headerHidden: false,
    folded: false,//是否折叠状态
    showFold: true,//是否显示折叠切换按钮
    cardWidth: '100%',//卡片宽度，百分比或像素宽度
    shadow: 'never',//是否显示阴影
    customClass: '',//自定义css样式
  }
}

export const alertSchema = {
  type: 'alert',
  icon: 'alert',
  formItemFlag: false,
  options: {
    name: '',
    title: 'Good things are coming...',
    type: 'info',
    description: '',
    closable: true,
    closeText: '',
    center: true,
    showIcon: false,
    effect: 'light',
    hidden: false,
    onClose: '',
    customClass: '',
  }
}
