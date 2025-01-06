import './stylesheets/meyer-reset.css';
import './stylesheets/index.css';
import './stylesheets/gameboardDisplay.css';

import { Player } from '../lib/player';
import { Gameboard } from '../lib/gameboard';
import { Ship } from '../lib/ship';
import { GameboardDisplay } from '../lib/gameboardDisplay';
import { Gamelog } from '../lib/gamelog';

const ROWS = 10;
const COLUMNS = 10;

const resetGameButton = document.getElementById('resetGame');
const computerToggle = document.getElementById('computerPlay');
const hideLogToggle = document.getElementById('hideLog');
const logContainer = document.querySelector('.logContainer');
const fleetToggleLabel = document.getElementById('fleetToggleLabel');
const fleetBoardToggle = document.getElementById('fleetToggle');
const shipPlacementActions = document.querySelector('.shipPlacementActions');
const randomPlacementButton = document.getElementById('randomPlacement');
const targetContainer = document.querySelector('.targetBoard');
const fleetContainer = document.querySelector('.fleetBoard');

const playerOne = Player('Player One', Gameboard(ROWS, COLUMNS));
const playerTwo = Player('Player Two', Gameboard(ROWS, COLUMNS));
const computer = Player('Computer', Gameboard(ROWS, COLUMNS), true);

const gameLog = Gamelog('gameLog');
gameLog.renderLog(logContainer);

let currentPlayer = playerOne;
let opponent = playerTwo;
let gameInProgress = false;
let userPlacement = {};
let shipPlacementDirection = 'h';
const lastUserPlacement = {};

const getBoardPeg = () => {
  const template = document.getElementById('pegTemplate');
  if (template && template.nodeName === 'TEMPLATE') {
    return template.content.cloneNode(true);
  }
};

const playerColor = () => {
  if (currentPlayer === playerOne) return '#5cff5c';
  if (currentPlayer === playerTwo) return '#ffff63';
  return '#ffffff';
};

const toggleLogVisibility = (event) => {
  if (!event) hideLogToggle.checked = !hideLogToggle.checked;
  logContainer.classList.toggle('hidden');
};

const updatePlayerName = (message) => {
  document.querySelector('.playerName').textContent = message;
  document.querySelector('.playerColor').style.backgroundColor = playerColor();
};

const randomShipPlacement = () => {
  userPlacement.ships.splice(0, currentPlayer.gameboard.shipCount);
  userPlacement.ships.forEach((s) => currentPlayer.randomShipPlacement(s));
  gameLog.clear();
  userPlacement.resolve(currentPlayer);
};

const setActiveShipDirection = (activeButton, inactiveButton) => {
  activeButton.classList.add('activeDirection');
  inactiveButton.classList.remove('activeDirection');
};

const toggleShipPlacementDirection = (direction) => {
  const horizontalBtn = document.getElementById('horizontalPlacement');
  const verticalBtn = document.getElementById('verticalPlacement');
  shipPlacementDirection = direction;

  if (direction === 'h') setActiveShipDirection(horizontalBtn, verticalBtn);
  if (direction === 'v') setActiveShipDirection(verticalBtn, horizontalBtn);
};

const setShipDirection = (event) => {
  toggleShipPlacementDirection(event.target.dataset['direction'] || 'h');
};

const shipPlacementMessage = (ship) => {
  gameLog.addMessage(`Now placing Ship of length: ${ship.length}`, false);
};

const displayShips = (display, coordinates) => {
  coordinates.forEach((arr) => {
    const [row, col] = arr;
    display.updateField(row, col, getBoardPeg(), 'whitePeg');
  });
};

