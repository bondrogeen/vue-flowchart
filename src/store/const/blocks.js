const Block = class {
  constructor({ id, name = 'Block', type = 'Input', position = [0, 0] }) {
    this.id = id
    this.name = name
    this.type = type
    this.position = position
    this.selected = false
    this.inputs = [{}]
    this.outputs = [{}]
    this.bind = { up: [], down: [] }
    this.parameters = {}
  }
};

export { Block };
