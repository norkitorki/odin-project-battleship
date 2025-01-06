/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./lib/gameboard.js":
/*!**************************!*\
  !*** ./lib/gameboard.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Gameboard: () => (/* binding */ Gameboard)\n/* harmony export */ });\nconst Gameboard = (rows = 10, columns = 10) => {\n  let shipId = 0;\n  let ships = {};\n\n  const obj = { rows, columns };\n\n  const initializeBoard = () => {\n    shipId = 0;\n    ships = {};\n    obj.targetBoard = {};\n    obj.fleetBoard = {};\n    obj.shipPlacements = [];\n    obj.shipCount = 0;\n    obj.hitCount = 0;\n    obj.missCount = 0;\n  };\n\n  initializeBoard();\n\n  const rangeValid = (r, c) => r >= 0 && r < rows && c >= 0 && c < columns;\n\n  const adjacentPlacement = (coords, index, obj = { horizontal, vertical }) => {\n    coords.sort();\n    let [lastRow, lastCol] = coords[index - 1];\n    let [row, col] = coords[index];\n\n    let horizontalMatch =\n      row === lastRow && (lastCol + 1 === col || lastCol - 1 === col);\n    let verticalMatch =\n      col === lastCol && (lastRow + 1 === row || lastRow - 1 === row);\n\n    if (obj.horizontal || obj.vertical) {\n      if (\n        (obj.horizontal && horizontalMatch) ||\n        (obj.vertical && verticalMatch)\n      ) {\n        return obj;\n      } else {\n        return false;\n      }\n    }\n\n    obj.horizontal = horizontalMatch;\n    obj.vertical = verticalMatch;\n\n    return !obj.horizontal && !obj.vertical ? false : obj;\n  };\n\n  const placementValidation = (board, coordinates) => {\n    if (coordinates.length === 0) {\n      throw new Error('Coordinates cannot be empty');\n    }\n\n    let res, horizontal, vertical;\n    coordinates.forEach((arr, index) => {\n      if (index > 0) {\n        res = adjacentPlacement(coordinates, index, { horizontal, vertical });\n        if (!res) {\n          throw new Error(\n            'Coordinates must be vertically or horizontally adjacent'\n          );\n        }\n        horizontal = res.horizontal;\n        vertical = res.vertical;\n      }\n\n      if (board[arr]) {\n        throw new Error('Ships cannot overlap each other');\n      }\n      if (!rangeValid(arr[0], arr[1])) {\n        throw new Error('Coordinates are out of range');\n      }\n    });\n  };\n\n  obj.placeShip = (coords = [], ship = {}) => {\n    placementValidation(obj.fleetBoard, coords);\n    ships[++shipId] = ship;\n    obj.shipPlacements.push(coords);\n    obj.shipCount++;\n    coords.forEach((arr) => (obj.fleetBoard[arr] = shipId));\n    return ship;\n  };\n\n  obj.getShip = (row, column) => {\n    return ships[obj.fleetBoard[[row, column]]];\n  };\n\n  obj.receiveAttack = (row = 0, column = 0) => {\n    if (!rangeValid(row, column)) return;\n\n    const target = obj.fleetBoard[[row, column]];\n    if (target) {\n      const ship = ships[target];\n      if (ship) {\n        ship.hit();\n        obj.hitCount++;\n        if (ship.isSunk()) obj.shipCount--;\n      }\n      obj.fleetBoard[[row, column]] = true;\n      return ship || true;\n    } else {\n      if (target === undefined) obj.missCount++;\n      return (obj.fleetBoard[[row, column]] = false);\n    }\n  };\n\n  obj.makeAttack = (row = 0, column = 0, opponentBoard) => {\n    const result = opponentBoard.receiveAttack(row, column);\n\n    obj.targetBoard[[row, column]] = result ? true : false;\n    return result;\n  };\n\n  obj.allShipsSunk = () => {\n    return obj.shipCount === 0;\n  };\n\n  obj.clear = () => {\n    initializeBoard();\n  };\n\n  return obj;\n};\n\n\n//# sourceURL=webpack://odin-project-project-battleship/./lib/gameboard.js?");

/***/ }),

