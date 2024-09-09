import { Ship } from '../lib/ship';

describe('Ship', () => {
  test('should be a function', () => {
    expect(Ship).toEqual(expect.any(Function));
  });

  const newShip = Ship(2);

  test('should have a length property', () => {
    expect(newShip.length).toBe(2);
  });

  test('should have a hits property', () => {
    expect(newShip.hits).toBe(0);
  });

  describe('#hit', () => {
    test('should increase hits property by 1', () => {
      expect(newShip.hits).toBe(0);
      newShip.hit();
      expect(newShip.hits).toBe(1);
    });
  });

  describe('#isSunk', () => {
    test('should return false when ship is not sunk', () => {
      expect(newShip.hits).toBe(1);
      expect(newShip.isSunk()).toBeFalsy();
    });

    test('should return true when ship is sunk', () => {
      newShip.hit();
      expect(newShip.hits).toBe(2);
      expect(newShip.isSunk()).toBeTruthy();
    });
  });
});
