export const Gameboard = (rows = 10, columns = 10) => {
  let shipId = 0;
  let ships = {};

  const obj = { rows, columns };

  const initializeBoard = () => {
    shipId = 0;
    ships = {};
    obj.targetBoard = {};
    obj.fleetBoard = {};
    obj.shipCount = 0;
    obj.hitCount = 0;
    obj.missCount = 0;
  };

  initializeBoard();

  const rangeValid = (r, c) => r >= 0 && r < rows && c >= 0 && c < columns;

  const adjacentPlacement = (coords, index, obj = { horizontal, vertical }) => {
    coords.sort();
    let [lastRow, lastCol] = coords[index - 1];
    let [row, col] = coords[index];

    let horizontalMatch =
      row === lastRow && (lastCol + 1 === col || lastCol - 1 === col);
    let verticalMatch =
      col === lastCol && (lastRow + 1 === row || lastRow - 1 === row);

    if (obj.horizontal || obj.vertical) {
      if (
        (obj.horizontal && horizontalMatch) ||
        (obj.vertical && verticalMatch)
      ) {
        return obj;
      } else {
        return false;
      }
    }

    obj.horizontal = horizontalMatch;
    obj.vertical = verticalMatch;

    return !obj.horizontal && !obj.vertical ? false : obj;
  };

  const placementValidation = (board, coordinates) => {
    let res, horizontal, vertical;
    coordinates.forEach((arr, index) => {
      if (index > 0) {
        res = adjacentPlacement(coordinates, index, { horizontal, vertical });
        if (!res) {
          throw new Error(
            'Coordinates must be vertically or horizontally adjacent'
          );
        }
        horizontal = res.horizontal;
        vertical = res.vertical;
      }

      if (board[arr]) {
        throw new Error('Ships cannot overlap each other');
      }
      if (!rangeValid(arr[0], arr[1])) {
        throw new Error('Coordinates are out of range');
      }
    });
  };

  obj.placeShip = (coords = [], ship = {}) => {
    placementValidation(obj.fleetBoard, coords);
    ships[++shipId] = ship;
    obj.shipCount++;
    coords.forEach((arr) => (obj.fleetBoard[arr] = shipId));
    return ship;
  };

  obj.getShip = (row, column) => {
    return ships[obj.fleetBoard[[row, column]]];
  };

  obj.receiveAttack = (row = 0, column = 0) => {
    if (!rangeValid(row, column)) return;

    const target = obj.fleetBoard[[row, column]];
    if (target) {
      const ship = ships[target];
      if (ship) {
        ship.hit();
        obj.hitCount++;
        if (ship.isSunk()) obj.shipCount--;
      }
      obj.fleetBoard[[row, column]] = true;
      return ship || true;
    } else {
      if (target === undefined) obj.missCount++;
      return (obj.fleetBoard[[row, column]] = false);
    }
  };

  obj.makeAttack = (row = 0, column = 0, opponentBoard) => {
    const result = opponentBoard.receiveAttack(row, column);

    obj.targetBoard[[row, column]] = result ? true : false;
    return result;
  };

  obj.allShipsSunk = () => {
    return obj.shipCount === 0;
  };

  obj.clear = () => {
    initializeBoard();
  };

  return obj;
};