/***/ "./lib/gameboardDisplay.js":
/*!*********************************!*\
  !*** ./lib/gameboardDisplay.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GameboardDisplay: () => (/* binding */ GameboardDisplay)\n/* harmony export */ });\nconst GameboardDisplay = (\n  rows,\n  columns,\n  options = { keyboardTraverse: true }\n) => {\n  const obj = { locked: false };\n  const callbacks = {};\n\n  const container = document.createElement('div');\n  container.classList.value = 'gameboard';\n  container.style.gridTemplate = `repeat(${rows + 1}, 1fr) / repeat(${\n    columns + 1\n  }, 1fr)`;\n\n  if (options.keyboardTraverse) {\n    container.addEventListener('keydown', (e) => {\n      const key = e.code;\n      if (key.startsWith('Arrow') || key.startsWith('Key')) {\n        const field = document.activeElement;\n        if (field.nodeName === 'BUTTON' && field.parentElement === container) {\n          e.preventDefault();\n          let row = Number(field.dataset.field[0]);\n          let col = Number(field.dataset.field[1]);\n          if (key === 'ArrowUp' || key === 'KeyW') row--;\n          if (key === 'ArrowDown' || key === 'KeyS') row++;\n          if (key === 'ArrowLeft' || key === 'KeyA') col--;\n          if (key === 'ArrowRight' || key === 'KeyD') col++;\n\n          if (row >= 0 && row < rows && col >= 0 && col < columns) {\n            container.querySelector(`[data-field=\"${row}${col}\"]`).focus();\n          }\n        }\n      }\n    });\n  }\n\n  const appendElement = (type, callback) => {\n    const element = document.createElement(type);\n    callback(element);\n    container.appendChild(element);\n  };\n\n  const colNumber = (col) => (el) => (el.textContent = col < 1 ? '' : col);\n  const rowLetter = (row) => (el) =>\n    (el.textContent = String.fromCharCode(65 + (row % 26)));\n  const btnField = (row, col) => (el) => (el.dataset['field'] = `${row}${col}`);\n\n  const getField = (row, column) => {\n    return container.querySelector(`[data-field=\"${row}${column}\"]`);\n  };\n\n  for (let col = 0; col <= columns; col++) {\n    appendElement('span', colNumber(col));\n  }\n\n  for (let row = 0; row < rows; row++) {\n    appendElement('span', rowLetter(row));\n    for (let col = 0; col < columns; col++) {\n      appendElement('button', btnField(row, col));\n    }\n  }\n\n  obj.renderBoard = (parent = document.body, replaceExisting = true) => {\n    const previous = parent.querySelector('.gameboard');\n    if (previous && replaceExisting) previous.remove();\n    parent.appendChild(container);\n  };\n\n  obj.addCallback = (eventType, identifier, callback) => {\n    if (!callbacks[eventType]) callbacks[eventType] = {};\n\n    callbacks[eventType][identifier] = (e) => {\n      const target = e.target;\n      if (!obj.locked && target.nodeName === 'BUTTON') {\n        const [row, col] = target.dataset.field;\n        callback.call(null, Number(row), Number(col));\n      }\n    };\n\n    container.addEventListener(eventType, callbacks[eventType][identifier]);\n  };\n\n  obj.removeCallback = (eventType, identifier) => {\n    container.removeEventListener(eventType, callbacks[eventType][identifier]);\n    delete callbacks[eventType][identifier];\n  };\n\n  obj.updateField = (row, column, symbol, clazz = '') => {\n    const field = getField(row, column);\n    if (field && symbol) {\n      Array.from(field.children).forEach((el) => field.removeChild(el));\n      field.setAttribute('class', clazz);\n      return field.appendChild(symbol);\n    }\n  };\n\n  obj.highlightField = (row, column) => {\n    const field = getField(row, column);\n    if (field) field.classList.toggle('highlighted');\n  };\n\n  obj.removeHighlights = () => {\n    const fields = container.querySelectorAll('.highlighted');\n    fields.forEach((field) => field.classList.remove('highlighted'));\n  };\n\n  obj.hide = () => {\n    container.style.display = 'none';\n  };\n\n  obj.unhide = () => {\n    container.style.display = '';\n  };\n\n  return obj;\n};\n\n\n//# sourceURL=webpack://odin-project-project-battleship/./lib/gameboardDisplay.js?");

