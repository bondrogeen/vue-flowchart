import { Block } from '../const/blocks';

export default {
  namespaced: true,
  state: () => ({
    blocks: [new Block({ id: 1 }), new Block({ id: 3 }), new Block({ id: 2 })],
    links: [],
    key: {}
  }),
  mutations: {
    SET_BLOCKS (state, value) {
      state.blocks = value;
    },
    SET_LINKS (state, value) {
      state.links = value;
    },
    SET_KEY_EVENT (state, value) {
      state.key = value;
    },
  },
  actions: {
    // BLOCKS____________________________________________________
    add ({ commit, state: { blocks } }, { type, position }) {
      const id = Math.max(0, ...blocks.map(o => o.id)) + 1;
      const block = new Block({ id, type, position })
      commit('SET_BLOCKS', [...blocks, block]);
    },

    update ({ commit }, blocks) {
      commit('SET_BLOCKS', [...blocks]);
    },

    remove ({ dispatch, commit, state: { blocks } }, block) {
      const all = block ? [block.id] : blocks.filter(b => b.selected).map(b => b.id)
      dispatch('removeLinkToBlock', all);
      commit('SET_BLOCKS', [...blocks.filter(b => !all.includes(b.id))]);
    },

    clone ({ commit, state: { blocks } }, oldBlock) {
      let id = Math.max(0, ...blocks.map(o => o.id)) + 1;
      const block = JSON.parse(JSON.stringify(oldBlock))
      block.id = id
      const [x, y] = block.position
      block.position = [ x + 5, y + 5 ]
      commit('SET_BLOCKS', [...blocks, block]);
    },

    cloneAll ({ dispatch, state: { blocks } }) {
      const all = blocks.filter(b => b.selected)
      all.forEach(b => {
        dispatch('clone', b);
      })
      dispatch('deselect');
    },

    select ({ commit, state: { blocks, key: { ctrlKey } } }, { id }) {
      const update = blocks.map((b) => {
        const selected = !ctrlKey ? b.id === id : (b.id === id) ? !b.selected : b.selected
        return { ...b, selected }
      })
      commit('SET_BLOCKS', [...update]);
    },

    deselect ({ commit, state: { blocks } }, value = false) {
      const update = blocks.map(b => {
        const selected = value
        return { ...b, selected }
      })
      commit('SET_BLOCKS', [...update]);
    },

    // LINKS__________________________________________

    addLink ({ commit, state: { links } }, link) {
      commit('SET_LINKS', [...links, link]);
    },
    updateLink ({ commit }, links) {
      commit('SET_LINKS', [...links]);
    },
    removeLink ({ commit, state: { links } }, id) {
      commit('SET_LINKS', [...links.filter(value => value.id !== id)]);
    },
    removeLinkToBlock ({ commit, state: { links } }, arr) {
      commit('SET_LINKS', [...links.filter(link => (!arr.includes(link.originID) && !arr.includes(link.targetID)))]);
    },

    setKeyEvent ({ commit }, value) {
      commit('SET_KEY_EVENT', value);
    },
  },
  getters: {
    getBlocks: ({ blocks }) => blocks,
    getKeyEvent: ({ key }) => key,
    getLinks: ({ links }) => links,
    getBlock: ({ blocks }) => id => {
      const index = blocks.findIndex(item => item.id == id);
      return blocks[index] || {};
    },
  },
};
