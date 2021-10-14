<template>
  <div
    :class="['block', { 'block--selected': selected }]"
    :style="style"
    @mouseover="hover = true"
    @mouseleave="hover = false"
  >
    <div :class="['block__header', type.toLowerCase()]">
      {{ name }} {{ selected }}
    </div>
    <div class="block__inputs">
      <div
        v-for="(slot, index) in inputs"
        :key="'input' + index"
        class="input inputSlot"
        :class="{
          active: slot.active,
          'input--linking-active': linkingCheck && !linking,
        }"
        @mouseup="slotMouseUp($event, index)"
        @mousedown="slotBreak($event, index)"
      ></div>
    </div>
    <div class="block__outputs">
      <div
        v-for="(slot, index) in outputs"
        class="output"
        :class="[{ active: hover && !linkingCheck }, typeLink[index]]"
        :key="'output' + index"
        @mousedown="slotMouseDown($event, index)"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Block",
  props: {
    id: {
      type: Number,
    },
    linkingCheck: {
      type: Object,
    },
    name: {
      type: String,
    },
    position: {
      type: Array,
      default: () => [],
    },
    selected: Boolean,
    type: String,
    inputs: Array,
    outputs: Array,
    options: {
      type: Object,
    },
  },
  data: () => ({
    hover: false,
    hasDragged: false,
    typeLink: ["bottom", "right", "left"],
    mouseX: 0,
    mouseY: 0,
    lastMouseX: 0,
    lastMouseY: 0,
    linking: false,
    dragging: false,
  }),
  computed: {
    style() {
      return {
        left: this.options.x + this.position[0] * this.options.scale + "px",
        top: this.options.y + this.position[1] * this.options.scale + "px",
        width: this.options.width + "px",
        transform: "scale(" + (this.options.scale + "") + ")",
        transformOrigin: "top left",
        zIndex: this.selected || this.hover ? 10 : 1,
      };
    },
  },
  mounted() {
    const doc = document.documentElement;
    doc.addEventListener("mousemove", this.handleMove, true);
    doc.addEventListener("mousedown", this.handleDown, true);
    doc.addEventListener("mouseup", this.handleUp, true);
  },
  beforeDestroy() {
    const doc = document.documentElement;
    doc.removeEventListener("mousemove", this.handleMove, true);
    doc.removeEventListener("mousedown", this.handleDown, true);
    doc.removeEventListener("mouseup", this.handleUp, true);
  },
  methods: {
    handleMove(e) {
      this.mouseX = e.pageX || e.clientX + document.documentElement.scrollLeft;
      this.mouseY = e.pageY || e.clientY + document.documentElement.scrollTop;
      if (this.dragging && !this.linking) {
        let diffX = this.mouseX - this.lastMouseX;
        let diffY = this.mouseY - this.lastMouseY;
        this.lastMouseX = this.mouseX;
        this.lastMouseY = this.mouseY;
        this.moveWithDiff(diffX, diffY);
        this.hasDragged = true;
      }
    },
    handleDown(e) {
      this.mouseX = e.pageX || e.clientX + document.documentElement.scrollLeft;
      this.mouseY = e.pageY || e.clientY + document.documentElement.scrollTop;
      this.lastMouseX = this.mouseX;
      this.lastMouseY = this.mouseY;
      const target = e.target || e.srcElement;
      if (this.$el.contains(target) && e.which === 1) {
        this.dragging = true;
        this.$emit("select");
        if (e.preventDefault) e.preventDefault();
      }
    },
    handleUp() {
      if (this.dragging) {
        this.dragging = false;
        if (this.hasDragged) {
          this.$emit("moveBlock");
          this.hasDragged = false;
        }
      }
      if (this.linking) {
        this.linking = false;
      }
    },
    slotMouseDown(e, index) {
      this.linking = true;
      this.$emit("linkingStart", index);
      if (e.preventDefault) e.preventDefault();
    },
    slotMouseUp(e, index) {
      this.$emit("linkingStop", index);
      if (e.preventDefault) e.preventDefault();
    },
    slotBreak(e, index) {
      this.linking = true;
      this.$emit("linkingBreak", index);
      if (e.preventDefault) e.preventDefault();
    },
    moveWithDiff(diffX, diffY) {
      let left = this.position[0] + diffX / this.options.scale;
      let top = this.position[1] + diffY / this.options.scale;
      this.$emit("position", [left, top]);
    },
  },
};
</script>

<style lang="scss" scoped>
$ioFontSize: 14px;
$circleSize: 10px;
$circleNewColor: #00ff003b;
$circleConnectedColor: #569dcf;

.block {
  position: absolute;
  box-sizing: border-box;
  border-radius: 5px;
  background: #bfbfbf;
  z-index: 1;
  opacity: 0.9;
  cursor: move;
  &--selected {
    background: #ac2b2b !important;
  }
  &__header {
    min-height: 42px;
    padding: 0 10px;
    border-radius: 5px;
    color: #000;
  }
  &__inputs,
  &__outputs {
    width: 100%;
    display: flex;
    justify-content: center;
    .input,
    .output {
      position: absolute;
      overflow: hidden;
      font-size: $ioFontSize;
      box-sizing: border-box;
      width: $circleSize;
      height: $circleSize;
      border-radius: 100%;
      cursor: crosshair;
      z-index: 999;
      &.active {
        background: $circleConnectedColor;
      }
    }
    .input {
      top: -5px;
      &--linking-active {
        top: 0px;
        width: 100%;
        height: 100%;
        z-index: 20;
        opacity: 0;
      }
    }

    .output {
      &.bottom {
        bottom: -5px;
      }
      &.left {
        left: -6px;
        top: 18px;
      }
      &.right {
        right: -6px;
        top: 18px;
      }
      &:hover {
        background: $circleNewColor;
      }
      &.active {
        background: $circleNewColor;
      }
    }
  }
}
</style>