/***/ }),

/***/ "./lib/gamelog.js":
/*!************************!*\
  !*** ./lib/gamelog.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Gamelog: () => (/* binding */ Gamelog)\n/* harmony export */ });\nconst Gamelog = (clazz = '') => {\n  const obj = {};\n  const container = document.createElement('ul');\n  container.classList.value = clazz;\n\n  let messageCount = 0;\n\n  obj.renderLog = (parentElement = document.body) => {\n    parentElement.appendChild(container);\n  };\n\n  obj.addMessage = (message, numbered = true, color = '') => {\n    const li = document.createElement('li');\n    li.textContent = `${numbered ? `${++messageCount}. ` : ''}${message}`;\n    li.style.color = color;\n    container.prepend(li);\n  };\n\n  obj.clear = () => {\n    Array.from(container.children).forEach((el) => container.removeChild(el));\n    messageCount = 0;\n  };\n\n  return obj;\n};\n\n\n//# sourceURL=webpack://odin-project-project-battleship/./lib/gamelog.js?");

/***/ }),

/***/ "./lib/player.js":
/*!***********************!*\
  !*** ./lib/player.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Player: () => (/* binding */ Player)\n/* harmony export */ });\nconst Player = (name = '', gameboard = {}, computerPlayer = false) => {\n  const obj = { name, gameboard, computerPlayer };\n\n  const randomCoordinates = (length) => {\n    const row = Math.floor(Math.random() * gameboard.rows);\n    const col = Math.floor(Math.random() * gameboard.columns);\n    const index = Math.floor(Math.random() * 100);\n    const coordinates = [];\n\n    for (let i = 0; i < length; i++) {\n      coordinates.push(index < 50 ? [row + i, col] : [row, col + i]);\n    }\n\n    return coordinates;\n  };\n\n  obj.attack = (opponent, row, col) => {\n    return gameboard.makeAttack(row, col, opponent.gameboard);\n  };\n\n  obj.randomShipPlacement = (ship) => {\n    const coordinates = randomCoordinates(ship.length);\n\n    try {\n      gameboard.placeShip(coordinates, ship);\n      return coordinates;\n    } catch (error) {\n      return obj.randomShipPlacement(ship);\n    }\n  };\n\n  if (computerPlayer) {\n    let previousAttacks, nextAttacks, attackOptions;\n\n    obj.reset = () => {\n      previousAttacks = {};\n      nextAttacks = [];\n      attackOptions = [];\n\n      for (let i = 0; i < gameboard.rows; i++) {\n        for (let y = 0; y < gameboard.columns; y++) attackOptions.push([i, y]);\n      }\n    };\n\n    obj.reset();\n\n    const randomIndex = (arr) => {\n      return Math.floor(Math.random() * arr.length);\n    };\n\n    const validCoordinates = (arr) => {\n      const [row, col] = arr;\n\n      return (\n        row >= 0 &&\n        row < gameboard.rows &&\n        col >= 0 &&\n        col < gameboard.columns &&\n        !previousAttacks[arr] &&\n        !nextAttacks.some((c) => c[0] === row && c[1] === col)\n      );\n    };\n\n    const targetedAttack = (coordinates) => {\n      const [row, col] = coordinates;\n      const options = [\n        [row + 1, col],\n        [row - 1, col],\n        [row, col + 1],\n        [row, col - 1],\n      ];\n\n      options.forEach((a) => {\n        if (validCoordinates(a)) {\n          nextAttacks.push(a);\n          const idx = attackOptions.findIndex(\n            (b) => b[0] === a[0] && b[1] === a[1]\n          );\n          attackOptions.splice(idx, 1);\n        }\n      });\n    };\n\n    obj.attack = (opponent) => {\n      const options = nextAttacks.length > 0 ? nextAttacks : attackOptions;\n      if (options.length === 0) return null;\n\n      const index = randomIndex(options);\n      const coordinates = options[index];\n      options.splice(index, 1);\n      const [row, col] = coordinates;\n\n      const attackResult = gameboard.makeAttack(row, col, opponent.gameboard);\n      previousAttacks[coordinates] = true;\n      if (attackResult) targetedAttack(coordinates);\n\n      return { coordinates, attackResult };\n    };\n  }\n\n  return obj;\n};\n\n\n//# sourceURL=webpack://odin-project-project-battleship/./lib/player.js?");

