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

  describe('#randomShipPlacement', () => {
    const validCoordinates = (arr) => {
      return arr.every((coordinates) => {
        const [row, col] = coordinates;
        return row >= 0 && row < 10 && col >= 0 && col < 10;
      });
    };

    test('should place a ship at random coordinates', () => {
      const board = {
        rows: 10,
        columns: 10,
        placeShip: jest.fn((coordinates, ship) => {
          if (!validCoordinates(coordinates)) throw new Error();
          return ship;
        }),
      };
      const player = Player('Player', board, {}, {});
      const ship = { length: 3 };
      const actual = player.randomShipPlacement(ship);

      expect(validCoordinates(actual)).toBeTruthy();
      expect(board.placeShip).toHaveBeenLastCalledWith(actual, ship);
    });
  });

  describe('computerPlayer', () => {
    describe('#reset', () => {
      test(`Should reset the computer's attack options`, () => {
        const board = {
          rows: 5,
          columns: 5,
          makeAttack: jest.fn(() => true),
        };

        const cpu = Player('cpuPlayer', board, { computerPlayer: true });
        const opponent = Player('Player', { rows: 5, columns: 5 });

        for (let i = 0; i < 25; i++) {
          cpu.attack(opponent);
        }

        expect(cpu.attack(opponent)).toBeNull();
        cpu.reset();

        for (let i = 0; i < 25; i++) {
          expect(cpu.attack(opponent)).not.toBeNull();
        }
      });
    });

    describe('#attack', () => {
      let board, cpu, opponent;

      beforeEach(() => {
        board = {
          rows: 10,
          columns: 10,
          makeAttack: jest.fn(() => true),
        };

        cpu = Player('cpuPlayer', board, { computerPlayer: true });
        opponent = Player('Player', { rows: 10, columns: 10 });
      });

      test('should attack a random field', () => {
        const actual = cpu.attack(opponent);
        const [row, col] = board.makeAttack.mock.calls[0];

        expect(actual).toStrictEqual({
          coordinates: [row, col],
          attackResult: true,
        });
        expect(board.makeAttack).toHaveBeenCalledTimes(1);
        expect(board.makeAttack).toHaveBeenCalledWith(
          row,
          col,
          opponent.gameboard
        );
        expect(row >= 0 && row < 10 && col >= 0 && col < 10).toBeTruthy();
      });

      test('should attack adjacent fields if previous attack was a hit', () => {
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

      test('should return null if every field has been attacked once', () => {
        for (let i = 0; i < 110; i++) {
          let result = cpu.attack(opponent);
          if (i > 99) expect(result).toBeNull();
        }
      });
    });
  });
});
