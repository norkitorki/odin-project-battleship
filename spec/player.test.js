import { Player } from '../lib/player';

describe('Player', () => {
  test('should be a factory function', () => {
    expect(Player).toEqual(expect.any(Function));
    expect(Player('Player1', {})).toEqual(expect.any(Object));
  });

  test('should have a name property', () => {
    const player = Player('Mike');

    expect(player.name).toBe('Mike');
  });

  test('should have a gameboard property', () => {
    const board = { rows: 10, columns: 10 };
    const player = Player('Player1', board);

    expect(player.gameboard).toStrictEqual(board);
  });

  test('should have a targetDisplay property', () => {
    const board = { rows: 10, columns: 10 };
    const targetDisplay = { target: true };
    const player = Player('Player1', board, targetDisplay);

    expect(player.targetDisplay).toStrictEqual(targetDisplay);
  });

  test('should have a fleetDisplay property', () => {
    const board = { rows: 10, columns: 10 };
    const targetDisplay = { target: true };
    const fleetDisplay = { bottom: true };
    const player = Player('Player1', board, targetDisplay, fleetDisplay);

    expect(player.fleetDisplay).toStrictEqual(fleetDisplay);
  });

  test('should have a computerPlayer property', () => {
    const player = Player('NonCpuPlayer');

    expect(player.computerPlayer).toBe(false);
  });

  describe('#attack', () => {
    test(`should attack opponent's gameboard`, () => {
      const board = {
        rows: 10,
        columns: 10,
        makeAttack: jest.fn(() => 'attacked'),
      };
      const player = Player('Player1', board);
      const opponent = Player('Player2', { rows: 10, columns: 10 });
      const actual = player.attack(opponent, 2, 4);

      expect(actual).toBe('attacked');
      expect(player.gameboard.makeAttack).toHaveBeenCalledTimes(1);
      expect(player.gameboard.makeAttack).toHaveBeenCalledWith(
        2,
        4,
        opponent.gameboard
      );
    });
  });

  describe('computerPlayer', () => {
    describe('#attack', () => {
      test('should attack a random field', () => {
        const board = {
          rows: 10,
          columns: 10,
          makeAttack: jest.fn(() => true),
        };
        const cpu = Player(
          'cpuPlayer',
          board,
          {},
          {},
          { computerPlayer: true }
        );
        const opponent = Player('Player2', { rows: 10, columns: 10 });
        const actual = cpu.attack(opponent);
        const [row, col] = board.makeAttack.mock.calls[0];

        expect(actual).toStrictEqual([row, col]);
        expect(board.makeAttack).toHaveBeenCalledTimes(1);
        expect(board.makeAttack).toHaveBeenCalledWith(
          row,
          col,
          opponent.gameboard
        );
        expect(row >= 0 && row < 10).toBeTruthy();
        expect(col >= 0 && col < 10).toBeTruthy();
      });

      test('should attack adjacent fields if previous attack was a hit', () => {
        const board = {
          rows: 10,
          columns: 10,
          makeAttack: jest
            .fn()
            .mockReturnValueOnce(true)
            .mockReturnValue(false),
        };
        const cpu = Player(
          'cpuPlayer',
          board,
          {},
          {},
          { computerPlayer: true }
        );
        const opponent = Player('Player2', { rows: 10, columns: 10 });

        cpu.attack(opponent);
        const [lastRow, lastCol, _] = board.makeAttack.mock.calls[0];
        for (let i = 0; i < 5; i++) cpu.attack(opponent);

        const adjacentFields = [
          [lastRow - 1, lastCol],
          [lastRow + 1, lastCol],
          [lastRow, lastCol + 1],
          [lastRow, lastCol - 1],
        ];

        expect(
          board.makeAttack.mock.calls.some((arr, index) => {
            if (index === 0) return false;

            const [row, col, _] = arr;
            return adjacentFields.some((c) => c.join() === [row, col].join());
          })
        ).toBeTruthy();
      });
    });

    describe('#placeShip', () => {
      test('should place ship at random coordinates on gameboard', () => {
        const board = { rows: 10, columns: 10, placeShip: jest.fn() };
        const ships = [{ length: 2 }, { length: 3 }, { length: 5 }];
        const cpu = Player(
          'cpuPlayer',
          board,
          {},
          {},
          { computerPlayer: true }
        );

        ships.forEach((ship) => cpu.placeShip(ship));
        expect(board.placeShip).toHaveBeenCalledTimes(3);
      });

      test('should return ship coordinates of placed ship', () => {
        const board = { rows: 10, columns: 10, placeShip: jest.fn() };
        const ship = { length: 3 };
        const cpu = Player(
          'cpuPlayer',
          board,
          {},
          {},
          { computerPlayer: true }
        );
        const actual = cpu.placeShip(ship);

        expect(Array.isArray(actual)).toBeTruthy();
        expect(actual.length).toBe(3);
        actual.forEach((coords) => {
          expect(!isNaN(coords[0]) && !isNaN(coords[1])).toBeTruthy();
        });
      });
    });
  });
});