/***/ }),

/***/ "./lib/ship.js":
/*!*********************!*\
  !*** ./lib/ship.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Ship: () => (/* binding */ Ship)\n/* harmony export */ });\nconst Ship = (length) => {\n  function hit() {\n    this.hits++;\n  }\n\n  function isSunk() {\n    return this.hits >= this.length;\n  }\n\n  return {\n    length,\n    hits: 0,\n    hit,\n    isSunk,\n  };\n};\n\n\n//# sourceURL=webpack://odin-project-project-battleship/./lib/ship.js?");

/***/ }),

/***/ "./src/stylesheets/gameboardDisplay.css":
/*!**********************************************!*\
  !*** ./src/stylesheets/gameboardDisplay.css ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://odin-project-project-battleship/./src/stylesheets/gameboardDisplay.css?");

/***/ }),

/***/ "./src/stylesheets/index.css":
/*!***********************************!*\
  !*** ./src/stylesheets/index.css ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://odin-project-project-battleship/./src/stylesheets/index.css?");

/***/ }),

/***/ "./src/stylesheets/meyer-reset.css":
/*!*****************************************!*\
  !*** ./src/stylesheets/meyer-reset.css ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://odin-project-project-battleship/./src/stylesheets/meyer-reset.css?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _stylesheets_meyer_reset_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./stylesheets/meyer-reset.css */ \"./src/stylesheets/meyer-reset.css\");\n/* harmony import */ var _stylesheets_index_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stylesheets/index.css */ \"./src/stylesheets/index.css\");\n/* harmony import */ var _stylesheets_gameboardDisplay_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./stylesheets/gameboardDisplay.css */ \"./src/stylesheets/gameboardDisplay.css\");\n/* harmony import */ var _lib_player__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/player */ \"./lib/player.js\");\n/* harmony import */ var _lib_gameboard__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../lib/gameboard */ \"./lib/gameboard.js\");\n/* harmony import */ var _lib_ship__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../lib/ship */ \"./lib/ship.js\");\n/* harmony import */ var _lib_gameboardDisplay__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../lib/gameboardDisplay */ \"./lib/gameboardDisplay.js\");\n/* harmony import */ var _lib_gamelog__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../lib/gamelog */ \"./lib/gamelog.js\");\n\n\n\n\n\n\n\n\n\n\nconst ROWS = 10;\nconst COLUMNS = 10;\n\nconst resetGameButton = document.getElementById('resetGame');\nconst computerToggle = document.getElementById('computerPlay');\nconst hideLogToggle = document.getElementById('hideLog');\nconst logContainer = document.querySelector('.logContainer');\nconst fleetToggleLabel = document.getElementById('fleetToggleLabel');\nconst fleetBoardToggle = document.getElementById('fleetToggle');\nconst shipPlacementActions = document.querySelector('.shipPlacementActions');\nconst randomPlacementButton = document.getElementById('randomPlacement');\nconst targetContainer = document.querySelector('.targetBoard');\nconst fleetContainer = document.querySelector('.fleetBoard');\n\nconst playerOne = (0,_lib_player__WEBPACK_IMPORTED_MODULE_3__.Player)('Player One', (0,_lib_gameboard__WEBPACK_IMPORTED_MODULE_4__.Gameboard)(ROWS, COLUMNS));\nconst playerTwo = (0,_lib_player__WEBPACK_IMPORTED_MODULE_3__.Player)('Player Two', (0,_lib_gameboard__WEBPACK_IMPORTED_MODULE_4__.Gameboard)(ROWS, COLUMNS));\nconst computer = (0,_lib_player__WEBPACK_IMPORTED_MODULE_3__.Player)('Computer', (0,_lib_gameboard__WEBPACK_IMPORTED_MODULE_4__.Gameboard)(ROWS, COLUMNS), true);\n\nconst gameLog = (0,_lib_gamelog__WEBPACK_IMPORTED_MODULE_7__.Gamelog)('gameLog');\ngameLog.renderLog(logContainer);\n\nlet currentPlayer = playerOne;\nlet opponent = playerTwo;\nlet gameInProgress = false;\nlet userPlacement = {};\nlet shipPlacementDirection = 'h';\nconst lastUserPlacement = {};\n\nconst getBoardPeg = () => {\n  const template = document.getElementById('pegTemplate');\n  if (template && template.nodeName === 'TEMPLATE') {\n    return template.content.cloneNode(true);\n  }\n};\n\nconst playerColor = () => {\n  if (currentPlayer === playerOne) return '#5cff5c';\n  if (currentPlayer === playerTwo) return '#ffff63';\n  return '#ffffff';\n};\n\nconst toggleLogVisibility = (event) => {\n  if (!event) hideLogToggle.checked = !hideLogToggle.checked;\n  logContainer.classList.toggle('hidden');\n};\n\nconst updatePlayerName = (message) => {\n  document.querySelector('.playerName').textContent = message;\n  document.querySelector('.playerColor').style.backgroundColor = playerColor();\n};\n\nconst randomShipPlacement = () => {\n  userPlacement.ships.splice(0, currentPlayer.gameboard.shipCount);\n  userPlacement.ships.forEach((s) => currentPlayer.randomShipPlacement(s));\n  gameLog.clear();\n  userPlacement.resolve(currentPlayer);\n};\n\nconst setActiveShipDirection = (activeButton, inactiveButton) => {\n  activeButton.classList.add('activeDirection');\n  inactiveButton.classList.remove('activeDirection');\n};\n\nconst toggleShipPlacementDirection = (direction) => {\n  const horizontalBtn = document.getElementById('horizontalPlacement');\n  const verticalBtn = document.getElementById('verticalPlacement');\n  shipPlacementDirection = direction;\n\n  if (direction === 'h') setActiveShipDirection(horizontalBtn, verticalBtn);\n  if (direction === 'v') setActiveShipDirection(verticalBtn, horizontalBtn);\n};\n\nconst setShipDirection = (event) => {\n  toggleShipPlacementDirection(event.target.dataset['direction'] || 'h');\n};\n\nconst shipPlacementMessage = (ship) => {\n  gameLog.addMessage(`Now placing Ship of length: ${ship.length}`, false);\n};\n\nconst displayShips = (display, coordinates) => {\n  coordinates.forEach((arr) => {\n    const [row, col] = arr;\n    display.updateField(row, col, getBoardPeg(), 'whitePeg');\n  });\n};\n\nconst userShipPlacement = () => {\n  const display = (0,_lib_gameboardDisplay__WEBPACK_IMPORTED_MODULE_6__.GameboardDisplay)(ROWS, COLUMNS);\n  const ships = userPlacement.ships;\n\n  let coordinates = [];\n  let shipIndex = 0;\n  let ship = ships[shipIndex];\n\n  const predictedShipPlacement = (row, col) => {\n    coordinates = [];\n    display.removeHighlights();\n\n    for (let i = 0; i < ship.length; i++) {\n      let coords =\n        shipPlacementDirection === 'h' ? [row, col + i] : [row + i, col];\n      display.highlightField.apply(null, coords);\n      coordinates.push(coords);\n    }\n  };\n\n  toggleShipPlacementDirection('h');\n  updatePlayerName(currentPlayer.name);\n  gameLog.addMessage(`${currentPlayer.name} please place your ships`, false);\n  shipPlacementMessage(ship);\n\n  display.addCallback('mouseover', 'showPlacement', predictedShipPlacement);\n  display.addCallback('focusin', 'showPlacement', predictedShipPlacement);\n  display.addCallback('click', 'place', () => {\n    try {\n      currentPlayer.gameboard.placeShip(coordinates, ship);\n      displayShips(display, coordinates);\n      ship = ships[++shipIndex];\n      if (shipIndex >= ships.length) {\n        gameLog.clear();\n        userPlacement.resolve(currentPlayer.gameboard.shipPlacements);\n      } else {\n        coordinates = [];\n        shipPlacementMessage(ship);\n      }\n    } catch (error) {\n      gameLog.addMessage(error.message, false, 'red');\n    }\n  });\n\n  display.renderBoard(targetContainer);\n};\n\nconst placeShips = () => {\n  const ships = [2, 3, 3, 4, 5].map((n) => (0,_lib_ship__WEBPACK_IMPORTED_MODULE_5__.Ship)(n));\n\n  return new Promise((resolve, _) => {\n    userPlacement = { ships, resolve };\n    if (currentPlayer.computerPlayer) {\n      randomShipPlacement();\n    } else {\n      userShipPlacement();\n    }\n  });\n};\n\nconst updateDisplay = (board, callback) => {\n  Object.keys(board).forEach((coordinates) => {\n    const [row, col] = coordinates.split(',');\n    callback.call(null, row, col, board[[row, col]]);\n  });\n};\n\nconst setupDisplays = (hideTarget = false, hideFleet = false) => {\n  const displays = {};\n\n  if (!hideTarget) {\n    const targetBoard = currentPlayer.gameboard.targetBoard;\n    displays.target = (0,_lib_gameboardDisplay__WEBPACK_IMPORTED_MODULE_6__.GameboardDisplay)(ROWS, COLUMNS);\n\n    updateDisplay(targetBoard, (row, col, value) => {\n      const c = { true: 'whitePeg', false: 'redPeg', sunk: 'cyanPeg' }[value];\n      displays.target.updateField(row, col, getBoardPeg(), c);\n    });\n\n    displays.target.renderBoard(targetContainer);\n\n    if (lastUserPlacement[currentPlayer.name]) {\n      const [row, col] = lastUserPlacement[currentPlayer.name];\n      targetContainer.querySelector(`[data-field=\"${row}${col}\"]`).focus();\n    }\n  }\n\n  if (!hideFleet) {\n    const fleetBoard = currentPlayer.gameboard.fleetBoard;\n    displays.fleet = (0,_lib_gameboardDisplay__WEBPACK_IMPORTED_MODULE_6__.GameboardDisplay)(ROWS, COLUMNS);\n\n    updateDisplay(fleetBoard, (row, col, value) => {\n      const c = value === true ? 'redPeg' : value !== false ? 'whitePeg' : '';\n      displays.fleet.updateField(row, col, getBoardPeg(), c);\n    });\n\n    fleetContainer.classList.remove('hidden');\n    displays.fleet.renderBoard(fleetContainer);\n  } else {\n    fleetBoardToggle.checked = true;\n    fleetContainer.classList.add('hidden');\n  }\n\n  updatePlayerName(currentPlayer.name);\n\n  return displays;\n};\n\nconst userAttack = (display) => {\n  return new Promise((resolve, _) => {\n    display.addCallback('click', 'userAttack', (row, col) => {\n      if (currentPlayer.gameboard.targetBoard[[row, col]] === undefined) {\n        const attackResult = currentPlayer.attack(opponent, row, col);\n        display.removeCallback('click', 'userAttack');\n        lastUserPlacement[currentPlayer.name] = [row, col];\n        resolve({ coordinates: [row, col], attackResult });\n      }\n    });\n  });\n};\n\nconst logAttackMessage = (coordinates, attackResult) => {\n  const [row, col] = coordinates;\n  const field = `${String.fromCharCode(65 + row)}${col + 1}`;\n  const attackType = attackResult ? 'Hit' : 'Miss';\n\n  gameLog.addMessage(\n    `Attack from ${currentPlayer.name} at ${field} resulted in ${attackType}`,\n    true,\n    playerColor()\n  );\n};\n\nconst shipSunkMessage = (ship, remainingShipCount) => {\n  const messageOne = `${currentPlayer.name} has sunk ship of size ${ship.length}.`;\n  const messageTwo = `${opponent.name} has ${remainingShipCount} remaining ships.`;\n\n  gameLog.addMessage(messageOne, false, '#00dada');\n  gameLog.addMessage(messageTwo, false);\n};\n\nconst markShipAsSunk = (coordinates) => {\n  const fields = opponent.gameboard.shipPlacements.find((arr) => {\n    return arr.find((c) => c.join() === coordinates.join());\n  });\n  fields.forEach((arr) => (currentPlayer.gameboard.targetBoard[arr] = 'sunk'));\n};\n\nconst endGame = () => {\n  fleetToggleLabel.classList.add('hidden');\n  gameLog.addMessage(`${currentPlayer.name} has won!`, false, playerColor());\n\n  swapPlayers();\n  setupDisplays();\n\n  updatePlayerName(`${currentPlayer.name} has lost the game`);\n\n  const gameContainer = document.querySelector('.gameContainer');\n  const clone = gameContainer.cloneNode(true);\n  clone.classList.value = 'opponentContainer';\n  clone.querySelector('.logContainer').remove();\n  gameContainer.after(clone);\n\n  swapPlayers();\n  setupDisplays();\n\n  updatePlayerName(`${currentPlayer.name} has won the game`);\n\n  return (gameInProgress = false);\n};\n\nconst playRound = async () => {\n  if (gameInProgress) {\n    let attack;\n    if (currentPlayer.computerPlayer) {\n      attack = currentPlayer.attack(opponent);\n    } else {\n      const displays = setupDisplays(false, fleetBoardToggle.checked);\n      attack = await userAttack(displays.target);\n    }\n\n    logAttackMessage(attack.coordinates, attack.attackResult);\n\n    if (attack.attackResult) {\n      const ship = attack.attackResult;\n      if (ship.isSunk()) {\n        const shipCount = opponent.gameboard.shipCount;\n        shipSunkMessage(ship, shipCount);\n        markShipAsSunk(attack.coordinates);\n        if (shipCount === 0) return endGame();\n      }\n    }\n\n    if (!currentPlayer.computerPlayer && !opponent.computerPlayer) {\n      fleetBoardToggle.checked = true;\n    }\n\n    swapPlayers();\n    return playRound();\n  }\n};\n\nconst swapPlayers = () => {\n  [currentPlayer, opponent] = [opponent, currentPlayer];\n};\n\nconst setupGame = async () => {\n  setupDisplays(false, true);\n  gameLog.clear();\n\n  const opponentContainer = document.querySelector('.opponentContainer');\n  if (opponentContainer) opponentContainer.remove();\n\n  currentPlayer = playerOne;\n  opponent = computerToggle.checked ? computer : playerTwo;\n  if (opponent === computer) opponent.reset();\n  [currentPlayer, opponent].forEach((player) => player.gameboard.clear());\n\n  gameInProgress = false;\n  fleetToggleLabel.classList.add('hidden');\n  fleetBoardToggle.checked = true;\n  shipPlacementActions.classList.remove('hidden');\n\n  (await placeShips()) && swapPlayers();\n  (await placeShips()) && swapPlayers();\n\n  fleetToggleLabel.classList.remove('hidden');\n  shipPlacementActions.classList.add('hidden');\n  gameInProgress = true;\n\n  playRound();\n};\n\nwindow.addEventListener('keydown', (keyEvent) => {\n  if (gameInProgress) {\n    if (keyEvent.code === 'KeyF') {\n      fleetBoardToggle.checked = !fleetBoardToggle.checked;\n      playRound();\n    }\n  } else {\n    if (keyEvent.code === 'KeyH') toggleShipPlacementDirection('h');\n    if (keyEvent.code === 'KeyV') toggleShipPlacementDirection('v');\n  }\n\n  if (keyEvent.code === 'KeyC') {\n    computerToggle.checked = !computerToggle.checked;\n    setupGame();\n  }\n  if (keyEvent.code === 'KeyL') toggleLogVisibility();\n  if (keyEvent.code === 'KeyR') setupGame();\n});\n\nresetGameButton.addEventListener('click', setupGame);\ncomputerToggle.addEventListener('change', setupGame);\nhideLogToggle.addEventListener('change', toggleLogVisibility);\nfleetBoardToggle.addEventListener('change', playRound);\nrandomPlacementButton.addEventListener('click', randomShipPlacement);\nshipPlacementActions.addEventListener('click', setShipDirection);\n\nsetupGame();\n\n\n//# sourceURL=webpack://odin-project-project-battleship/./src/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;