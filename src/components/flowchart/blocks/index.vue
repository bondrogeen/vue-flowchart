<template>
  <div class="blocks" @contextmenu="contextmenu">
    <Net class="blocks__center" :x="centerX" :y="centerY" :scale="scale" />
    <Link class="blocks__lines" :lines="lines" />
    <Block
      v-for="block in blocks"
      :key="block.id"
      :ref="'block_' + block.id"
      v-bind="block"
      :options="optionsForChild"
      :linkingCheck="tempLink"
      @linkingStart="linkingStart(block, $event)"
      @linkingStop="linkingStop(block, $event)"
      @linkingBreak="linkingBreak(block, $event)"
      @select="blockSelect(block)"
      @position="position($event)"
    />
    <Menu v-bind="menu" @event="event" />
  </div>
</template>

<script>
import { mouseHelper } from './utils';

export default {
  name: 'Blocks',
  components: {
    Block: () => import('./Block'),
    Link: () => import('./Link'),
    Net: () => import('./Net'),
    Menu: () => import('./ContextMenu'),
  },
  props: {},
  data: () => ({
    save: [],
    menu: false,
    dragging: false,
    centerX: 0,
    centerY: 0,
    scale: 1,
    tempLink: null,
    hasDragged: false,
    mouseX: 0,
    mouseY: 0,
    lastMouseX: 0,
    lastMouseY: 0,
    minScale: 0.2,
    maxScale: 5,
    linking: false,
    linkStart: null,
    inputSlotClassName: 'inputSlot',
  }),
  computed: {
    keyEvent: {
      set(value) {
        this.$store.dispatch('blocks/setKeyEvent', value);
      },
      get() {
        return this.$store.getters['blocks/getKeyEvent'];
      },
    },
    blocks: {
      set(value) {
        this.$store.dispatch('blocks/setBlocks', value);
      },
      get() {
        return this.$store.getters['blocks/getBlocks'];
      },
    },
    links: {
      set(value) {
        console.log(value);
        this.$store.dispatch('blocks/setLinks', value);
      },
      get() {
        return this.$store.getters['blocks/getLinks'];
      },
    },
    optionsForChild() {
      return {
        width: 180,
        titleHeight: 42,
        inputSlotClassName: this.inputSlotClassName,
        scale: this.scale,
        x: this.centerX,
        y: this.centerY,
      };
    },
    container() {
      return {
        centerX: this.centerX,
        centerY: this.centerY,
        scale: this.scale,
      };
    },
    // Links calculate
    lines() {
      let lines = [];
      for (let link of this.links) {
        let originBlock = this.blocks.find(block => {
          return block.id === link.originID;
        });
        let targetBlock = this.blocks.find(block => {
          return block.id === link.targetID;
        });
        if (!originBlock || !targetBlock) {
          console.log('Remove invalid link', link);
          this.$store.dispatch('blocks/removeLink', link.id);
          continue;
        }
        if (originBlock.id === targetBlock.id) {
          console.log('Loop detected, remove link', link);
          this.$store.dispatch('blocks/removeLink', link.id);
          continue;
        }
        let originLinkPos = this.getConnectionPos(originBlock, link.originSlot, false);
        let targetLinkPos = this.getConnectionPos(targetBlock, link.targetSlot, true);
        if (!originLinkPos || !targetLinkPos) {
          console.log('Remove invalid link (slot not exist)', link);
          this.$store.dispatch('blocks/removeLink', link.id);
          continue;
        }
        let { x: x1, y: y1 } = originLinkPos;
        let { x: x2, y: y2 } = targetLinkPos;
        lines.push({
          x1,
          y1,
          x2,
          y2,
          slot: link.originSlot,
          scale: this.scale,
          style: {
            stroke: 'rgb(101, 185, 244)',
            strokeWidth: 2 * this.scale,
            fill: 'none',
            zIndex: 999,
          },
          outlineStyle: {
            stroke: '#666',
            strokeWidth: 2 * this.scale,
            strokeOpacity: 0.6,
            fill: 'none',
            zIndex: 999,
          },
        });
      }
      if (this.tempLink) {
        lines.push(this.tempLink);
      }
      return lines;
    },
  },
  methods: {
    event(e) {
      console.log(e);
      if (e === 'clone') {
        this.$store.dispatch('blocks/cloneAll');
      }
      this.menu = {}
    },
    contextmenu(e) {
      e.preventDefault();
      console.log(e.clientX, e.clientY);
      this.menu = { x: e.clientX, y: e.clientY };
    },
    handleMauseOver(e) {
      this.mouseIsOver = e.type === 'mouseenter';
    },
    keyup(event) {
      this.keyEvent = event;
      const { code, ctrlKey } = event;
      const mouseIsOver = this.mouseIsOver;
      console.log(event);
      if (mouseIsOver && code === 'Delete') {
        this.$store.dispatch('blocks/removeSelected');
      }
      if (mouseIsOver && code === 'KeyA' && ctrlKey) {
        this.blocks.forEach(block => {
          block.selected = true
        })
      }
      if (mouseIsOver && code === 'KeyC' && ctrlKey) {
        this.save = this.blocks.filter(block => block.selected)
        // this.blockDelete(this.selectedBlock);
      }
      if (mouseIsOver && code === 'KeyV' && ctrlKey) {
        this.save.forEach(block => {
          this.$store.dispatch('blocks/clone', block);
        })
        // this.$store.dispatch('blocks/clone', );
        // this.blockDelete(this.selectedBlock);
      }
    },
    zoom(value) {
      if (value === 0) {
        this.scale = 1;
        this.centerX = this.$el.clientWidth / 2;
        this.centerY = this.$el.clientHeight / 2;
        return;
      }
      let deltaScale = value === 1 ? 1.1 : 0.9090909090909091;
      this.scale *= deltaScale;
      if (this.scale < this.minScale) {
        this.scale = this.minScale;
        return;
      } else if (this.scale > this.maxScale) {
        this.scale = this.maxScale;
        return;
      }
      let deltaOffsetX = (this.$el.clientWidth / 2 - this.centerX) * (deltaScale - 1);
      let deltaOffsetY = (this.$el.clientHeight / 2 - this.centerY) * (deltaScale - 1);
      this.centerX -= deltaOffsetX;
      this.centerY -= deltaOffsetY;

      // this.updateScene();
    },
    handleMove(e) {
      let mouse = mouseHelper(this.$el, e);
      this.mouseX = mouse.x;
      this.mouseY = mouse.y;
      if (this.dragging) {
        console.log('handleMove');
        let diffX = this.mouseX - this.lastMouseX;
        let diffY = this.mouseY - this.lastMouseY;
        this.lastMouseX = this.mouseX;
        this.lastMouseY = this.mouseY;
        this.centerX += diffX;
        this.centerY += diffY;
        this.hasDragged = true;
      }
      if (this.linking && this.linkStart) {
        let linkStartPos = this.getConnectionPos(this.linkStart.block, this.linkStart.slot, false);
        this.tempLink = {
          x1: linkStartPos.x,
          y1: linkStartPos.y,
          x2: this.mouseX,
          y2: this.mouseY,
          slot: this.linkStart.slot,
          style: {
            stroke: '#8f8f8f',
            strokeWidth: 2 * this.scale,
            fill: 'none',
          },
        };
      }
    },
    handleDown(e) {
      console.log('handleDown');
      console.log(e);
      // if (e.target.className !== 'menu__item') {
      //   this.menu = {};
      //   return;
      // }
      const target = e.target || e.srcElement;
      if ((target === this.$el || target.matches('svg, svg *')) && e.which === 1) {
        this.dragging = true;
        let mouse = mouseHelper(this.$el, e);
        this.mouseX = mouse.x;
        this.mouseY = mouse.y;
        this.lastMouseX = this.mouseX;
        this.lastMouseY = this.mouseY;
        if (!this.keyEvent?.ctrlKey) {
          this.blockDeselect();
        }
        if (e.preventDefault) e.preventDefault();
      }
    },
    handleUp(e) {
      console.log('handleUp');
      const target = e.target || e.srcElement;
      if (this.dragging) {
        this.dragging = false;
        if (this.hasDragged) {
          this.hasDragged = false;
        }
      }
      if (
        this.$el.contains(target) &&
        (typeof target.className !== 'string' || !target.className.includes(this.inputSlotClassName))
      ) {
        this.linking = false;
        this.tempLink = null;
        this.linkStart = null;
      }
    },
    handleWheel(e) {
      const target = e.target || e.srcElement;
      if (this.$el.contains(target)) {
        let deltaScale = Math.pow(1.1, e.deltaY * -0.01);
        this.scale *= deltaScale;
        if (this.scale < this.minScale) {
          this.scale = this.minScale;
          return;
        } else if (this.scale > this.maxScale) {
          this.scale = this.maxScale;
          return;
        }
        let deltaOffsetX = (this.mouseX - this.centerX) * (deltaScale - 1);
        let deltaOffsetY = (this.mouseY - this.centerY) * (deltaScale - 1);
        this.centerX -= deltaOffsetX;
        this.centerY -= deltaOffsetY;
      }
    },
    getConnectionPos(block, slot, isInput) {
      if (!block || slot === -1) {
        return undefined;
      }
      let x = 0;
      let y = 0;
      x += block.position[0];
      y += block.position[1];
      if (isInput && block.inputs.length > slot) {
        if (block.inputs.length === 1) {
          x += this.optionsForChild.width / 2;
          y += -3;
        } else {
          x += this.optionsForChild.width / 2 - (block.inputs.length * 10) / 2;
          x += 20 * slot;
        }
      } else if (!isInput && block.outputs.length > slot) {
        if (slot === 0) {
          x += this.optionsForChild.width / 2;
          // console.log()
          // y += this.$refs?.['block_' + block.id]?.[0]?.getHeight();
          y += 45;
        }
        if (slot === 1) {
          x += this.optionsForChild.width;
          y += 25;
        }
        if (slot === 2) {
          y += 25;
        }
      } else {
        console.error('slot ' + slot + ' not found, is input: ' + isInput, block);
        return undefined;
      }

      x *= this.scale;
      y *= this.scale;

      x += this.centerX;
      y += this.centerY;

      return { x, y };
    },
    linkingStart(block, slot) {
      console.log('linkingStart');
      this.linkStart = { block, slot };
      let linkStartPos = this.getConnectionPos(block, slot, false);
      this.tempLink = {
        x1: linkStartPos.x,
        y1: linkStartPos.y,
        x2: this.mouseX,
        y2: this.mouseY,
        style: {
          stroke: '#8f8f8f',
          strokeWidth: 2 * this.scale,
          fill: 'none',
        },
      };
      this.linking = true;
    },
    linkingStop(target, slot) {
      if (this.linkStart && target && slot > -1) {
        const {
          slot: originSlot,
          block: { id: originID },
        } = this.linkStart;
        const targetID = target.id;
        const targetSlot = slot;
        this.links = this.links.filter(line => {
          return (
            !(
              line.targetID === targetID &&
              line.targetSlot === targetSlot &&
              line.originID === originID &&
              line.originSlot === originSlot
            ) &&
            !(
              (line.targetID === originID && line.originID === targetID) ||
              (line.originID === originID && line.targetID === targetID)
            )
          );
        });

        let maxID = Math.max(0, ...this.links.map(o => o.id));
        if (this.linkStart.block.id !== target.id) {
          const originID = this.linkStart.block.id;
          const originSlot = this.linkStart.slot;
          const targetID = target.id;
          const targetSlot = slot;

          this.links.push({
            id: maxID + 1,
            originID,
            originSlot,
            targetID,
            targetSlot,
          });
          this.updateModel();
        }
      }

      this.linking = false;
      this.tempLink = null;
      this.linkStart = null;
    },
    linkingBreak(target, slot) {
      console.log('linkingBreak');
      if (target && slot > -1) {
        let findLink = this.links.find(({ targetID, targetSlot }) => targetID === target.id && targetSlot === slot);
        if (findLink) {
          let findBlock = this.blocks.find(({ id }) => id === findLink.originID);
          this.links = this.links.filter(
            ({ targetID, targetSlot }) => !(targetID === target.id && targetSlot === slot)
          );
          this.linkingStart(findBlock, findLink.originSlot);
          this.updateModel();
        }
      }
    },

    position({ left, top }) {
      if (!this.keyEvent.ctrlKey) {
        this.blocks.forEach(block => {
          const [x, y] = block.position;
          block.position = block.selected ? [x + left, y + top] : [x, y];
        });
      }
    },

    blockSelect({ id, selected }) {
      // this.$store.dispatch('blocks/deselect', block);
      console.log(id, selected);
      if (!selected || this.keyEvent.ctrlKey) {
        this.$nextTick(() => {
          this.$store.dispatch('blocks/select', { id });
        });
      }
    },

    blockDeselect() {
      this.$store.dispatch('blocks/deselect');
    },

    updateModel() {
      // this.$store.dispatch("blocks/updateModel");
    },
  },

  mounted() {
    const doc = document.documentElement;
    this.$el.addEventListener('mouseenter', this.handleMauseOver);
    this.$el.addEventListener('mouseleave', this.handleMauseOver);
    doc.addEventListener('keydown', this.keyup);
    doc.addEventListener('keyup', this.keyup);
    doc.addEventListener('mousemove', this.handleMove, true);
    doc.addEventListener('mousedown', this.handleDown, true);
    doc.addEventListener('mouseup', this.handleUp, true);
    doc.addEventListener('wheel', this.handleWheel, true);
    this.centerX = this.$el.clientWidth / 2;
    this.centerY = this.$el.clientHeight / 2;
  },
  beforeDestroy() {
    const doc = document.documentElement;
    this.$el.removeEventListener('mouseenter', this.handleMauseOver);
    this.$el.removeEventListener('mouseleave', this.handleMauseOver);
    doc.removeEventListener('keydown', this.keyup);
    doc.removeEventListener('keyup', this.keyup);
    doc.removeEventListener('mousemove', this.handleMove, true);
    doc.removeEventListener('mousedown', this.handleDown, true);
    doc.removeEventListener('mouseup', this.handleUp, true);
    doc.removeEventListener('wheel', this.handleWheel, true);
  },
};
</script>

<style lang="scss" scoped>
.blocks {
  height: 100%;
  width: 100%;
  // background-color: #17212b;
  position: relative;
  overflow: hidden;
  &__lines {
    position: absolute;
  }
  &__center {
    position: absolute;
  }
}
</style>
