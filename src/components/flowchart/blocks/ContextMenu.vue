<template>
  <div :class="['context-menu', { 'context-menu--show': isTrue }]" :style="style">
    <ul class="menu">
      <li class="menu__item" @click="click('clone')">First list item</li>
      <li class="menu__item" @click="click('add')">Second list item</li>
      <li class="menu__item" @click="click('test')">First list item</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'context-menu',
  props: {
    x: Number,
    y: Number,
  },
  computed: {
    isTrue() {
      return this.x && this.y;
    },
    style() {
      return {
        top: `${this.y}px`,
        left: `${this.x -50}px`,
      };
    },
  },
  methods: {
    click(e) {
      this.$emit('event', e)
    }
  }
};
</script>

<style lang="scss" scoped>
.context-menu {
  position: absolute;
  top: 50%;
  left: 50%;
  display: none;
  z-index: 10;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 0 11px rgba(33, 33, 33, 0.2);
  overflow: hidden;
  &--show {
    display: block;
  }
}
.menu{
  margin: 0;
  padding: 0;
  list-style-type: none;
  &__item {
      padding: 5px;
    &:hover {
      background-color: #bbbdff;
    }
  }
}
</style>