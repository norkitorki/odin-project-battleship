export const Gameboard = (rows = 10, columns = 10) => {
  let shipId = 0;

  const ships = {};
  const board = {};
  const obj = { rows, columns, shipCount: 0, hitCount: 0, missCount: 0 };

  const rangeValid = (r, c) => r >= 0 && r < rows && c >= 0 && c < columns;

  const placementValidation = (coords) => {
    coords.forEach((arr) => {
      if (board[arr]) {
        throw new Error('Field is already occupied');
      }
      if (!rangeValid(arr[0], arr[1])) {
        throw new Error('Coordinates are out of range');
      }
    });
  };

  obj.placeShip = (coords = [], ship = {}) => {
    placementValidation(coords);
    ships[++shipId] = ship;
    obj.shipCount++;
    coords.forEach((arr) => (board[arr] = shipId));
    return ship;
  };

  obj.at = (row = 0, column = 0) => {
    const field = board[[row, column]];
    return ships[field] || field;
  };

  obj.receiveAttack = (row = 0, column = 0) => {
    if (!rangeValid(row, column)) return;

    const target = board[[row, column]];
    if (target) {
      const ship = ships[target];
      if (ship) {
        ship.hit();
        obj.hitCount++;
        if (ship.isSunk()) obj.shipCount--;
      }
      board[[row, column]] = true;
      return ship || true;
    } else {
      if (target === undefined) obj.missCount++;
      return (board[[row, column]] = false);
    }
  };

  obj.allShipsSunk = () => {
    return obj.shipCount === 0;
  };

  return obj;
};
