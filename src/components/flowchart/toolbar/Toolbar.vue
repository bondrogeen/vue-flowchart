<template>
  <div class="toolbar">
    <div @click="add">+</div>
    <div>-</div>
    <div @click="clone">||</div>
  </div>
</template>

<script>
export default {
  name: "toolbar",
  methods: {
    add() {
      this.$store.dispatch("blocks/add", { type: "Input" });
    },
    clone() {
      this.$store.dispatch("blocks/cloneAll", {});
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