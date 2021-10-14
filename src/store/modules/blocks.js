import { Block } from '../const/blocks';

export default {
  namespaced: true,
  state: () => ({
    blocks: [new Block({ id: 1 }), new Block({ id: 3 }), new Block({ id: 2 })],
    links: [],
    keyEvent: {}
  }),
  mutations: {
    SET_ERRORS_BLOCKS (state, value) {
      state.errorsBlocks = value
    },
    SET_ERRORS_FIELDS (state, value) {
      state.errorsFields = value
    },
    SET_BLOCKS (state, value) {
      state.blocks = value;
    },
    SET_LINKS (state, value) {
      state.links = value;
    },
    SET_KEY_EVENT (state, value) {
      state.keyEvent = value;
    },
  },
  actions: {
    // BLOCKS____________________________________________________
    add ({ commit, state: { blocks } }, { type, position }) {
      const id = Math.max(0, ...blocks.map(o => o.id)) + 1;
      const block = new Block({ id, type, position })
      commit('SET_BLOCKS', [...blocks, block]);
    },

    remove ({ dispatch, commit, state: { blocks } }, block) {
      if (block) {
        dispatch('removeLinkToBlock', block);
        commit('SET_BLOCKS', [...blocks.filter(b => b.id !== block.id)]);
      }
    },

    removeSelected ({ dispatch, state: { blocks } }) {
      blocks.forEach(block => {
        if (block.selected) {
          dispatch('remove', block);
          block.selected = false
        }
      })
    },

    clone ({ commit, state: { blocks } }, oldBlock) {
      let id = Math.max(0, ...blocks.map(o => o.id)) + 1;
      const block = JSON.parse(JSON.stringify(oldBlock))
      block.id = id
      commit('SET_BLOCKS', [...blocks, block]);
    },

    cloneAll ({ dispatch, state: { blocks } }) {
      blocks.forEach(block => {
        if (block.selected) {
          dispatch('clone', block);
          block.selected = false
        }
      })
    },

    select ({ commit, state: { blocks, keyEvent: { ctrlKey } } }, { id }) {
      blocks.map((b) => b.selected = !ctrlKey ? b.id === id : (b.id === id) ? b.selected = !b.selected : b.selected)
      commit('SET_BLOCKS', [...blocks]);
    },

    deselect ({ commit, state: { blocks } }) {
      blocks.forEach(item =>
        item.selected = false
      )
      commit('SET_BLOCKS', [...blocks]);
    },
    setBlock ({ commit, state: { blocks } }, value) {
      const index = blocks.findIndex(item => item.id == value.id);
      blocks[index] = value;
      commit('SET_BLOCKS', [...blocks]);
    },
    setBlocks ({ commit }, value) {
      commit('SET_BLOCKS', [...value]);
    },


    // LINKS__________________________________________
    removeLink ({ commit, state: { links } }, id) {
      commit('SET_LINKS', [...links.filter(value => value.id !== id)]);
    },
    removeLinkToBlock ({ commit, state: { links } }, block) {
      commit('SET_LINKS', [...links.filter(link => (link.originID !== block.id && link.targetID !== block.id))]);
    },
    setLinks ({ commit }, value) {
      commit('SET_LINKS', [...value]);
    },

    setKeyEvent ({ commit }, value) {
      commit('SET_KEY_EVENT', value);
    },
  },
  getters: {
    getBlocks: ({ blocks }) => blocks,
    getKeyEvent: ({ keyEvent }) => keyEvent,
    getLinks: ({ links }) => links,
    getBlock: ({ blocks }) => id => {
      const index = blocks.findIndex(item => item.id == id);
      return blocks[index] || {};
    },
  },
};
