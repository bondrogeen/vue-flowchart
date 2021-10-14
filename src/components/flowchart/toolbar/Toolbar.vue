<template>
  <div class="toolbar">
    <div @click="add">+</div>
    <div>-</div>
    <div>\</div>
  </div>
</template>

<script>
export default {
  name: "toolbar",
  methods: {
    add() {
      this.$store.dispatch("blocks/add", { type: "Input" });
    },
  },
};
</script>

<style lang="scss" scoped>
.toolbar {
  div {
    height: 30px;
    width: 100%;
    text-align: center;
    padding: 10px 0;
    cursor: pointer;
  }
}
</style>