const userShipPlacement = () => {
  const display = GameboardDisplay(ROWS, COLUMNS);
  const ships = userPlacement.ships;

  let coordinates = [];
  let shipIndex = 0;
  let ship = ships[shipIndex];

  const predictedShipPlacement = (row, col) => {
    coordinates = [];
    display.removeHighlights();

    for (let i = 0; i < ship.length; i++) {
      let coords =
        shipPlacementDirection === 'h' ? [row, col + i] : [row + i, col];
      display.highlightField.apply(null, coords);
      coordinates.push(coords);
    }
  };

  toggleShipPlacementDirection('h');
  updatePlayerName(currentPlayer.name);
  gameLog.addMessage(`${currentPlayer.name} please place your ships`, false);
  shipPlacementMessage(ship);

  display.addCallback('mouseover', 'showPlacement', predictedShipPlacement);
  display.addCallback('focusin', 'showPlacement', predictedShipPlacement);
  display.addCallback('click', 'place', () => {
    try {
      currentPlayer.gameboard.placeShip(coordinates, ship);
      displayShips(display, coordinates);
      ship = ships[++shipIndex];
      if (shipIndex >= ships.length) {
        gameLog.clear();
        userPlacement.resolve(currentPlayer.gameboard.shipPlacements);
      } else {
        coordinates = [];
        shipPlacementMessage(ship);
      }
    } catch (error) {
      gameLog.addMessage(error.message, false, 'red');
    }
  });

  display.renderBoard(targetContainer);
};

const placeShips = () => {
  const ships = [2, 3, 3, 4, 5].map((n) => Ship(n));

  return new Promise((resolve, _) => {
    userPlacement = { ships, resolve };
    if (currentPlayer.computerPlayer) {
      randomShipPlacement();
    } else {
      userShipPlacement();
    }
  });
};

const updateDisplay = (board, callback) => {
  Object.keys(board).forEach((coordinates) => {
    const [row, col] = coordinates.split(',');
    callback.call(null, row, col, board[[row, col]]);
  });
};

const setupDisplays = (hideTarget = false, hideFleet = false) => {
  const displays = {};

  if (!hideTarget) {
    const targetBoard = currentPlayer.gameboard.targetBoard;
    displays.target = GameboardDisplay(ROWS, COLUMNS);

    updateDisplay(targetBoard, (row, col, value) => {
      const c = { true: 'whitePeg', false: 'redPeg', sunk: 'cyanPeg' }[value];
      displays.target.updateField(row, col, getBoardPeg(), c);
    });

    displays.target.renderBoard(targetContainer);

    if (lastUserPlacement[currentPlayer.name]) {
      const [row, col] = lastUserPlacement[currentPlayer.name];
      targetContainer.querySelector(`[data-field="${row}${col}"]`).focus();
    }
  }

  if (!hideFleet) {
    const fleetBoard = currentPlayer.gameboard.fleetBoard;
    displays.fleet = GameboardDisplay(ROWS, COLUMNS);

    updateDisplay(fleetBoard, (row, col, value) => {
      const c = value === true ? 'redPeg' : value !== false ? 'whitePeg' : '';
      displays.fleet.updateField(row, col, getBoardPeg(), c);
    });

    fleetContainer.classList.remove('hidden');
    displays.fleet.renderBoard(fleetContainer);
  } else {
    fleetBoardToggle.checked = true;
    fleetContainer.classList.add('hidden');
  }

  updatePlayerName(currentPlayer.name);

  return displays;
};

const userAttack = (display) => {
  return new Promise((resolve, _) => {
    display.addCallback('click', 'userAttack', (row, col) => {
      if (currentPlayer.gameboard.targetBoard[[row, col]] === undefined) {
        const attackResult = currentPlayer.attack(opponent, row, col);
        display.removeCallback('click', 'userAttack');
        lastUserPlacement[currentPlayer.name] = [row, col];
        resolve({ coordinates: [row, col], attackResult });
      }
    });
  });
};

const logAttackMessage = (coordinates, attackResult) => {
  const [row, col] = coordinates;
  const field = `${String.fromCharCode(65 + row)}${col + 1}`;
  const attackType = attackResult ? 'Hit' : 'Miss';

  gameLog.addMessage(
    `Attack from ${currentPlayer.name} at ${field} resulted in ${attackType}`,
    true,
    playerColor()
  );
};

