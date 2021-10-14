<template>
  <div class="page-flowchart">
    <div class="block">
      <div class="block__toolbar">
        <Toolbar />
      </div>
      <div class="block__main">
        <Blocks />
      </div>
      <div class="block__extra"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Flowchart',
  components: {
    Toolbar: () => import('@/components/flowchart/toolbar/Toolbar'),
    Blocks: () => import('@/components/flowchart/blocks'),
  },
};
</script>

<style lang="scss" scoped>
.page-flowchart {
  width: 100%;
  height: 100%;
  background-color: azure;
}
.block {
  width: 100%;
  height: 100%;
  display: flex;
  user-select: none;
  &__toolbar {
    flex: 0 0 50px;
    border-right: 1px solid black;
  }
  &__main {
    flex: 1 1 auto;
  }
  &__extra {
    flex: 0 0 200px;
    border-left: 1px solid black;
  }
}
</style>
