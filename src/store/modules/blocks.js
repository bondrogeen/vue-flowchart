import { prepareBlocks, prepareLinks, changeTypeBlock, cloneBlock, Block } from '../const/blocks';

export default {
  namespaced: true,
  state: () => ({
    select: null,
    model: {},
    blocks: [
      // {
      //   typeLabel: "Input",
      //   selected: true,
      //   inputs: [],
      //   outputs: [{}],
      //   id: 1,
      //   name: "Вход 1",
      //   type: "Input",
      //   group: "input",
      //   bind: { up: [null], down: [] },
      //   shape: { input: [], output: [] },
      //   task: null,
      //   num_classes: null,
      //   position: [-110, -138],
      //   parameters: { main: {}, extra: {} },
      //   reference: null,
      // },
      // {
      //   typeLabel: "Dense",
      //   selected: false,
      //   inputs: [{}],
      //   outputs: [],
      //   id: 3,
      //   name: "Выход  3",
      //   type: "Dense",
      //   group: "output",
      //   bind: { up: [], down: [] },
      //   shape: { input: [], output: [] },
      //   task: null,
      //   num_classes: null,
      //   position: [-105, 64],
      //   reference: null,
      // },
    ],
    errorsBlocks: {},
    errorsFields: {},
    links: [],
    modeling: {
      list: [],
      layers_types: {},
    },
  }),
  mutations: {
    SET_MODELING (state, value) {
      state.modeling = { ...value };
    },
    SET_ERRORS_BLOCKS (state, value) {
      state.errorsBlocks = { ...value }
    },
    SET_ERRORS_FIELDS (state, value) {
      state.errorsFields = { ...value }
    },
    SET_MODEL (state, value) {
      state.model = value;
      const { layers } = value;
      state.blocks = prepareBlocks(layers, state.modeling.list);
      state.links = prepareLinks(layers);
    },
    SET_BLOCKS (state, value) {
      state.blocks = [...value];
    },
    SET_LINKS (state, value) {
      state.links = [...value];
    },
    SET_LIST (state, value) {
      state.list = [...value];
    },
    SET_SELECT (state, value) {
      state.select = value;
    },
  },
  actions: {
    add ({ commit, state: { blocks } }, { type, position }) {
      const id = Math.max(0, ...blocks.map(o => o.id)) + 1;
      const block = new Block({ id, type, position })
      blocks.push(block);
      commit('SET_BLOCKS', blocks);
    },
    typeBlock ({ commit, state: { blocks, modeling: { layers_types, list } } }, { type, block }) {
      let newBlock = changeTypeBlock(type, block, layers_types, list);
      if (!newBlock) return;
      // blocks.push(block);
      commit('SET_BLOCKS', blocks);
    },
    clone ({ commit, state: { blocks } }, oldBlock) {
      let maxID = Math.max(0, ...blocks.map(o => o.id));
      const block = cloneBlock(oldBlock, maxID + 1);
      if (!block) return;
      blocks.push(block);
      commit('SET_BLOCKS', blocks);
    },
    select ({ commit, state: { blocks } }, block) {
      blocks.forEach(item => {
        item.selected = item.id === block.id
      })
      commit('SET_BLOCKS', blocks);
      commit('SET_SELECT', block.id);
    },
    deselect ({ commit, state: { blocks } }) {
      blocks.forEach(item => {
        item.selected = false
      })
      commit('SET_BLOCKS', blocks);
      commit('SET_SELECT', null);
    },
    remove ({ dispatch, commit, state: { blocks } }, block) {
      if (block.selected) {
        block.selected = false;
      }
      dispatch('removeLinkToBlock', block);
      commit('SET_BLOCKS', blocks.filter(b => b.id !== block.id));
    },
    removeLink ({ commit, state: { links } }, id) {
      console.log(id)
      commit('SET_LINKS', links.filter(value => value.id !== id));
    },
    removeLinkToBlock ({ commit, state: { links } }, block) {
      console.log(block)
      commit('SET_LINKS', links.filter(link => (link.originID !== block.id && link.targetID !== block.id)));
    },
    setBlocks ({ commit }, value) {
      commit('SET_BLOCKS', value);
    },
    setLinks ({ commit }, value) {
      commit('SET_LINKS', value);
    },
    setBlock ({ commit, state: { blocks } }, value) {
      const index = blocks.findIndex(item => item.id == value.id);
      blocks[index] = value;
      console.log(blocks);
      commit('SET_BLOCKS', blocks);
    },
  },
  getters: {
    getList: ({ modeling: { list } }) => list,
    getLayersType: ({ modeling: { layers_types } }) => layers_types,
    getModel: ({ model }) => model,
    getBlocks: ({ blocks }) => blocks,
    getErrorsBlocks: ({ errorsBlocks }) => errorsBlocks,
    getErrorsFields: ({ errorsFields }) => errorsFields,
    getLinks: ({ links }) => links,
    getSelect: ({ select }) => select,
    getBlock: ({ select, blocks }) => {
      const id = blocks.findIndex(item => item.id == select);
      return blocks[id] || {};
    },
  },
};
