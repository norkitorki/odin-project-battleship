export const GameboardDisplay = (rows, columns) => {
  const obj = { locked: false };
  const callbacks = {};

  const container = document.createElement('div');
  container.classList.value = 'gameboard';
  container.style.gridTemplate = `repeat(${rows + 1}, 1fr) / repeat(${
    columns + 1
  }, 1fr)`;

  const appendElement = (type, callback) => {
    const element = document.createElement(type);
    callback(element);
    container.appendChild(element);
  };

  const colNumber = (col) => (el) => (el.textContent = col < 1 ? '' : col);
  const rowLetter = (row) => (el) =>
    (el.textContent = String.fromCharCode(65 + (row % 26)));
  const btnField = (row, col) => (el) => (el.dataset['field'] = `${row}${col}`);

  const getField = (row, column) => {
    return container.querySelector(`[data-field="${row}${column}"]`);
  };

  for (let col = 0; col <= columns; col++) {
    appendElement('span', colNumber(col));
  }

  for (let row = 0; row < rows; row++) {
    appendElement('span', rowLetter(row));
    for (let col = 0; col < columns; col++) {
      appendElement('button', btnField(row, col));
    }
  }

  obj.renderBoard = (parent = document.body) => {
    parent.appendChild(container);
  };

  obj.addCallback = (eventType, callback) => {
    if (!callbacks[eventType]) callbacks[eventType] = {};

    callbacks[eventType][callback] = (e) => {
      const target = e.target;
      if (!obj.locked && target.nodeName === 'BUTTON') {
        callback.call(
          null,
          Number(target.dataset.field[0]),
          Number(target.dataset.field[1])
        );
      }
    };

    container.addEventListener(eventType, callbacks[eventType][callback]);
  };

  obj.removeCallback = (eventType, callback) => {
    container.removeEventListener(eventType, callbacks[eventType][callback]);
    delete callbacks[eventType][callback];
    return callback;
  };

  obj.updateField = (row, column, symbol, customStyles) => {
    const field = getField(row, column);
    if (field && symbol) {
      Array.from(field.children).forEach((el) => field.removeChild(el));
      field.setAttribute('style', customStyles);
      return field.appendChild(symbol);
    }
  };

  obj.highlightField = (row, column) => {
    const field = getField(row, column);
    if (field) field.classList.toggle('highlighted');
  };

  obj.removeHighlights = () => {
    const fields = container.querySelectorAll('.highlighted');
    fields.forEach((field) => field.classList.remove('highlighted'));
  };

  obj.hide = () => {
    container.style.display = 'none';
  };

  obj.unhide = () => {
    container.style.display = '';
  };

  return obj;
};
