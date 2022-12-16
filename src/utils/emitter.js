
function _broadcast(componentName, eventName, params) {
  this.$children.forEach(function (child) {
    let name = child.$options.componentName;
    if (name === componentName) {
      //child.$emit.apply(child, [eventName].concat(params));
      if (!!child.emit$) {
        child.emit$.call(child, eventName, params)
      }
    } else {
      _broadcast.apply(child, [componentName, eventName].concat([params]));
    }
  });
}


import { toRefs,reactive } from 'vue'
export function useEmitter(proxy){
  const data=reactive({
      vfEvents: {}
  })

  const methods= {
    emit$(eventName,  eventData) {
      if (data.vfEvents[eventName]) {
        data.vfEvents[eventName].forEach((fn) => {
          fn(eventData);
        });
      }
    },

    on$(eventName, fn) {
      data.vfEvents[eventName] = data.vfEvents[eventName] || [];
      data.vfEvents[eventName].push(fn);
    },

    off$(eventName, fn) {
      if (data.vfEvents[eventName]) {
        if ((fn === undefined) || (fn === null)) {
          data.vfEvents[eventName].length = 0
          return
        }

        for (let i = 0; i < data.vfEvents[eventName].length; i++) {
          if (data.vfEvents[eventName][i] === fn) {
            data.vfEvents[eventName].splice(i, 1)
            break
          }
        }
      }
    },

    dispatch: function dispatch(componentName, eventName, params) {
      let parent = proxy.$parent || proxy.$root;
      let name = parent.$options.componentName;

      while (parent && (!name || name !== componentName)) {
        parent = parent.$parent;

        if (parent) {
          name = parent.$options.componentName;
        }
      }
      if (parent) {
        if (!!parent.emit$) {
          parent.emit$.call(parent, eventName, params)

          if (componentName === 'VFormRender') {
            parent.$emit(eventName, ...params)  //执行原生$emit，以便可以用@进行声明式事件处理！！
          }
        }
      }
    },

    broadcast: function broadcast(componentName, eventName, params) {
      /* Vue3移除了$children属性，_broadcast方法已不能使用！！ */
      //_broadcast.call(this, componentName, eventName, params);

      if (!!this.widgetRefList) {  //FormRender只需遍历自身的widgetRefList属性
        Object.keys(this.widgetRefList).forEach(refName => {
          let cmpName = this.widgetRefList[refName].$options.componentName
          if (cmpName === componentName) {
            let foundRef = this.widgetRefList[refName]
            foundRef.emit$.call(foundRef, eventName, params)
          }
        })
      }

      if (!!this.refList) {  //其他组件遍历inject的refList属性
        Object.keys(this.refList).forEach(refName => {
          let cmpName = this.refList[refName].$options.componentName
          if (cmpName === componentName) {
            let foundRef = this.refList[refName]
            foundRef.emit$.call(foundRef, eventName, params)
          }
        })
      }
    }
  }

  
  return {
    ...toRefs(data),
    ...methods
  }
};
