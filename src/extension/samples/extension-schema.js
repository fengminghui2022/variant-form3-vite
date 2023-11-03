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
    folded: false,
    showFold: true,
    cardWidth: '100%',
    shadow: 'never',
    customClass: '',
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
