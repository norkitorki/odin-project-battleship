import { GameboardDisplay } from './gameboardDisplay';
import { Ship } from './ship';

export const Battleship = (player, opponent, computer) => {
  const obj = { player, opponent, computer };

  obj.gameInProgress = false;
  obj.shipPlacementDirection = 'h';

  const callbacks = {
    keyboard: {},
    placementError: [],
    preReset: [],
    preShipPlacement: [],
    preShipsPlacement: [],
    postShipsPlacement: [],
    preAttack: [],
    postAttack: [],
    preGame: [],
    postGame: [],
  };

  const lastPlayerCoordinates = {};

  let inactivePlayer = player;
  let inactiveOpponent = opponent;
  let playerPlacement = {};
  let computerInPlay = false;

  window.addEventListener('keydown', (ev) => {
    const events = callbacks.keyboard[ev.code];
    if (events) events.forEach((cb) => cb.call(null));
  });

  const createBoardContainer = () => {
    const gameContainer = document.createElement('div');
    const targetHeader = document.createElement('h2');
    const targetContainer = document.createElement('div');
    const fleetHeader = document.createElement('h2');
    const fleetContainer = document.createElement('div');

    targetHeader.textContent = 'Target Board';
    fleetHeader.textContent = 'Fleet Board';

    gameContainer.classList.add('playerContainer');
    targetContainer.classList.add('targetBoard');
    fleetContainer.classList.add('fleetBoard');

    [
      [targetHeader, targetContainer],
      [fleetHeader, fleetContainer],
    ].forEach((arr) => {
      const [header, container] = arr;
      header.classList.add('boardHeader');
      const wrapper = document.createElement('section');
      wrapper.appendChild(header);
      wrapper.appendChild(container);
      gameContainer.appendChild(wrapper);
    });

    return gameContainer;
  };

  const createPlayerComponents = () => {
    const players = [player, opponent];
    if (computer) players.push(computer);

    players.forEach((p) => {
      p.targetDisplay = GameboardDisplay(10, 10);
      p.fleetDisplay = GameboardDisplay(10, 10);

      p.container = createBoardContainer();
      p.targetDisplay.renderBoard(p.container.querySelector('.targetBoard'));
      p.fleetDisplay.renderBoard(p.container.querySelector('.fleetBoard'));
    });
  };

  const callCallbacks = (eventType, callbackArgs = []) => {
    if (callbacks[eventType])
      callbacks[eventType].forEach((cb) => cb.apply(null, callbackArgs));
  };

  const clearBoards = (gamePlayer) => {
    gamePlayer.gameboard.clear();
    [gamePlayer.targetDisplay, gamePlayer.fleetDisplay].forEach((display) => {
      display.clear(true);
    });
  };

  const displayPlacedShips = (gamePlayer, coordinates, random = false) => {
    const targetDisplay = gamePlayer.targetDisplay;
    const fleetDisplay = gamePlayer.fleetDisplay;
    let displays = [targetDisplay, fleetDisplay];
    if (random) displays = [fleetDisplay];

    coordinates.forEach((arr) => {
      const [row, col] = arr;
      displays.forEach((display) => {
        display.updateField(row, col, 'pegTemplate', 'whitePeg');
      });
    });
  };

  const postShipsPlacement = (gamePlayer, opponentPlayer) => {
    if (!gamePlayer.computerPlayer) gamePlayer.targetDisplay.clear(true);
    callCallbacks('postShipsPlacement', [gamePlayer, opponentPlayer]);
    playerPlacement.resolve();
  };

  const randomShipPlacement = (gamePlayer, opponentPlayer) => {
    playerPlacement.ships.splice(0, gamePlayer.gameboard.shipCount);
    playerPlacement.ships.forEach((ship) => {
      const coordinates = gamePlayer.randomShipPlacement(ship);
      displayPlacedShips(gamePlayer, coordinates, true);
    });
    return postShipsPlacement(gamePlayer, opponentPlayer);
  };

  const playerShipPlacement = (gamePlayer, opponentPlayer) => {
    callCallbacks('preShipsPlacement', [gamePlayer, opponentPlayer]);

    const ships = [2, 3, 3, 4, 5].map((n) => Ship(n));
    const display = gamePlayer.targetDisplay;

    let coordinates = [];
    let shipIndex = 0;
    let ship = ships[shipIndex];

    const predictShipPlacement = (row, col) => {
      coordinates = [];
      display.removeHighlights();

      for (let i = 0; i < ship.length; i++) {
        let coords =
          obj.shipPlacementDirection === 'h' ? [row, col + i] : [row + i, col];
        display.highlightField.apply(null, coords);
        coordinates.push(coords);
      }
    };

    callCallbacks('preShipPlacement', [player, opponent, ship]);

    return new Promise((resolve) => {
      playerPlacement = { player: gamePlayer, ships, resolve };

      if (gamePlayer.computerPlayer) {
        return randomShipPlacement(gamePlayer, opponentPlayer);
      } else {
        display.addCallback('mouseover', 'showPlacement', predictShipPlacement);
        display.addCallback('focusin', 'showPlacement', predictShipPlacement);
        display.addCallback('click', 'placeShip', () => {
          try {
            gamePlayer.gameboard.placeShip(coordinates, ship);
            displayPlacedShips(gamePlayer, coordinates);
            ship = ships[++shipIndex];
            if (shipIndex >= ships.length) {
              return postShipsPlacement(gamePlayer, opponentPlayer);
            } else {
              coordinates = [];
              callCallbacks('preShipPlacement', [player, opponent, ship]);
            }
          } catch (error) {
            callCallbacks('placementError', [error]);
            console.error(error.message);
          }
        });
      }
    });
  };

  const focusLastField = (gamePlayer) => {
    const field = lastPlayerCoordinates[gamePlayer.name];
    const targetBoard = gamePlayer.container.querySelector('.targetBoard');
    if (field && targetBoard)
      targetBoard.querySelector(`[data-field="${field}"]`).focus();
  };

  const playerAttack = () => {
    return new Promise((resolve, _) => {
      if (player.computerPlayer) {
        resolve(player.attack(opponent));
      } else {
        const targetDisplay = player.targetDisplay;
        focusLastField(player, targetDisplay);

        targetDisplay.addCallback('click', 'userAttack', (row, col) => {
          if (player.gameboard.targetBoard[[row, col]] === undefined) {
            const attackResult = player.attack(opponent, row, col);
            lastPlayerCoordinates[player.name] = `${row}${col}`;
            targetDisplay.removeCallback('click', 'userAttack');
            resolve({ coordinates: [row, col], attackResult });
          }
        });
      }
    });
  };

  const updateField = (display, coordinates, pegClazz) => {
    const [row, col] = coordinates;
    if (pegClazz) display.updateField(row, col, 'pegTemplate', pegClazz);
  };

  const updateSunkenShip = (coordinates) => {
    const fields = opponent.gameboard.shipPlacements.find((arr) => {
      return arr.find((c) => c.join() === coordinates.join());
    });
    fields.forEach((arr) => updateField(player.targetDisplay, arr, 'cyanPeg'));
  };

  const updateDisplays = (attack) => {
    const attackResult = attack.attackResult;

    if (typeof attackResult === 'object' && attackResult.isSunk()) {
      updateSunkenShip(attack.coordinates);
    } else {
      const targetPeg = attackResult ? 'whitePeg' : 'redPeg';
      updateField(player.targetDisplay, attack.coordinates, targetPeg);
    }

    const fleetPeg = attackResult ? 'redPeg' : null;
    updateField(opponent.fleetDisplay, attack.coordinates, fleetPeg);
  };

  const endGame = () => {
    obj.gameInProgress = false;
    callCallbacks('postGame', [player, opponent]);
    return player;
  };

  const swapPlayers = () => {
    [player, opponent] = [opponent, player];
    [obj.player, obj.opponent] = [obj.opponent, obj.player];
  };

  obj.addCallback = (callback, ...eventTypes) => {
    eventTypes.forEach((type) => {
      if (callbacks[type]) callbacks[type].push(callback);
    });
  };

  obj.addKeyboardCallback = (keyCode, callback) => {
    const events = callbacks.keyboard[keyCode];
    events ? events.push(callback) : (callbacks.keyboard[keyCode] = [callback]);
  };

  obj.toggleComputer = () => {
    if (computerInPlay) {
      [player, opponent] = [inactivePlayer, inactiveOpponent];
      computerInPlay = false;
    } else {
      [player, opponent] = [inactivePlayer, computer];
      computerInPlay = true;
    }
    [obj.player, obj.opponent] = [player, opponent];
  };

  obj.resetGame = () => {
    callCallbacks('preReset', [player, opponent]);
    obj.gameInProgress = false;
    if (computer) computer.reset();

    [player, opponent].forEach((p) => clearBoards(p));

    return new Promise(async (resolve) => {
      await playerShipPlacement(player, opponent);
      await playerShipPlacement(opponent, player);

      obj.gameInProgress = true;
      playerPlacement = {};
      resolve();
    });
  };

  obj.placeShipsRandomly = () => {
    if (playerPlacement.player) randomShipPlacement(playerPlacement.player);
  };

  obj.play = async () => {
    if (obj.gameInProgress) {
      callCallbacks('preAttack', [player, opponent]);

      const attack = await playerAttack();
      updateDisplays(attack);
      callCallbacks('postAttack', [player, opponent, attack]);

      if (opponent.gameboard.shipCount <= 0) return endGame();

      swapPlayers();
    } else {
      return null;
    }
  };

  obj.playGame = async () => {
    return (await obj.play()) || obj.playGame();
  };

  createPlayerComponents();

  return obj;
};
