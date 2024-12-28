export const GameboardDisplay = (
  rows,
  columns,
  options = { keyboardTraverse: true }
) => {
  const obj = { locked: false };
  const callbacks = {};

  const container = document.createElement('div');
  container.classList.value = 'gameboard';
  container.style.gridTemplate = `repeat(${rows + 1}, 1fr) / repeat(${
    columns + 1
  }, 1fr)`;

  if (options.keyboardTraverse) {
    container.addEventListener('keydown', (e) => {
      const key = e.code;
      if (key.startsWith('Arrow') || key.startsWith('Key')) {
        const field = document.activeElement;
        if (field.nodeName === 'BUTTON' && field.parentElement === container) {
          e.preventDefault();
          let row = Number(field.dataset.field[0]);
          let col = Number(field.dataset.field[1]);
          if (key === 'ArrowUp' || key === 'KeyW') row--;
          if (key === 'ArrowDown' || key === 'KeyS') row++;
          if (key === 'ArrowLeft' || key === 'KeyA') col--;
          if (key === 'ArrowRight' || key === 'KeyD') col++;

          if (row >= 0 && row < rows && col >= 0 && col < columns) {
            container.querySelector(`[data-field="${row}${col}"]`).focus();
          }
        }
      }
    });
  }

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

  obj.renderBoard = (parent = document.body, replaceExisting = true) => {
    const previous = parent.querySelector('.gameboard');
    if (previous && replaceExisting) previous.remove();
    parent.appendChild(container);
  };

  obj.addCallback = (eventType, identifier, callback) => {
    if (!callbacks[eventType]) callbacks[eventType] = {};

    callbacks[eventType][identifier] = (e) => {
      const target = e.target;
      if (!obj.locked && target.nodeName === 'BUTTON') {
        const [row, col] = target.dataset.field;
        callback.call(null, Number(row), Number(col));
      }
    };

    container.addEventListener(eventType, callbacks[eventType][identifier]);
  };

  obj.removeCallback = (eventType, identifier) => {
    container.removeEventListener(eventType, callbacks[eventType][identifier]);
    delete callbacks[eventType][identifier];
  };

  obj.updateField = (row, column, symbol, customStyles = '') => {
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