const shipSunkMessage = (ship, remainingShipCount) => {
  const messageOne = `${currentPlayer.name} has sunk ship of size ${ship.length}.`;
  const messageTwo = `${opponent.name} has ${remainingShipCount} remaining ships.`;

  gameLog.addMessage(messageOne, false, '#00dada');
  gameLog.addMessage(messageTwo, false);
};

const markShipAsSunk = (coordinates) => {
  const fields = opponent.gameboard.shipPlacements.find((arr) => {
    return arr.find((c) => c.join() === coordinates.join());
  });
  fields.forEach((arr) => (currentPlayer.gameboard.targetBoard[arr] = 'sunk'));
};

const endGame = () => {
  fleetToggleLabel.classList.add('hidden');
  gameLog.addMessage(`${currentPlayer.name} has won!`, false, playerColor());

  swapPlayers();
  setupDisplays();

  updatePlayerName(`${currentPlayer.name} has lost the game`);

  const gameContainer = document.querySelector('.gameContainer');
  const clone = gameContainer.cloneNode(true);
  clone.classList.value = 'opponentContainer';
  clone.querySelector('.logContainer').remove();
  gameContainer.after(clone);

  swapPlayers();
  setupDisplays();

  updatePlayerName(`${currentPlayer.name} has won the game`);

  return (gameInProgress = false);
};

const playRound = async () => {
  if (gameInProgress) {
    let attack;
    if (currentPlayer.computerPlayer) {
      attack = currentPlayer.attack(opponent);
    } else {
      const displays = setupDisplays(false, fleetBoardToggle.checked);
      attack = await userAttack(displays.target);
    }

    logAttackMessage(attack.coordinates, attack.attackResult);

    if (attack.attackResult) {
      const ship = attack.attackResult;
      if (ship.isSunk()) {
        const shipCount = opponent.gameboard.shipCount;
        shipSunkMessage(ship, shipCount);
        markShipAsSunk(attack.coordinates);
        if (shipCount === 0) return endGame();
      }
    }

    if (!currentPlayer.computerPlayer && !opponent.computerPlayer) {
      fleetBoardToggle.checked = true;
    }

    swapPlayers();
    return playRound();
  }
};

const swapPlayers = () => {
  [currentPlayer, opponent] = [opponent, currentPlayer];
};

const setupGame = async () => {
  setupDisplays(false, true);
  gameLog.clear();

  const opponentContainer = document.querySelector('.opponentContainer');
  if (opponentContainer) opponentContainer.remove();

  currentPlayer = playerOne;
  opponent = computerToggle.checked ? computer : playerTwo;
  if (opponent === computer) opponent.reset();
  [currentPlayer, opponent].forEach((player) => player.gameboard.clear());

  gameInProgress = false;
  fleetToggleLabel.classList.add('hidden');
  fleetBoardToggle.checked = true;
  shipPlacementActions.classList.remove('hidden');

  (await placeShips()) && swapPlayers();
  (await placeShips()) && swapPlayers();

  fleetToggleLabel.classList.remove('hidden');
  shipPlacementActions.classList.add('hidden');
  gameInProgress = true;

  playRound();
};

window.addEventListener('keydown', (keyEvent) => {
  if (gameInProgress) {
    if (keyEvent.code === 'KeyF') {
      fleetBoardToggle.checked = !fleetBoardToggle.checked;
      playRound();
    }
  } else {
    if (keyEvent.code === 'KeyH') toggleShipPlacementDirection('h');
    if (keyEvent.code === 'KeyV') toggleShipPlacementDirection('v');
  }

  if (keyEvent.code === 'KeyC') {
    computerToggle.checked = !computerToggle.checked;
    setupGame();
  }
  if (keyEvent.code === 'KeyL') toggleLogVisibility();
  if (keyEvent.code === 'KeyR') setupGame();
});

resetGameButton.addEventListener('click', setupGame);
computerToggle.addEventListener('change', setupGame);
hideLogToggle.addEventListener('change', toggleLogVisibility);
fleetBoardToggle.addEventListener('change', playRound);
randomPlacementButton.addEventListener('click', randomShipPlacement);
shipPlacementActions.addEventListener('click', setShipDirection);

setupGame();
