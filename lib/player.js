export const Player = (
  name = '',
  gameboard = {},
  targetDisplay = {},
  fleetDisplay = {},
  options = { computerPlayer: false }
) => {
  const obj = { name, gameboard, targetDisplay, fleetDisplay };

  obj.computerPlayer = options.computerPlayer;

  obj.attack = (opponent, row, col) => {
    return gameboard.makeAttack(row, col, opponent.gameboard);
  };

  if (options.computerPlayer) {
    const previousAttacks = {};
    const nextAttacks = [];
    const attackOptions = [];

    for (let i = 0; i < gameboard.rows; i++) {
      for (let y = 0; y < gameboard.columns; y++) attackOptions.push([i, y]);
    }

    const randomIndex = (array) => {
      return Math.floor(Math.random() * array.length);
    };

    const validCoordinates = (arr) => {
      const [row, col] = arr;

      return (
        row >= 0 &&
        row < gameboard.rows &&
        col >= 0 &&
        col < gameboard.columns &&
        !previousAttacks[arr] &&
        !nextAttacks.some((c) => c[0] === row && c[1] === col)
      );
    };

    const targetedAttack = (coordinates) => {
      const [row, col] = coordinates;
      const options = [
        [row + 1, col],
        [row - 1, col],
        [row, col + 1],
        [row, col - 1],
      ];

      options.forEach((a) => {
        if (validCoordinates(a)) {
          nextAttacks.push(a);
          const idx = attackOptions.findIndex(
            (b) => b[0] === a[0] && b[1] === a[1]
          );
          attackOptions.splice(idx, 1);
        }
      });
    };

    obj.attack = (opponent) => {
      const options = nextAttacks.length > 0 ? nextAttacks : attackOptions;

      const index = randomIndex(options);
      const coordinates = options[index];
      options.splice(index, 1);
      const [row, col] = coordinates;

      const attackResult = gameboard.makeAttack(row, col, opponent.gameboard);
      previousAttacks[coordinates] = true;
      if (attackResult) targetedAttack(coordinates);

      return coordinates;
    };

    const randomCoordinates = (length) => {
      const row = Math.floor(Math.random() * gameboard.rows);
      const col = Math.floor(Math.random() * gameboard.columns);
      const index = Math.floor(Math.random() * 2);
      const coordinates = [];

      for (let i = 0; i < length; i++) {
        coordinates.push(index < 1 ? [row + i, col] : [row, col + i]);
      }

      return coordinates;
    };

    obj.placeShip = (ship = {}) => {
      const coordinates = randomCoordinates(ship.length);

      try {
        gameboard.placeShip(coordinates, ship);
        return coordinates;
      } catch (error) {
        return obj.placeShip(ship);
      }
    };
  }

  return obj;
};
