<template>
  <vue-draggable-resizable
          :w="200"
          :h="200"
          :parent="false"
          :debug="false"
          :min-width="200"
          :min-height="200"
          :isConflictCheck="true"
          :snap="true"
          :snapTolerance="1"
          class="test1">
  </vue-draggable-resizable>
</template>

<script>
  import VueDraggableResizable from "vue-draggable-resizable-gorkys/src/components/vue-draggable-resizable.vue"

  export default {
    name: "section-widget",
    components: {
      VueDraggableResizable
    },
  }
</script>

<style scoped>

</style>
