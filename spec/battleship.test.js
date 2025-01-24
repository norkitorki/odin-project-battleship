/**
 * @jest-environment jsdom
 */

import { Battleship } from '../lib/battleship';

describe('Battleship', () => {
  let player, opponent, computer;

  const horizontalStartCoords = ['00', '10', '20', '30', '40'];

  const triggerTargetBoardClick = (gamePlayer, startCoords) => {
    document.body.innerHTML = '';
    document.body.appendChild(gamePlayer.container);

    const targetBoard = document.body.querySelector(
      '.targetBoard > .gameboard'
    );
    startCoords.forEach((c) => {
      const field = targetBoard.querySelector(`[data-field="${c}"]`);
      field.focus();
      field.click();
    });
  };

  beforeEach(() => {
    player = {
      name: 'Player One',
      attack: jest.fn(),
      gameboard: { clear: jest.fn(), placeShip: jest.fn(), targetBoard: {} },
      randomShipPlacement: jest.fn(),
    };

    opponent = {
      name: 'Player Two',
      attack: jest.fn(),
      gameboard: { clear: jest.fn(), placeShip: jest.fn(), targetBoard: {} },
      randomShipPlacement: jest.fn(),
    };

    computer = {
      name: 'Computer',
      computerPlayer: true,
      attack: jest.fn(),
      gameboard: { clear: jest.fn() },
      randomShipPlacement: jest.fn(() => {}),
    };
  });

  test('should have a player property', () => {
    const game = Battleship(player, opponent);
    expect(game.player).toStrictEqual(player);
  });

  test('should have an opponent property', () => {
    const game = Battleship(player, opponent);
    expect(game.opponent).toStrictEqual(opponent);
  });

  test('should have a computer property', () => {
    const game = Battleship(player, opponent, computer);
    expect(game.computer).toStrictEqual(computer);
  });

  test('should have a gameInProgress property', () => {
    const game = Battleship(player, opponent);
    expect(game.gameInProgress).toBe(false);
  });

  test('should have a shipPlacementDirection property', () => {
    const game = Battleship(player, opponent);
    expect(game.shipPlacementDirection).toBe('h');
  });

  test('should create gameboard displays for each player', () => {
    Battleship(player, opponent);

    [player, opponent].forEach((p) => {
      expect(p.targetDisplay).not.toBeUndefined();
      expect(p.fleetDisplay).not.toBeUndefined();
    });
  });

  test('should create container div for each player', () => {
    Battleship(player, opponent);

    [player, opponent].forEach((p) => {
      const c = p.container;
      expect(c.nodeName).toBe('DIV');
      expect(c.classList.value === 'playerContainer');
    });
  });

  test('should display gameboards in container div', () => {
    Battleship(player, opponent);

    [player, opponent].forEach((p) => {
      const c = p.container;
      expect(c.querySelector('.targetBoard > .gameboard')).not.toBeNull();
      expect(c.querySelector('.fleetBoard > .gameboard')).not.toBeNull();
    });
  });

  describe('#addCallback', () => {
    test('should register callback at specified event', () => {
      const game = Battleship(player, opponent);
      const callback = jest.fn();

      game.addCallback(callback, 'preReset');
      game.resetGame();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should not register callback when specified event is not valid', () => {
      const game = Battleship(player, opponent);
      const callback = jest.fn();

      game.addCallback(callback, 'postPlayerWin');
      game.play();

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('#addKeyboardCallback', () => {
    test('should register keydown event on window element', () => {
      const game = Battleship(player, opponent);

      const callback = jest.fn();
      const event = new KeyboardEvent('keydown', { code: 'KeyG' });
      game.addKeyboardCallback('KeyG', callback);
      window.dispatchEvent(event);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('#toggleComputer', () => {
    test('should swap opponent with computer when', () => {
      const game = Battleship(player, opponent, computer);

      expect(game.opponent).toStrictEqual(opponent);
      game.toggleComputer();
      expect(game.opponent).toStrictEqual(computer);
      game.toggleComputer();
      expect(game.opponent).toStrictEqual(opponent);
    });
  });

  describe('#resetGame', () => {
    const horizontalStartCoords = ['00', '10', '20', '30', '40'];

    test('should return promise', () => {
      expect(Battleship(player, opponent).resetGame()).toBeInstanceOf(Promise);
    });

    test('should set gameInProgress to false', () => {
      const game = Battleship(player, opponent);
      game.gameInProgress = true;
      game.resetGame();

      expect(game.gameInProgress).toBe(false);
    });

    test('should clear gameboards', () => {
      const game = Battleship(player, opponent);
      game.resetGame();

      expect(player.gameboard.clear).toHaveBeenCalledTimes(1);
      expect(opponent.gameboard.clear).toHaveBeenCalledTimes(1);
    });

    test('should clear displayed gameboards', () => {
      const game = Battleship(player, opponent);

      [player, opponent].forEach((p) => {
        p.targetDisplay.clear = jest.fn();
        p.fleetDisplay.clear = jest.fn();
      });

      game.resetGame();

      [player, opponent].forEach((p) => {
        expect(p.targetDisplay.clear).toHaveBeenLastCalledWith(true);
        expect(p.fleetDisplay.clear).toHaveBeenLastCalledWith(true);
      });
    });

    test('should set gameInProgress to true after ships are placed', async () => {
      expect.assertions(2);

      const game = Battleship(player, opponent);

      expect(game.gameInProgress).toBe(false);
      const reset = game.resetGame();

      [player, opponent].forEach((p) => {
        setTimeout(() => {
          triggerTargetBoardClick(p, horizontalStartCoords);
        }, 1);
      });

      await reset;

      expect(game.gameInProgress).toBe(true);
    });

    describe('when player is a computer', () => {
      const randomCoordinates = [
        [
          [3, 4],
          [3, 5],
        ],
        [
          [0, 9],
          [1, 9],
          [2, 9],
        ],
        [
          [9, 7],
          [9, 8],
          [9, 9],
        ],
        [
          [6, 0],
          [6, 1],
          [6, 2],
          [6, 3],
        ],
        [
          [8, 4],
          [8, 5],
          [8, 6],
          [8, 7],
          [8, 8],
        ],
      ];

      beforeEach(() => {
        computer.randomShipPlacement
          .mockReturnValue([])
          .mockReturnValueOnce(randomCoordinates[0])
          .mockReturnValueOnce(randomCoordinates[1])
          .mockReturnValueOnce(randomCoordinates[2])
          .mockReturnValueOnce(randomCoordinates[3])
          .mockReturnValueOnce(randomCoordinates[4]);
      });

      test('should place ships at random', () => {
        const game = Battleship(computer, player);

        game.resetGame();

        expect(player.randomShipPlacement).not.toHaveBeenCalled();
        expect(computer.randomShipPlacement).toHaveBeenCalledTimes(5);
      });

      test('should not display ships on target board', () => {
        const game = Battleship(computer, player);
        computer.targetDisplay.updateField = jest.fn();

        game.resetGame();

        expect(computer.targetDisplay.updateField).not.toHaveBeenCalled();
      });

      test('should display ships on fleet display', () => {
        const game = Battleship(computer, player);
        computer.fleetDisplay.updateField = jest.fn();

        game.resetGame();

        expect(computer.fleetDisplay.updateField.mock.calls).toStrictEqual(
          randomCoordinates
            .flat()
            .map((c) => [c[0], c[1], 'pegTemplate', 'whitePeg'])
        );
        expect(computer.fleetDisplay.updateField).toHaveBeenCalledTimes(17);
      });
    });

    describe('when player is a human', () => {
      const horizontalCoordinates = [
        [
          [0, 0],
          [0, 1],
        ],
        [
          [1, 0],
          [1, 1],
          [1, 2],
        ],
        [
          [2, 0],
          [2, 1],
          [2, 2],
        ],
        [
          [3, 0],
          [3, 1],
          [3, 2],
          [3, 3],
        ],
        [
          [4, 0],
          [4, 1],
          [4, 2],
          [4, 3],
          [4, 4],
        ],
      ];

      test('should place ships on gameboard', async () => {
        expect.assertions(10);

        const game = Battleship(player, opponent);
        const reset = game.resetGame();

        [player, opponent].forEach((p) => {
          setTimeout(() => {
            triggerTargetBoardClick(p, horizontalStartCoords);
            horizontalCoordinates.forEach((coords, i) => {
              expect(p.gameboard.placeShip.mock.calls[i][0]).toStrictEqual(
                coords
              );
            });
          }, 1);
        });

        await reset;
      });

      test('should display placed ships on target board', async () => {
        expect.assertions(4);

        const game = Battleship(player, opponent);
        const reset = game.resetGame();

        [player, opponent].forEach((p) => {
          setTimeout(() => {
            p.targetDisplay.updateField = jest.fn();
            triggerTargetBoardClick(p, horizontalStartCoords);

            expect(p.targetDisplay.updateField.mock.calls).toStrictEqual(
              horizontalCoordinates
                .flat()
                .map((c) => [c[0], c[1], 'pegTemplate', 'whitePeg'])
            );
            expect(p.targetDisplay.updateField).toHaveBeenCalledTimes(17);
          }, 1);
        });

        await reset;
      });

      test('should display placed ships on fleet board', async () => {
        expect.assertions(4);

        const game = Battleship(player, opponent);
        const reset = game.resetGame();

        [player, opponent].forEach((p) => {
          setTimeout(() => {
            p.fleetDisplay.updateField = jest.fn();
            triggerTargetBoardClick(p, horizontalStartCoords);

            expect(p.fleetDisplay.updateField.mock.calls).toStrictEqual(
              horizontalCoordinates
                .flat()
                .map((c) => [c[0], c[1], 'pegTemplate', 'whitePeg'])
            );
            expect(p.fleetDisplay.updateField).toHaveBeenCalledTimes(17);
          }, 1);
        });

        await reset;
      });

      test('should clear target board display after ships are placed', async () => {
        expect.assertions(2);

        const game = Battleship(player, opponent);
        const reset = game.resetGame();

        [player, opponent].forEach((p) => {
          setTimeout(() => {
            p.targetDisplay.clear = jest.fn();
            triggerTargetBoardClick(p, horizontalStartCoords);
            expect(p.targetDisplay.clear).toHaveBeenCalledTimes(1);
          }, 1);
        });

        await reset;
      });

      describe('when shipPlacementDirection is set to vertical', () => {
        const verticalCoordinates = [
          [
            [0, 0],
            [1, 0],
          ],
          [
            [0, 1],
            [1, 1],
            [2, 1],
          ],
          [
            [0, 2],
            [1, 2],
            [2, 2],
          ],
          [
            [0, 3],
            [1, 3],
            [2, 3],
            [3, 3],
          ],
          [
            [0, 4],
            [1, 4],
            [2, 4],
            [3, 4],
            [4, 4],
          ],
        ];

        test('should place ships vertically', async () => {
          expect.assertions(14);

          const game = Battleship(player, opponent);
          const reset = game.resetGame();
          const verticalStartCoords = ['00', '01', '02', '03', '04'];

          game.shipPlacementDirection = 'v';
          [player, opponent].forEach((p) => {
            setTimeout(() => {
              p.targetDisplay.updateField = jest.fn();
              p.fleetDisplay.updateField = jest.fn();
              triggerTargetBoardClick(p, verticalStartCoords);

              [p.targetDisplay, p.fleetDisplay].forEach((display) => {
                expect(display.updateField.mock.calls).toStrictEqual(
                  verticalCoordinates
                    .flat()
                    .map((c) => [c[0], c[1], 'pegTemplate', 'whitePeg'])
                );
              });

              verticalCoordinates.forEach((coords, i) => {
                expect(p.gameboard.placeShip.mock.calls[i][0]).toStrictEqual(
                  coords
                );
              });
            }, 1);
          });

          await reset;
        });
      });
    });
  });

  describe('#placeShipsRandomly', () => {
    const randomCoordinates = [
      [
        [3, 4],
        [3, 5],
      ],
      [
        [0, 9],
        [1, 9],
        [2, 9],
      ],
      [
        [9, 7],
        [9, 8],
        [9, 9],
      ],
      [
        [6, 0],
        [6, 1],
        [6, 2],
        [6, 3],
      ],
      [
        [8, 4],
        [8, 5],
        [8, 6],
        [8, 7],
        [8, 8],
      ],
    ];

    beforeEach(() => {
      [player, opponent].forEach((p) => {
        p.randomShipPlacement
          .mockReturnValue([])
          .mockReturnValueOnce(randomCoordinates[0])
          .mockReturnValueOnce(randomCoordinates[1])
          .mockReturnValueOnce(randomCoordinates[2])
          .mockReturnValueOnce(randomCoordinates[3])
          .mockReturnValueOnce(randomCoordinates[4]);
      });
    });

    test('should let user place ships at random', async () => {
      expect.assertions(2);

      const game = Battleship(player, opponent);
      const reset = game.resetGame();

      [player, opponent].forEach((p) => {
        setTimeout(() => {
          game.placeShipsRandomly();
          expect(p.randomShipPlacement).toHaveBeenCalledTimes(5);
        }, 1);
      });

      await reset;
    });

    describe('when neither player is currently placing ships', () => {
      test('should not place ships at random', () => {
        const game = Battleship(player, opponent);

        [player, opponent].forEach(() => {
          game.placeShipsRandomly();
        });

        expect(player.randomShipPlacement).not.toHaveBeenCalled();
      });
    });

    describe('when some ships are already placed', () => {
      test('should place remaining ships at random', async () => {
        expect.assertions(2);

        const game = Battleship(player, opponent);
        const reset = game.resetGame();

        [player, opponent].forEach((p) => {
          setTimeout(() => {
            triggerTargetBoardClick(p, ['22', '44']);
            p.gameboard.shipCount = 2;
            game.placeShipsRandomly();
            expect(p.randomShipPlacement).toHaveBeenCalledTimes(3);
          }, 1);
        });

        await reset;
      });
    });
  });

  describe('#play', () => {
    describe('when players have not placed their ships', () => {
      test('should resolve to null', () => {
        const game = Battleship(player, opponent);
        const result = game.play();

        expect(result).resolves.toBe(null);
      });
    });

    describe('when a player is a computer', () => {
      let computerGame;
      beforeEach(async () => {
        computer.randomShipPlacement.mockReturnValue([]);
        computerGame = Battleship(player, computer);
        const reset = computerGame.resetGame();
        setTimeout(() => {
          triggerTargetBoardClick(player, horizontalStartCoords);
        }, 1);
        await reset;
      });

      test('should attack opponent', () => {
        expect.assertions(2);

        const player = computerGame.player;
        const computer = computerGame.opponent;

        computer.attack.mockReturnValue({
          coordinates: [2, 3],
          attackResult: false,
        });

        const playerAttack = computerGame.play();
        triggerTargetBoardClick(player, ['23']);

        playerAttack.then(() => {
          const computerAttack = computerGame.play();

          computerAttack.then(() => {
            expect(computer.attack).toHaveBeenCalledTimes(1);
            expect(computer.attack).toHaveBeenCalledWith(player);
          });
        });
      });
    });

    describe('when a player has won the game', () => {
      let game;
      beforeEach(() => {
        game = Battleship(player, opponent);
        game.gameInProgress = true;
        game.opponent.gameboard.shipCount = 0;
      });

      test('should set gameInProgress property to false', () => {
        expect.assertions(2);

        expect(game.gameInProgress).toBe(true);

        const round = game.play();
        triggerTargetBoardClick(player, ['20']);

        round.then(() => expect(game.gameInProgress).toBe(false));
      });

      test('should resolve with the player', () => {
        expect.assertions(1);

        const round = game.play();
        triggerTargetBoardClick(player, ['20']);

        round.then((res) => {
          expect(res).toStrictEqual(player);
        });
      });
    });

    let game;
    beforeEach(async () => {
      game = Battleship(player, opponent);
      const reset = game.resetGame();
      [player, opponent].forEach((p) => {
        setTimeout(() => {
          triggerTargetBoardClick(p, horizontalStartCoords);
        }, 1);
      });
      await reset;
    });

    test('should allow player to attack opponent', () => {
      game.play();

      triggerTargetBoardClick(player, ['44']);

      expect(player.attack).toHaveBeenCalledWith(opponent, 4, 4);
    });

    test(`should update player's target board`, () => {
      expect.assertions(4);

      const player = game.player;
      const opponent = game.opponent;

      player.targetDisplay.updateField = jest.fn();
      opponent.targetDisplay.updateField = jest.fn();

      opponent.gameboard.shipPlacements = [
        [
          [8, 0],
          [8, 1],
        ],
      ];

      const ship = { length: 2, isSunk: jest.fn(() => false) };
      const sunkShip = { length: 2, isSunk: jest.fn(() => true) };
      player.attack.mockReturnValueOnce(false).mockReturnValueOnce(sunkShip);
      opponent.attack.mockReturnValueOnce(ship);

      const firstAttack = game.play();
      triggerTargetBoardClick(player, ['72']);

      firstAttack.then(() => {
        expect(player.targetDisplay.updateField).toHaveBeenCalledWith(
          7,
          2,
          'pegTemplate',
          'redPeg'
        );

        const secondAttack = game.play();
        triggerTargetBoardClick(opponent, ['20']);

        secondAttack.then(() => {
          expect(opponent.targetDisplay.updateField).toHaveBeenCalledWith(
            2,
            0,
            'pegTemplate',
            'whitePeg'
          );

          const thirdAttack = game.play();
          triggerTargetBoardClick(player, ['81']);

          thirdAttack.then(() => {
            opponent.gameboard.shipPlacements.forEach((arr) => {
              arr.forEach((coords) => {
                const [row, col] = coords;
                expect(player.targetDisplay.updateField).toHaveBeenCalledWith(
                  row,
                  col,
                  'pegTemplate',
                  'cyanPeg'
                );
              });
            });
          });
        });
      });
    });

    test(`should update opponent's fleet board`, () => {
      expect.assertions(1);

      const opponent = game.opponent;
      opponent.fleetDisplay.updateField = jest.fn();

      const ship = { length: 2, isSunk: jest.fn(() => false) };
      game.player.attack.mockReturnValueOnce(ship);

      const attack = game.play();
      triggerTargetBoardClick(game.player, ['25']);

      attack.then(() => {
        expect(opponent.fleetDisplay.updateField).toHaveBeenCalledWith(
          2,
          5,
          'pegTemplate',
          'redPeg'
        );
      });
    });

    test('should swap player with opponent after attack', () => {
      expect.assertions(2);

      const previousPlayer = game.player;
      const previousOpponent = game.opponent;

      const result = game.play();
      triggerTargetBoardClick(player, ['49']);

      result.then(() => {
        expect(game.player).toStrictEqual(previousOpponent);
        expect(game.opponent).toStrictEqual(previousPlayer);
      });
    });
  });

  describe('#playGame', () => {
    let game;
    beforeEach(() => (game = Battleship(player, opponent)));

    test('should call play() until a player has won', () => {
      expect.assertions(1);

      game.play = jest.fn(async () => {});
      game.play
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(player);

      const result = game.playGame();

      result.then(() => {
        expect(game.play).toHaveBeenCalledTimes(3);
      });
    });

    test('should resolve play() when a player has won', () => {
      expect.assertions(2);

      game.play = jest.fn(async () => {});
      game.play.mockReturnValueOnce('Some Player');

      const result = game.playGame();

      result.then((res) => {
        expect(result).resolves.toBe('Some Player');
        expect(res).toStrictEqual('Some Player');
      });
    });
  });
});
