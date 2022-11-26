<!--
/**
 * author: vformAdmin
 * email: vdpadmin@163.com
 * website: https://www.vform666.com
 * date: 2021.08.18
 * remark: 如果要分发VForm源码，需在本文件顶部保留此文件头信息！！
 */
-->

<template>
  <div class="container-wrapper" :class="[customClass]">
    <slot></slot>
  </div>
</template>

<script>
	import { computed } from 'vue'
  export default {
    name: "container-item-wrapper",
    props: {
      widget: Object,
    },
    setup(props){
      const customClass=computed(()=>{
          return !!props.widget.options.customClass ? props.widget.options.customClass.join(' ') : ''
      })
    }
  }
</script>

<style lang="scss" scoped>

</style>
