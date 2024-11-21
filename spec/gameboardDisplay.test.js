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

  test('should be traversible by keyboard arrow keys', () => {
    const display = GameboardDisplay(10, 10, { keyboardTraverse: true });
    display.renderBoard();
    const gameBoard = document.querySelector('.gameboard');
    gameBoard.querySelector('[data-field="44"]').focus();

    const dispatchKeyboardEvent = (key) => {
      const event = new KeyboardEvent('keydown', { key });
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

      expect(Array.from(document.body.children).includes(gameBoard)).toBeTruthy();
    });
  });

  describe('#addCallback', () => {
    test('should set up callback invocation', () => {
      const callback = jest.fn();
      const display = GameboardDisplay(10, 10);
      display.renderBoard();
      display.addCallback('click', callback);
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
      display.addCallback('click', callback);
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
      display.addCallback('click', callback);
      const actual = display.removeCallback('click', callback);
      const field = document.querySelector('[data-field="89"]');

      field.click();
      expect(callback).not.toHaveBeenCalled();
      expect(actual).toStrictEqual(callback);
    });
  });

  describe('#updateField', () => {
    test('should append element to the field', () => {
      const display = GameboardDisplay(10, 10);
      const element = document.createElement('svg');
      display.renderBoard();
      const field = document.querySelector('[data-field="55"]');
      const actual = display.updateField(5, 5, element);

      expect(actual).toBe(element);
      expect(field.firstElementChild).toBe(element);
    });

    test('should set style attribute of field', () => {
      const display = GameboardDisplay(10, 10);
      const element = document.createElement('svg');
      display.renderBoard();
      const field = document.querySelector('[data-field="33"]');
      const styles = 'background-color: blue;';
      display.updateField(3, 3, element, styles);

      expect(field.getAttribute('style')).toBe(styles);
    });

    test('should return when coordinates are out of range', () => {
      const display = GameboardDisplay(10, 10);
      const element = document.createElement('svg');
      display.renderBoard();
      const board = document.querySelector('.gameboard');
      const actual = display.updateField(12, 5, element);

      expect(actual).toBeUndefined();
      expect(board.querySelector('svg')).toBeNull();
    });

    test('should return when coordinates are omitted', () => {
      const display = GameboardDisplay(10, 10);
      const element = document.createElement('svg');
      display.renderBoard();
      const board = document.querySelector('.gameboard');
      const actual = display.updateField(undefined, undefined, element);

      expect(actual).toBeUndefined();
      expect(board.querySelector('svg')).toBeNull();
    });

    test('should return when element is omitted', () => {
      const display = GameboardDisplay(10, 10);
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

  describe('#hide', () => {
    test('should hide display', () => {
      const display = GameboardDisplay(10, 10);
      display.renderBoard();
      const board = document.querySelector('.gameboard');

      expect(board.style.display).toBe('');
      display.hide();
      expect(board.style.display).toBe('none');
    });
  });

  describe('#unhide', () => {
    test('should unhide display', () => {
      const display = GameboardDisplay(10, 10);
      display.renderBoard();
      const board = document.querySelector('.gameboard');
      display.hide();

      expect(board.style.display).toBe('none');
      display.unhide();
      expect(board.style.display).toBe('');
    });
  });
});
