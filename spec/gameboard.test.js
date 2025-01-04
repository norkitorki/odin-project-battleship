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

  test('should have a targetBoard property', () => {
    const board = Gameboard(10, 10);

    expect(board.targetBoard).toStrictEqual({});
  });

  test('should have a fleetBoard property', () => {
    const board = Gameboard(10, 10);

    expect(board.fleetBoard).toStrictEqual({});
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

    test('should throw error when coordinates are not adjacent to each other', () => {
      const board = Gameboard(10, 10);
      const ship = { length: 2 };

      expect(board.shipCount).toBe(0);

      expect(() =>
        board.placeShip(
          [
            [6, 6],
            [2, 6],
          ],
          ship
        )
      ).toThrow();

      expect(board.shipCount).toBe(0);
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

  describe('#getShip', () => {
    test('should return ship at coordinates', () => {
      const board = Gameboard(10, 10);
      const ship = { length: 2 };
      board.placeShip(
        [
          [3, 3],
          [3, 4],
        ],
        ship
      );

      expect(board.getShip(3, 3)).toStrictEqual(ship);
      expect(board.getShip(3, 4)).toStrictEqual(ship);
    });

    test('should return undefined if no ship is placed at coordinates', () => {
      const board = Gameboard(10, 10);
      const ship = { length: 2 };
      board.placeShip(
        [
          [3, 3],
          [3, 4],
        ],
        ship
      );

      expect(board.getShip(5, 5)).toBeUndefined();
      expect(board.getShip(5, 6)).toBeUndefined();
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
      expect(board.receiveAttack(0, 9)).toStrictEqual(ship);
      expect(ship.hit).toHaveBeenCalledTimes(1);
      expect(board.hitCount).toBe(1);
      expect(board.missCount).toBe(0);
      expect(board.fleetBoard[[0, 9]]).toBe(true);
    });

    test('should reduce shipCount when ship is sunk', () => {
      const board = Gameboard(10, 10);
      const ship = { length: 1, hit: jest.fn(), isSunk: jest.fn(() => true) };
      board.placeShip([[0, 2]], ship);

      expect(board.shipCount).toBe(1);
      board.receiveAttack(0, 2);
      expect(board.shipCount).toBe(0);
    });

    test('should register attack on empty field', () => {
      const board = Gameboard(10, 10);

      expect(board.hitCount).toBe(0);
      expect(board.missCount).toBe(0);
      expect(board.receiveAttack(2, 2)).toBe(false);
      expect(board.hitCount).toBe(0);
      expect(board.missCount).toBe(1);
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
      expect(board.receiveAttack(4, 4)).toStrictEqual(ship);
      expect(board.receiveAttack(4, 4)).toBe(true);
      expect(board.hitCount).toBe(1);
      expect(board.missCount).toBe(1);
      expect(board.fleetBoard[[5, 5]]).toBe(false);
      expect(board.fleetBoard[[4, 4]]).toBe(true);
    });

    test('should not register attacks out of range', () => {
      const board = Gameboard(10, 10);
      board.receiveAttack(-100, 15);

      expect(board.targetBoard[[-100, 15]]).toBeUndefined();
      expect(board.fleetBoard[[-100, 15]]).toBeUndefined();
    });
  });

  describe('#makeAttack', () => {
    test('should return ship if a ship was hit', () => {
      const board = Gameboard(10, 10);
      const opponentBoard = Gameboard(10, 10);
      const ship = { length: 2, hit: jest.fn(), isSunk: jest.fn() };
      opponentBoard.placeShip(
        [
          [5, 1],
          [4, 1],
        ],
        ship
      );

      expect(board.makeAttack(5, 1, opponentBoard)).toStrictEqual(ship);
      expect(board.makeAttack(4, 1, opponentBoard)).toStrictEqual(ship);
    });

    test('should return false if no ship was hit', () => {
      const board = Gameboard(10, 10);
      const opponentBoard = Gameboard(10, 10);
      const ship = { length: 2, hit: jest.fn(), isSunk: jest.fn() };
      opponentBoard.placeShip(
        [
          [8, 4],
          [8, 5],
        ],
        ship
      );

      expect(board.makeAttack(4, 8, opponentBoard)).toBe(false);
    });

    test(`should register attack on opponent's board`, () => {
      const board = Gameboard(10, 10);
      const opponentBoard = Gameboard(10, 10);
      jest.spyOn(opponentBoard, 'receiveAttack');
      board.makeAttack(0, 2, opponentBoard);

      expect(opponentBoard.receiveAttack).toHaveBeenCalledTimes(1);
      expect(opponentBoard.receiveAttack).toHaveBeenCalledWith(0, 2);
    });

    test('should register attack on target board', () => {
      const board = Gameboard(10, 10);
      const opponentBoard = Gameboard(10, 10);
      const ship = { length: 2, hit: jest.fn(), isSunk: jest.fn() };
      opponentBoard.placeShip(
        [
          [7, 7],
          [6, 7],
        ],
        ship
      );
      board.makeAttack(7, 7, opponentBoard);
      board.makeAttack(2, 2, opponentBoard);

      expect(board.targetBoard[[7, 7]]).toBe(true);
      expect(board.targetBoard[[2, 2]]).toBe(false);
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

  describe('#clear', () => {
    test('should clear the gameboard', () => {
      const board = Gameboard(10, 10);
      const ship = { length: 2, hit: jest.fn(), isSunk: jest.fn() };
      board.placeShip(
        [
          [2, 4],
          [2, 5],
        ],
        ship
      );
      board.receiveAttack(9, 7);
      board.receiveAttack(2, 5);

      expect(board.shipCount).toBe(1);
      expect(board.hitCount).toBe(1);
      expect(board.missCount).toBe(1);
      expect(Object.keys(board.fleetBoard).length).toBe(3);
      board.clear();
      expect(board.shipCount).toBe(0);
      expect(board.hitCount).toBe(0);
      expect(board.missCount).toBe(0);
      expect(Object.keys(board.fleetBoard).length).toBe(0);
    });
  });
});
