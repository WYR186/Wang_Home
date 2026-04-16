"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Point = { x: number; y: number };
type Direction = "up" | "down" | "left" | "right";

const CELL_SIZE = 20;
const BOARD_WIDTH = 640;
const BOARD_HEIGHT = 480;
const TICK_MS = 140; // ~7 FPS, close to original pygame version

const DIRECTIONS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function getRandomFood(snake: Point[]): Point {
  const cols = BOARD_WIDTH / CELL_SIZE;
  const rows = BOARD_HEIGHT / CELL_SIZE;

  while (true) {
    const point = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
    };

    if (!snake.some((item) => item.x === point.x && item.y === point.y)) {
      return point;
    }
  }
}

function isOppositeDirection(current: Direction, next: Direction): boolean {
  return (
    (current === "up" && next === "down") ||
    (current === "down" && next === "up") ||
    (current === "left" && next === "right") ||
    (current === "right" && next === "left")
  );
}

export default function Snake2020Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const directionRef = useRef<Direction>("right");
  const snakeRef = useRef<Point[]>([
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ]);
  const foodRef = useRef<Point>({ x: 15, y: 15 });
  const gameOverRef = useRef(false);

  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const boardCols = useMemo(() => BOARD_WIDTH / CELL_SIZE, []);
  const boardRows = useMemo(() => BOARD_HEIGHT / CELL_SIZE, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    ctx.fillStyle = "#f00";
    ctx.fillRect(
      foodRef.current.x * CELL_SIZE,
      foodRef.current.y * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE,
    );

    ctx.fillStyle = "#fff";
    for (const segment of snakeRef.current) {
      ctx.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE,
      );
    }
  }, []);

  const resetGame = useCallback(() => {
    snakeRef.current = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ];
    directionRef.current = "right";
    foodRef.current = getRandomFood(snakeRef.current);
    gameOverRef.current = false;
    setScore(0);
    setIsRunning(true);
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      const keyDirectionMap: Record<string, Direction> = {
        arrowup: "up",
        w: "up",
        arrowdown: "down",
        s: "down",
        arrowleft: "left",
        a: "left",
        arrowright: "right",
        d: "right",
      };

      const nextDirection = keyDirectionMap[key];
      if (!nextDirection) return;

      // Prevent browser scrolling when using keyboard controls in game page.
      event.preventDefault();

      if (!isOppositeDirection(directionRef.current, nextDirection)) {
        directionRef.current = nextDirection;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const timer = window.setInterval(() => {
      if (gameOverRef.current) return;

      const snake = snakeRef.current;
      const head = snake[0];
      const delta = DIRECTIONS[directionRef.current];
      const nextHead = { x: head.x + delta.x, y: head.y + delta.y };

      const hitWall =
        nextHead.x < 0 ||
        nextHead.y < 0 ||
        nextHead.x >= boardCols ||
        nextHead.y >= boardRows;

      const hitSelf = snake.some(
        (segment) => segment.x === nextHead.x && segment.y === nextHead.y,
      );

      if (hitWall || hitSelf) {
        gameOverRef.current = true;
        setIsRunning(false);
        return;
      }

      const nextSnake = [nextHead, ...snake];
      const ateFood =
        nextHead.x === foodRef.current.x && nextHead.y === foodRef.current.y;

      if (!ateFood) {
        nextSnake.pop();
      } else {
        setScore(nextSnake.length - 3);
        foodRef.current = getRandomFood(nextSnake);
      }

      snakeRef.current = nextSnake;
      draw();
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, [boardCols, boardRows, draw, isRunning]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center gap-6 px-4 py-12">
      <h1 className="text-3xl font-semibold">Snake 2020 (Web)</h1>
      <p className="text-sm text-neutral-500">
        Controls: Arrow keys or WASD. Eat red food to grow.
      </p>

      <canvas
        ref={canvasRef}
        width={BOARD_WIDTH}
        height={BOARD_HEIGHT}
        className="max-w-full rounded border border-neutral-700 bg-black"
      />

      <div className="flex items-center gap-4 text-sm">
        <span>Score: {score}</span>
        {!isRunning && (
          <span className="text-red-500">{gameOverRef.current ? "Game Over" : "Ready"}</span>
        )}
      </div>

      <button
        type="button"
        onClick={resetGame}
        className="rounded bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200"
      >
        {isRunning ? "Restart" : "Start / Restart"}
      </button>
    </main>
  );
}
