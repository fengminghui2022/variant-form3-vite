export default {
  methods: {
    hasConfig(configName) {
      if (!this.designer || !this.designer.selectedWidget) {
        return false
      }

      return this.designer.hasConfig(this.selectedWidget, configName)
    },

    emitDefaultValueChange() {
      if (!!this.designer) {
        if (!!this.designer.formWidget) {
          let fieldWidget = this.designer.formWidget.getWidgetRef(this.designer.selectedWidget.options.name)
          if (!!fieldWidget && !!fieldWidget.refreshDefaultValue) {
            fieldWidget.refreshDefaultValue()
          }
        }
      }
    },

    inputNumberHandler(value) {
      value = value.replace(/[^0-9]/gi, '')
    },

    onRemoteChange(val) {
      if (!!val) {
        this.optionModel.filterable = true
        //this.optionModel.allowCreate = false
      }
    },

    onAllowCreateChange(val) {
      if (!!val) {
        this.optionModel.filterable = true
      }
    },

    onMultipleSelected(val) {
      if (val) {
        this.optionModel.defaultValue = []  //清空原默认值!!
      } else {
        if (!!this.optionModel.defaultValue && (this.optionModel.defaultValue.length > 0)) {
          this.optionModel.defaultValue = this.optionModel.defaultValue[0]
        } else {
          this.optionModel.defaultValue = ''
        }
      }
    },


  }
}

export function useProperty(props){
  

  const hasConfig=(configName)=> {
    if (!props.designer || !props.designer.selectedWidget) {
      return false
    }

    return props.designer.hasConfig(props.selectedWidget, configName)
  }

  const emitDefaultValueChange=()=> {
    if (!!props.designer) {
      if (!!props.designer.formWidget) {
        let fieldWidget = props.designer.formWidget.getWidgetRef(props.designer.selectedWidget.options.name)
        if (!!fieldWidget && !!fieldWidget.refreshDefaultValue) {
          fieldWidget.refreshDefaultValue()
        }
      }
    }
  }

  const inputNumberHandler=(value)=> {
    value = value.replace(/[^0-9]/gi, '')
  }

  const onRemoteChange=(val)=> {
    if (!!val) {
      props.optionModel.filterable = true
      //this.optionModel.allowCreate = false
    }
  }

  const onAllowCreateChange=(val)=> {
    if (!!val) {
      props.optionModel.filterable = true
    }
  }

  const onMultipleSelected=(val)=> {
    if (val) {
      props.optionModel.defaultValue = []  //清空原默认值!!
    } else {
      if (!!props.optionModel.defaultValue && (props.optionModel.defaultValue.length > 0)) {
        props.optionModel.defaultValue = props.optionModel.defaultValue[0]
      } else {
        props.optionModel.defaultValue = ''
      }
    }
  }
  

  return {
    hasConfig,
    emitDefaultValueChange,
    inputNumberHandler,
    onRemoteChange,
    onAllowCreateChange,
    onMultipleSelected
  }

}