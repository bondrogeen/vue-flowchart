<template>
  <div class="toolbar">
    <div @click="add">+</div>
    <div>-</div>
    <div @click="cloneAll">||</div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
export default {
  name: 'toolbar',
  methods: {
    ...mapActions('blocks', ['add', 'cloneAll']),
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