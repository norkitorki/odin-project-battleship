import './stylesheets/meyer-reset.css';
import './stylesheets/index.css';
import './stylesheets/gameboardDisplay.css';

import { Player } from '../lib/player';
import { Gameboard } from '../lib/gameboard';
import { Gamelog } from '../lib/gamelog';
import { Battleship } from '../lib/battleship';

const playerColor = (player) => {
  if (player === playerOne) return '#5cff5c';
  if (player === playerTwo) return '#ffff63';
  return '#ffffff';
};

const updateActivePlayer = (player, opponent, message) => {
  player.container.classList.remove('hidden');
  player.container.classList.add('activePlayer');
  opponent.container.classList.remove('activePlayer');
  opponent.container.classList.add('hidden');

  document.querySelector('.playerName').textContent = message || player.name;
  const playerColorElement = document.querySelector('.playerColor');
  playerColorElement.style.backgroundColor = playerColor(player);
};

const reset = () => {
  const playerContainers = gameContainer.querySelectorAll('.playerContainer');
  playerContainers.forEach((el) => {
    el.classList.remove('winningPlayer');
    el.remove();
  });

  gameContainer.appendChild(game.player.container);
  gameContainer.appendChild(game.opponent.container);

  updateActivePlayer(game.player, game.opponent);
  toggleLogContainer(false);

  game.resetGame().then(() => game.playGame());
};

const setActiveShipDirection = (direction) => {
  if (!game.gameInProgress) {
    game.shipPlacementDirection = direction;
    const hBtn = shipPlacementActions.querySelector('#horizontalPlacement');
    const vBtn = shipPlacementActions.querySelector('#verticalPlacement');

    if (direction === 'h') {
      hBtn.classList.add('activeDirection');
      vBtn.classList.remove('activeDirection');
    } else {
      vBtn.classList.add('activeDirection');
      hBtn.classList.remove('activeDirection');
    }
  }
};

const preShipPlacement = (player, opponent, ship) => {
  log.addMessage(`Now placing Ship of length: ${ship.length}`);
};

const placementError = (error) => {
  log.addMessage(error.message, false, 'red');
};

const preShipsPlacement = (player, opponent) => {
  updateActivePlayer(player, opponent);
  toggleFleetBoard(true);
  setActiveShipDirection('h');
  shipPlacementActions.classList.remove('hidden');
  log.clear();
  log.addMessage(
    `${player.name} please place your ships`,
    false,
    playerColor(player)
  );
};

const postShipsPlacement = () => {
  toggleFleetBoard(true);
  shipPlacementActions.classList.add('hidden');
  log.clear();
};

const preAttack = (player, opponent) => {
  updateActivePlayer(player, opponent);
};

const postAttack = (player, opponent, attack) => {
  const [row, col] = attack.coordinates;
  const attackResult = attack.attackResult;
  const field = `${String.fromCharCode(65 + row)}${col + 1}`;
  const attackType = attackResult ? 'Hit' : 'Miss';

  log.addMessage(
    `Attack from ${player.name} at ${field} resulted in ${attackType}`,
    true,
    playerColor(player)
  );

  if (typeof attackResult === 'object' && attackResult.isSunk()) {
    const remainingShips = opponent.gameboard.shipCount;
    const messageOne = `${player.name} has sunk ship of size ${attackResult.length}.`;
    const messageTwo = `${opponent.name} has ${remainingShips} remaining ships.`;

    log.addMessage(messageOne, false, '#00dada');
    log.addMessage(messageTwo, false, '#00dada');
  }

  if (!player.computerPlayer && !opponent.computerPlayer) {
    toggleFleetBoard(true);
  }
};

const postGame = (player, opponent) => {
  const message = `${player.name} has won the game!`;
  log.addMessage(message, false);
  toggleLogContainer(true);
  updateActivePlayer(player, opponent, message);

  fleetToggle.checked = false;

  gameContainer.querySelectorAll('.fleetBoard').forEach((el) => {
    el.classList.remove('hidden');
  });

  gameContainer.insertBefore(player.container, opponent.container);
  player.container.scrollIntoView({ behavior: 'smooth' });

  player.container.classList.add('winningPlayer');
  opponent.container.classList.remove('hidden');
};

const placementActions = (ev) => {
  const target = ev.target;
  const direction = target.dataset.direction;
  if (direction) {
    game.shipPlacementDirection = direction;
    setActiveShipDirection(direction);
  }
  if (target.id === 'randomPlacement') game.placeShipsRandomly();
};

const toggleComputer = () => {
  game.toggleComputer();
  reset();
};

const toggleComputerViaKey = () => {
  computerToggle.checked = !computerToggle.checked;
  toggleComputer();
};

const toggleVisibility = (toggle, element, forceVisibility) => {
  if (forceVisibility === true || forceVisibility === false) {
    toggle.checked = forceVisibility;
    forceVisibility
      ? element.classList.add('hidden')
      : element.classList.remove('hidden');
  } else toggle.checked = element.classList.toggle('hidden');
};

const toggleLogContainer = (forceVisibility) => {
  toggleVisibility(logToggle, logContainer, forceVisibility);
};

const toggleFleetBoard = (forceVisibility) => {
  const fleetBoard = document.querySelector('.activePlayer .fleetBoard');
  toggleVisibility(fleetToggle, fleetBoard, forceVisibility);
};

const resetButton = document.getElementById('resetGame');
const computerToggle = document.getElementById('computerPlay');
const logToggle = document.getElementById('hideLog');
const fleetToggle = document.getElementById('fleetToggle');

const shipPlacementActions = document.querySelector('.shipPlacementActions');
const logContainer = document.querySelector('.logContainer');
const gameContainer = document.querySelector('.gameContainer');

const playerOne = Player('Player One', Gameboard(10, 10));
const playerTwo = Player('Player Two', Gameboard(10, 10));
const computer = Player('Computer', Gameboard(10, 10), true);
const game = Battleship(playerOne, playerTwo, computer);
const log = Gamelog('gameLog');

log.renderLog(logContainer);

game.addCallback(preShipPlacement, 'preShipPlacement');
game.addCallback(placementError, 'placementError');
game.addCallback(preShipsPlacement, 'preShipsPlacement');
game.addCallback(postShipsPlacement, 'postShipsPlacement');
game.addCallback(preAttack, 'preAttack');
game.addCallback(postAttack, 'postAttack');
game.addCallback(postGame, 'postGame');

shipPlacementActions.addEventListener('click', placementActions);
resetButton.addEventListener('click', reset);
computerToggle.addEventListener('change', toggleComputer);
logToggle.addEventListener('change', toggleLogContainer);
fleetToggle.addEventListener('change', toggleFleetBoard);

game.addKeyboardCallback('KeyR', reset);
game.addKeyboardCallback('KeyC', toggleComputerViaKey);
game.addKeyboardCallback('KeyL', toggleLogContainer);
game.addKeyboardCallback('KeyF', toggleFleetBoard);
game.addKeyboardCallback('KeyH', () => setActiveShipDirection('h'));
game.addKeyboardCallback('KeyV', () => setActiveShipDirection('v'));

reset();
