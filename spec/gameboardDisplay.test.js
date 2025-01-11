/**
 * @jest-environment jsdom
 */

import { GameboardDisplay } from '../lib/gameboardDisplay';

describe('gameboardDisplay', () => {
  beforeEach(() => {
    Array.from(document.body.children).forEach((el) =>
      document.body.removeChild(el)
    );
  });

  test('should be a factory function', () => {
    const display = GameboardDisplay(10, 10);

    expect(GameboardDisplay).toEqual(expect.any(Function));
    expect(display).toEqual(expect.any(Object));
  });

  test('should have a locked property', () => {
    const display = GameboardDisplay(10, 10);

    expect(display.locked).toBe(false);
  });

  test('should be traversible by keyboard', () => {
    const display = GameboardDisplay(10, 10, { keyboardTraverse: true });
    display.renderBoard();
    const gameBoard = document.querySelector('.gameboard');
    gameBoard.querySelector('[data-field="44"]').focus();

    const dispatchKeyboardEvent = (code) => {
      const event = new KeyboardEvent('keydown', { code });
      gameBoard.dispatchEvent(event);
    };

    dispatchKeyboardEvent('ArrowLeft');
    expect(document.activeElement).toEqual(
      gameBoard.querySelector('[data-field="43"]')
    );
    dispatchKeyboardEvent('ArrowUp');
    expect(document.activeElement).toEqual(
      gameBoard.querySelector('[data-field="33"]')
    );
    dispatchKeyboardEvent('ArrowRight');
    expect(document.activeElement).toEqual(
      gameBoard.querySelector('[data-field="34"]')
    );
    dispatchKeyboardEvent('ArrowDown');
    expect(document.activeElement).toEqual(
      gameBoard.querySelector('[data-field="44"]')
    );
    dispatchKeyboardEvent('KeyD');
    expect(document.activeElement).toEqual(
      gameBoard.querySelector('[data-field="45"]')
    );
    dispatchKeyboardEvent('KeyS');
    expect(document.activeElement).toEqual(
      gameBoard.querySelector('[data-field="55"]')
    );
    dispatchKeyboardEvent('KeyA');
    expect(document.activeElement).toEqual(
      gameBoard.querySelector('[data-field="54"]')
    );
    dispatchKeyboardEvent('KeyW');
    expect(document.activeElement).toEqual(
      gameBoard.querySelector('[data-field="44"]')
    );
  });

  describe('#renderBoard', () => {
    test('should append gameboard to parent', () => {
      const display = GameboardDisplay(10, 10);
      const parent = document.createElement('section');
      display.renderBoard(parent);
      const gameBoard = parent.querySelector('.gameboard');

      expect(gameBoard).not.toBeNull();
    });

    test('should append gameboard to body if parent is omitted', () => {
      const display = GameboardDisplay(10, 10);
      display.renderBoard();
      const gameBoard = document.body.querySelector('.gameboard');

      expect(
        Array.from(document.body.children).includes(gameBoard)
      ).toBeTruthy();
    });

    test('should replace existing gameboard when replaceExisting is true', () => {
      const display = GameboardDisplay(10, 10);
      const displayTwo = GameboardDisplay(10, 10);
      display.renderBoard();
      displayTwo.renderBoard(document.body, true);

      expect(document.body.querySelectorAll('.gameboard').length).toBe(1);
    });

    test('should append to parent when replaceExisting is false', () => {
      const display = GameboardDisplay(10, 10);
      const displayTwo = GameboardDisplay(10, 10);
      display.renderBoard();
      displayTwo.renderBoard(document.body, false);

      expect(document.body.querySelectorAll('.gameboard').length).toBe(2);
    });
  });

  describe('#addCallback', () => {
    test('should set up callback invocation', () => {
      const callback = jest.fn();
      const display = GameboardDisplay(10, 10);
      display.renderBoard();
      display.addCallback('click', 'myCallback', callback);
      const field = document.querySelector('[data-field="04"]');
      const anotherField = document.querySelector('[data-field="92"]');

      field.click();
      anotherField.click();
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback.mock.calls).toEqual([
        [0, 4],
        [9, 2],
      ]);
    });

    test('should not invoke calback when locked property is truthy', () => {
      const callback = jest.fn();
      const display = GameboardDisplay(10, 10);
      display.renderBoard();
      display.addCallback('click', 'myCallback', callback);
      display.locked = true;
      const field = document.querySelector('[data-field="44"]');

      field.click();
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('#removeCallback', () => {
    test('should remove callback invokation', () => {
      const callback = jest.fn();
      const display = GameboardDisplay(10, 10);
      display.renderBoard();
      display.addCallback('click', 'myCallback', callback);
      display.removeCallback('click', 'myCallback');
      const field = document.querySelector('[data-field="89"]');

      field.click();
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('#updateField', () => {
    test('should append template content to field', () => {
      const display = GameboardDisplay(10, 10);

      const svg = document.createElement('svg');
      svg.classList.add('my-peg');
      document.body.innerHTML = `<template id="peg-template">${svg.outerHTML}</template>`;
      display.renderBoard();
      display.updateField(5, 5, 'peg-template');
      const field = document.querySelector('[data-field="55"]');

      expect(field.firstElementChild.outerHTML).toBe(svg.outerHTML);
    });

    test('should set class attribute of field', () => {
      const display = GameboardDisplay(10, 10);

      const clazz = 'my-custom-class';
      const svg = document.createElement('svg');
      svg.classList.add('my-peg');
      document.body.innerHTML = `<template id="peg-template">${svg.outerHTML}</template>`;
      display.renderBoard();
      display.updateField(3, 3, 'peg-template', clazz);
      const field = document.querySelector('[data-field="33"]');

      expect(field.classList.value).toBe(clazz);
    });

    test('should return when coordinates are out of range', () => {
      const display = GameboardDisplay(10, 10);

      const svg = document.createElement('svg');
      svg.classList.add('my-peg');
      document.body.innerHTML = `<template id="peg-template">${svg.outerHTML}</template>`;
      display.renderBoard();

      const board = document.querySelector('.gameboard');
      display.updateField(12, 5, 'peg-template');

      expect(board.querySelector('svg')).toBeNull();
    });

    test('should return when coordinates are omitted', () => {
      const display = GameboardDisplay(10, 10);

      const svg = document.createElement('svg');
      svg.classList.add('my-peg');
      document.body.innerHTML = `<template id="peg-template">${svg.outerHTML}</template>`;
      display.renderBoard();

      const board = document.querySelector('.gameboard');
      display.updateField(null, null, 'peg-template');

      expect(board.querySelector('svg')).toBeNull();
    });

    test('should return when templateId is omitted', () => {
      const display = GameboardDisplay(10, 10);

      const svg = document.createElement('svg');
      svg.classList.add('my-peg');
      document.body.innerHTML = `<template id="peg-template">${svg.outerHTML}</template>`;
      display.renderBoard();

      const field = document.querySelector('[data-field="55"]');
      const actual = display.updateField(5, 5);

      expect(actual).toBeUndefined();
      expect(field.firstElementChild).toBeNull();
    });
  });

  describe('#highlightField', () => {
    test('should add highlighted class to field', () => {
      const display = GameboardDisplay(10, 10);
      display.renderBoard();
      display.highlightField(4, 0);
      const field = document.querySelector('[data-field="40"]');

      expect(field.classList.value).toBe('highlighted');
    });

    test('should remove highlighted class from field when called again', () => {
      const display = GameboardDisplay(10, 10);
      display.renderBoard();
      display.highlightField(5, 5);
      const field = document.querySelector('[data-field="55"]');

      expect(field.classList.value).toBe('highlighted');
      display.highlightField(5, 5);
      expect(field.classList.value).toBe('');
    });
  });

  describe('#removeHighlights', () => {
    test('should remove highlighted class from every field', () => {
      const display = GameboardDisplay(10, 10);
      display.renderBoard();
      display.highlightField(2, 4);
      display.highlightField(8, 1);
      const fields = [
        document.querySelector('[data-field="24"]'),
        document.querySelector('[data-field="81"]'),
      ];

      expect(
        fields.every((f) => f.classList.value === 'highlighted')
      ).toBeTruthy();
      display.removeHighlights();
      expect(fields.every((f) => f.classList.value === '')).toBeTruthy();
    });
  });

  describe('#clear', () => {
    test('should clear fields', () => {
      const display = GameboardDisplay(10, 10);
      display.renderBoard();
      const container = document.querySelector('.gameboard');

      const fields = [
        container.querySelector('[data-field="02"]'),
        container.querySelector('[data-field="03"]'),
        container.querySelector('[data-field="04"]'),
        container.querySelector('[data-field="05"]'),
        container.querySelector('[data-field="06"]'),
      ];

      fields.forEach((field, i) => {
        field.classList.add('field-class');
        const div = document.createElement('div');
        div.textContent = i;
        field.appendChild(div);
      });

      expect(container.querySelectorAll('.field-class').length).toBe(5);
      display.clear();
      expect(container.querySelectorAll('.field-class').length).toBe(0);
      expect(fields.every((field) => field.textContent === '')).toBeTruthy();
    });

    test('should remove callbacks if removeCallbacks is true', () => {
      const display = GameboardDisplay(10, 10);
      display.renderBoard();
      const field = document.querySelector('[data-field="85"]');
      const clickCallback = jest.fn();

      display.addCallback('click', 'clickCb', clickCallback);

      field.click();
      display.clear(true);
      field.click();

      expect(clickCallback).toHaveBeenCalledTimes(1);
    });

    test('should not remove callbacks if removeCallbacks is false', () => {
      const display = GameboardDisplay(10, 10);
      display.renderBoard();
      const field = document.querySelector('[data-field="85"]');
      const clickCallback = jest.fn();

      display.addCallback('click', 'clickCb', clickCallback);

      field.click();
      display.clear();
      field.click();

      expect(clickCallback).toHaveBeenCalledTimes(2);
    });
  });
});
