"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Direction = "up" | "down" | "left" | "right";
type Board = number[][];

const BOARD_SIZE = 4;

function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

function getRandomTileValue(): number {
  return Math.random() < 0.1 ? 4 : 2;
}

function addRandomTile(board: Board): Board {
  const emptyCells: Array<{ row: number; col: number }> = [];
  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell === 0) emptyCells.push({ row: rowIndex, col: colIndex });
    });
  });

  if (emptyCells.length === 0) return board;

  const chosen = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const next = board.map((row) => [...row]);
  next[chosen.row][chosen.col] = getRandomTileValue();
  return next;
}

function rotateClockwise(board: Board): Board {
  const next = createEmptyBoard();
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      next[col][BOARD_SIZE - 1 - row] = board[row][col];
    }
  }
  return next;
}

function normalizeDirection(board: Board, direction: Direction): Board {
  const normalized = board.map((row) => [...row]);

  if (direction === "left") return normalized;
  if (direction === "up") return rotateClockwise(rotateClockwise(rotateClockwise(normalized)));
  if (direction === "right") return rotateClockwise(rotateClockwise(normalized));
  return rotateClockwise(normalized);
}

function denormalizeDirection(board: Board, direction: Direction): Board {
  if (direction === "left") return board;
  if (direction === "up") return rotateClockwise(board);
  if (direction === "right") return rotateClockwise(rotateClockwise(board));
  return rotateClockwise(rotateClockwise(rotateClockwise(board)));
}

function slideRowLeft(row: number[]): { row: number[]; moved: boolean; gained: number } {
  const compact = row.filter((value) => value !== 0);
  const merged: number[] = [];
  let gained = 0;

  for (let i = 0; i < compact.length; i += 1) {
    if (i + 1 < compact.length && compact[i] === compact[i + 1]) {
      const value = compact[i] * 2;
      merged.push(value);
      gained += value;
      i += 1;
    } else {
      merged.push(compact[i]);
    }
  }

  while (merged.length < BOARD_SIZE) {
    merged.push(0);
  }

  const moved = merged.some((value, index) => value !== row[index]);
  return { row: merged, moved, gained };
}

function applyMove(board: Board, direction: Direction): { board: Board; moved: boolean; gained: number } {
  const normalized = normalizeDirection(board, direction);
  const nextNormalized: Board = [];
  let moved = false;
  let gained = 0;

  for (const row of normalized) {
    const result = slideRowLeft(row);
    nextNormalized.push(result.row);
    moved = moved || result.moved;
    gained += result.gained;
  }

  return {
    board: denormalizeDirection(nextNormalized, direction),
    moved,
    gained,
  };
}

function hasLegalMove(board: Board): boolean {
  for (const direction of ["up", "down", "left", "right"] as const) {
    if (applyMove(board, direction).moved) return true;
  }
  return false;
}

function createInitialBoard(): Board {
  return addRandomTile(addRandomTile(createEmptyBoard()));
}

export default function Game2048Page() {
  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const maxTile = useMemo(() => Math.max(...board.flat()), [board]);

  const handleMove = useCallback(
    (direction: Direction) => {
      if (gameOver) return;

      const result = applyMove(board, direction);
      if (!result.moved) return;

      const withNewTile = addRandomTile(result.board);
      const nextScore = score + result.gained;
      const ended = !hasLegalMove(withNewTile);

      setBoard(withNewTile);
      setScore(nextScore);
      setGameOver(ended);
    },
    [board, gameOver, score],
  );

  const resetGame = useCallback(() => {
    setBoard(createInitialBoard());
    setScore(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const map: Record<string, Direction> = {
        arrowup: "up",
        w: "up",
        arrowdown: "down",
        s: "down",
        arrowleft: "left",
        a: "left",
        arrowright: "right",
        d: "right",
      };
      const direction = map[key];
      if (!direction) return;

      event.preventDefault();
      handleMove(direction);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleMove]);

  const tileClass = (value: number) => {
    if (value === 0) return "bg-neutral-200 text-transparent dark:bg-neutral-800";
    if (value <= 4) return "bg-zinc-100 text-zinc-900";
    if (value <= 16) return "bg-amber-300 text-zinc-900";
    if (value <= 64) return "bg-orange-400 text-white";
    if (value <= 256) return "bg-orange-500 text-white";
    if (value <= 1024) return "bg-orange-600 text-white";
    return "bg-orange-700 text-white";
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center gap-6 px-4 py-12">
      <h1 className="text-3xl font-semibold">2048</h1>
      <p className="text-sm text-neutral-500">Use Arrow keys or WASD to merge tiles.</p>

      <div className="flex items-center gap-4 text-sm">
        <span>Score: {score}</span>
        <span>Max: {maxTile}</span>
        {gameOver && <span className="text-red-500">Game Over</span>}
      </div>

      <div className="grid grid-cols-4 gap-2 rounded-xl bg-neutral-300 p-2 dark:bg-neutral-900">
        {board.flatMap((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`flex h-20 w-20 items-center justify-center rounded-lg text-xl font-semibold ${tileClass(cell)}`}
            >
              {cell === 0 ? "." : cell}
            </div>
          )),
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={resetGame}
          className="rounded bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200"
        >
          Restart
        </button>
      </div>
    </main>
  );
}
