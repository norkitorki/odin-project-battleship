import { Gameboard } from '../lib/gameboard';

describe('Gameboard', () => {
  test('should be a factory function', () => {
    const board = Gameboard(10, 10);

    expect(Gameboard).toEqual(expect.any(Function));
    expect(board).toEqual(expect.any(Object));
  });

  test('should have a rows property', () => {
    const board = Gameboard(10, 10);

    expect(board.rows).toBe(10);
  });

  test('should have a columns property', () => {
    const board = Gameboard(8, 8);

    expect(board.columns).toBe(8);
  });

  test('should have a hitCount property', () => {
    const board = Gameboard(10, 10);

    expect(board.hitCount).toBe(0);
  });

  test('should have a missCount property', () => {
    const board = Gameboard(10, 10);

    expect(board.missCount).toBe(0);
  });

  describe('#placeShip', () => {
    test('should place ship', () => {
      const board = Gameboard(10, 10);
      const ship = { length: 2 };

      expect(board.shipCount).toBe(0);

      const actual = board.placeShip(
        [
          [0, 4],
          [1, 4],
        ],
        ship
      );

      expect(actual).toStrictEqual(ship);
      expect(board.shipCount).toBe(1);
      expect(board.at(0, 4)).toStrictEqual(ship);
      expect(board.at(1, 4)).toStrictEqual(ship);
    });

    test('should throw error if field is already occupied', () => {
      const board = Gameboard(10, 10);
      const ship = { length: 2 };

      expect(board.shipCount).toBe(0);

      board.placeShip(
        [
          [0, 4],
          [1, 4],
        ],
        ship
      );

      expect(() =>
        board.placeShip(
          [
            [0, 4],
            [1, 4],
          ],
          ship
        )
      ).toThrow();

      expect(board.shipCount).toBe(1);
    });

    test('should throw error if coordinates are out of range', () => {
      const board = Gameboard(10, 10);
      const ship = { length: 2 };

      expect(board.shipCount).toBe(0);

      expect(() =>
        board.placeShip(
          [
            [10, 4],
            [0, 2222],
          ],
          ship
        )
      ).toThrow();

      expect(() =>
        board.placeShip(
          [
            [-2, 5],
            [9, -9],
          ],
          ship
        )
      ).toThrow();

      expect(board.shipCount).toBe(0);
    });
  });

  describe('#at', () => {
    test('should return ship', () => {
      const board = Gameboard(10, 10);
      const ship = { length: 2 };
      board.placeShip(
        [
          [5, 0],
          [4, 0],
        ],
        ship
      );

      expect(board.at(5, 0)).toStrictEqual(ship);
      expect(board.at(4, 0)).toStrictEqual(ship);
    });

    test('should return undefined if field is empty or out of range', () => {
      const board = Gameboard(10, 10);

      expect(board.at(0, 5)).toBeUndefined();
      expect(board.at(100, 4)).toBeUndefined();
      expect(board.at(7, 3442)).toBeUndefined();
      expect(board.at(-223, -5)).toBeUndefined();
    });

    test('should return true if ship has been hit', () => {
      const board = Gameboard(10, 10);
      const ship = { hit: jest.fn(), isSunk: jest.fn() };
      board.placeShip(
        [
          [0, 0],
          [0, 1],
        ],
        ship
      );
      board.receiveAttack(0, 1);

      expect(board.at(0, 1)).toBe(true);
    });

    test('should return false if no ship has been hit', () => {
      const board = Gameboard(10, 10);
      board.receiveAttack(2, 2);

      expect(board.at(2, 2)).toBe(false);
    });
  });

  describe('#receiveAttack', () => {
    test('should register hit on ship', () => {
      const board = Gameboard(10, 10);
      const ship = { length: 2, hit: jest.fn(), isSunk: jest.fn() };
      board.placeShip(
        [
          [0, 9],
          [1, 9],
        ],
        ship
      );

      expect(board.hitCount).toBe(0);
      expect(board.missCount).toBe(0);
      expect(board.receiveAttack(0, 9)).toBe(ship);
      expect(ship.hit).toHaveBeenCalledTimes(1);
      expect(board.hitCount).toBe(1);
      expect(board.missCount).toBe(0);
      expect(board.at(0, 9)).toBe(true);
    });

    test('should reduce shipCount when ship is sunk', () => {
      const board = Gameboard(10, 10);
      const ship = { length: 2, hit: jest.fn(), isSunk: jest.fn(() => true) };
      board.placeShip(
        [
          [0, 2],
          [1, 2],
        ],
        ship
      );

      expect(board.shipCount).toBe(1);
      expect(board.receiveAttack(0, 2)).toBe(ship);
      expect(board.shipCount).toBe(0);
    });

    test('should register attack on empty field', () => {
      const board = Gameboard(10, 10);

      expect(board.hitCount).toBe(0);
      expect(board.missCount).toBe(0);
      expect(board.receiveAttack(2, 2)).toBe(false);
      expect(board.hitCount).toBe(0);
      expect(board.missCount).toBe(1);
      expect(board.at(2, 2)).toBe(false);
    });

    test('should work with subsequent attacks', () => {
      const board = Gameboard(10, 10);
      const ship = { length: 2, hit: jest.fn(), isSunk: jest.fn() };
      board.placeShip(
        [
          [4, 4],
          [3, 4],
        ],
        ship
      );

      expect(board.hitCount).toBe(0);
      expect(board.missCount).toBe(0);
      expect(board.receiveAttack(5, 5)).toBe(false);
      expect(board.receiveAttack(5, 5)).toBe(false);
      expect(board.receiveAttack(4, 4)).toBe(ship);
      expect(board.receiveAttack(4, 4)).toBe(true);
      expect(board.hitCount).toBe(1);
      expect(board.missCount).toBe(1);
      expect(board.at(5, 5)).toBe(false);
      expect(board.at(4, 4)).toBe(true);
    });

    test('should not register attacks out of range', () => {
      const board = Gameboard(10, 10);
      board.receiveAttack(-100, 15);

      expect(board.at(-100, 15)).toBeUndefined();
    });
  });

  describe('#allShipsSunk', () => {
    test('should return true when all ships are sunk', () => {
      const board = Gameboard(10, 10);

      expect(board.shipCount).toBe(0);
      expect(board.allShipsSunk()).toBeTruthy();
    });

    test('should return false when one or more ships are stil afloat', () => {
      const board = Gameboard(10, 10);
      const ship = { length: 2, isSunk: jest.fn() };
      board.placeShip(
        [
          [0, 0],
          [0, 1],
        ],
        ship
      );

      expect(board.shipCount).toBe(1);
      expect(board.allShipsSunk()).toBeFalsy();
    });
  });
});
