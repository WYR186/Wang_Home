"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocaleStore } from "@/lib/stores/localeStore";

type Algo = "bfs" | "dfs" | "dijkstra" | "astar";
type MazeSize = "small" | "medium" | "large";
type Dir = "top" | "right" | "bottom" | "left";

interface Cell {
  r: number;
  c: number;
}

interface CellWalls {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

interface MazeData {
  rows: number;
  cols: number;
  walls: CellWalls[][];
}

interface SearchResult {
  visitOrder: Cell[];
  path: Cell[];
  found: boolean;
  cameFrom: Map<string, string>;
  backtracks: number;
}

interface TeachingContext {
  algo: Algo;
  isRunning: boolean;
  found: boolean;
  step: number;
  totalVisited: number;
  currentNode: Cell | null;
  parentNode: Cell | null;
  backtracks: number;
  pathLength: number;
  locale: string;
  justBacktracked: boolean;
}

const SIZE_PRESETS: Record<MazeSize, { rows: number; cols: number; label: string }> = {
  small: { rows: 12, cols: 18, label: "Small 12x18" },
  medium: { rows: 18, cols: 28, label: "Medium 18x28" },
  large: { rows: 24, cols: 36, label: "Large 24x36" },
};
const FRAME_WIDTH = 760;
const FRAME_HEIGHT = 460;

function keyOf(cell: Cell): string {
  return `${cell.r},${cell.c}`;
}

function inBounds(r: number, c: number, rows: number, cols: number): boolean {
  return r >= 0 && r < rows && c >= 0 && c < cols;
}

function getNeighbors(cell: Cell, maze: MazeData): Cell[] {
  const current = maze.walls[cell.r][cell.c];
  const next: Cell[] = [];
  if (!current.top) next.push({ r: cell.r - 1, c: cell.c });
  if (!current.right) next.push({ r: cell.r, c: cell.c + 1 });
  if (!current.bottom) next.push({ r: cell.r + 1, c: cell.c });
  if (!current.left) next.push({ r: cell.r, c: cell.c - 1 });
  return next.filter((n) => inBounds(n.r, n.c, maze.rows, maze.cols));
}

function heuristic(a: Cell, b: Cell): number {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
}

function opposite(dir: Dir): Dir {
  if (dir === "top") return "bottom";
  if (dir === "right") return "left";
  if (dir === "bottom") return "top";
  return "right";
}

function generateMaze(rows: number, cols: number): MazeData {
  const walls: CellWalls[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      top: true,
      right: true,
      bottom: true,
      left: true,
    })),
  );
  const visited = new Set<string>();
  const stack: Cell[] = [{ r: 0, c: 0 }];
  visited.add("0,0");

  const dirs: Array<{ dr: number; dc: number; dir: Dir }> = [
    { dr: -1, dc: 0, dir: "top" },
    { dr: 0, dc: 1, dir: "right" },
    { dr: 1, dc: 0, dir: "bottom" },
    { dr: 0, dc: -1, dir: "left" },
  ];

  while (stack.length) {
    const cur = stack[stack.length - 1];
    const options = dirs
      .map((d) => ({ nr: cur.r + d.dr, nc: cur.c + d.dc, dir: d.dir }))
      .filter((n) => inBounds(n.nr, n.nc, rows, cols) && !visited.has(`${n.nr},${n.nc}`));

    if (!options.length) {
      stack.pop();
      continue;
    }

    const pick = options[Math.floor(Math.random() * options.length)];
    walls[cur.r][cur.c][pick.dir] = false;
    walls[pick.nr][pick.nc][opposite(pick.dir)] = false;
    visited.add(`${pick.nr},${pick.nc}`);
    stack.push({ r: pick.nr, c: pick.nc });
  }

  return { rows, cols, walls };
}

function buildPath(cameFrom: Map<string, string>, start: Cell, goal: Cell): Cell[] {
  const startKey = keyOf(start);
  const path: Cell[] = [];
  let cur = keyOf(goal);
  while (cameFrom.has(cur) || cur === startKey) {
    const [r, c] = cur.split(",").map(Number);
    path.push({ r, c });
    if (cur === startKey) break;
    cur = cameFrom.get(cur)!;
  }
  return path.reverse();
}

function runSearch(maze: MazeData, start: Cell, goal: Cell, algo: Algo): SearchResult {
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>();
  const startKey = keyOf(start);
  const goalKey = keyOf(goal);
  const visitOrder: Cell[] = [];
  gScore.set(startKey, 0);

  if (algo === "dfs") {
    const stack: Cell[] = [start];
    const seen = new Set<string>([startKey]);
    while (stack.length) {
      const cur = stack.pop()!;
      visitOrder.push(cur);
      if (keyOf(cur) === goalKey) break;
      for (const n of getNeighbors(cur, maze)) {
        const nk = keyOf(n);
        if (seen.has(nk)) continue;
        seen.add(nk);
        cameFrom.set(nk, keyOf(cur));
        stack.push(n);
      }
    }
  } else {
    const frontier: Array<{ cell: Cell; priority: number }> = [{ cell: start, priority: 0 }];
    const seen = new Set<string>();
    while (frontier.length) {
      let idx = 0;
      let best = Number.POSITIVE_INFINITY;
      for (let i = 0; i < frontier.length; i += 1) {
        if (frontier[i].priority < best) {
          best = frontier[i].priority;
          idx = i;
        }
      }
      const [{ cell: cur }] = frontier.splice(idx, 1);
      const curKey = keyOf(cur);
      if (seen.has(curKey)) continue;
      seen.add(curKey);
      visitOrder.push(cur);
      if (curKey === goalKey) break;

      for (const n of getNeighbors(cur, maze)) {
        const nk = keyOf(n);
        const nextG = (gScore.get(curKey) ?? 0) + 1;
        if (nextG < (gScore.get(nk) ?? Number.POSITIVE_INFINITY)) {
          cameFrom.set(nk, curKey);
          gScore.set(nk, nextG);
          let priority = nextG;
          if (algo === "astar") priority += heuristic(n, goal);
          if (algo === "bfs") priority = visitOrder.length + frontier.length;
          frontier.push({ cell: n, priority });
        }
      }
    }
  }

  let backtracks = 0;
  for (let i = 1; i < visitOrder.length; i += 1) {
    const prevKey = keyOf(visitOrder[i - 1]);
    const curParent = cameFrom.get(keyOf(visitOrder[i]));
    if (curParent && curParent !== prevKey) {
      backtracks += 1;
    }
  }

  if (!cameFrom.has(goalKey) && goalKey !== startKey) {
    return { visitOrder, path: [], found: false, cameFrom, backtracks };
  }
  return { visitOrder, path: buildPath(cameFrom, start, goal), found: true, cameFrom, backtracks };
}

function toPoint(cell: Cell, cellSize: number, margin: number): string {
  const x = margin + cell.c * cellSize + cellSize / 2;
  const y = margin + cell.r * cellSize + cellSize / 2;
  return `${x},${y}`;
}

function buildTeachingExplanation(ctx: TeachingContext): string[] {
  const isChinese = ctx.locale.startsWith("zh");

  const t = {
    init: isChinese
      ? "正在初始化搜索。算法会先从起点开始，把起点加入待扩展集合。"
      : "Initializing search. The algorithm starts from the source node and inserts it into the frontier.",
    doneFound1: isChinese
      ? `搜索结束：已找到可行路径，路径长度为 ${ctx.pathLength}。`
      : `Search finished: a valid route is found with path length ${ctx.pathLength}.`,
    doneFound2: isChinese
      ? "最终路径通过回溯 parent 指针生成，这是图搜索算法的标准回溯过程。"
      : "The final route is reconstructed by backtracking parent pointers, which is the standard graph-search reconstruction step.",
    doneFail1: isChinese
      ? "搜索结束：当前迷宫中未找到到达终点的路径。"
      : "Search finished: no route to the goal exists in the current maze.",
    doneFail2: isChinese
      ? "这表示可扩展节点已耗尽，算法终止。"
      : "This means the frontier is exhausted, so the algorithm terminates.",
    nodePrefix: isChinese ? "当前处理节点是" : "Current expanded node:",
    fromPrefix: isChinese ? "它来自父节点" : "Its parent node is",
    root: isChinese ? "它是起点节点，没有父节点。" : "It is the start node, so it has no parent.",
    backtrackNow: isChinese
      ? "本步发生回退：因为上一分支已无可继续扩展的有效节点，算法切换到另一个待扩展分支。"
      : "A backtrack happens at this step: the previous branch cannot continue, so the algorithm switches to another pending branch.",
  };

  if (!ctx.currentNode) {
    return [t.init];
  }

  const nodeText = isChinese
    ? `${t.nodePrefix} (${ctx.currentNode.r}, ${ctx.currentNode.c})。`
    : `${t.nodePrefix} (${ctx.currentNode.r}, ${ctx.currentNode.c}).`;
  const parentText = ctx.parentNode
    ? isChinese
      ? `${t.fromPrefix} (${ctx.parentNode.r}, ${ctx.parentNode.c})。`
      : `${t.fromPrefix} (${ctx.parentNode.r}, ${ctx.parentNode.c}).`
    : t.root;

  if (!ctx.isRunning) {
    if (ctx.found) {
      return [t.doneFound1, t.doneFound2];
    }
    return [t.doneFail1, t.doneFail2];
  }

  if (ctx.algo === "dfs") {
    const why = isChinese
      ? `DFS 使用栈做深度优先展开，优先沿一条分支不断深入；当前累计回退 ${ctx.backtracks} 次。`
      : `DFS uses a stack for depth-first expansion, diving deep along one branch first; cumulative backtracks so far: ${ctx.backtracks}.`;
    return [
      `${nodeText} ${parentText}`,
      ctx.justBacktracked ? `${t.backtrackNow} ${why}` : why,
    ];
  }

  if (ctx.algo === "bfs") {
    const why = isChinese
      ? "BFS 按“层”扩展：先访问离起点更近的节点，因此分叉时前锋会在同一层不同分支间切换。"
      : "BFS expands level by level: it visits nodes closer to the source first, so at forks the frontier naturally switches across branches on the same depth.";
    return [
      `${nodeText} ${parentText}`,
      ctx.justBacktracked ? `${t.backtrackNow} ${why}` : why,
    ];
  }

  if (ctx.algo === "dijkstra") {
    const why = isChinese
      ? "Dijkstra 每步选择当前已知总代价 g(n) 最小的未处理节点；在等权迷宫里常接近 BFS，但本质是“最小代价优先”。"
      : "Dijkstra always expands the unprocessed node with the smallest known g(n). In unit-cost mazes it often looks like BFS, but the principle is still lowest-cost-first.";
    return [
      `${nodeText} ${parentText}`,
      ctx.justBacktracked ? `${t.backtrackNow} ${why}` : why,
    ];
  }

  const why = isChinese
    ? "A* 每步选择 f(n)=g(n)+h(n) 最小节点：g 是已走成本，h 是到终点的启发式估计（这里用曼哈顿距离），因此更有目标性。"
    : "A* selects the node with minimum f(n)=g(n)+h(n): g is path cost so far and h is heuristic estimate to goal (Manhattan distance here), so expansion is more goal-directed.";
  return [
    `${nodeText} ${parentText}`,
    ctx.justBacktracked ? `${t.backtrackNow} ${why}` : why,
  ];
}

export default function MazeSolverPage() {
  const locale = useLocaleStore((state) => state.locale);
  const [mazeSize, setMazeSize] = useState<MazeSize>("medium");
  const [algo, setAlgo] = useState<Algo>("bfs");
  const [speedMs, setSpeedMs] = useState(120);
  const [isRunning, setIsRunning] = useState(true);
  const [step, setStep] = useState(0);
  const [showPath, setShowPath] = useState(false);

  const size = SIZE_PRESETS[mazeSize];
  const [maze, setMaze] = useState<MazeData>(() => generateMaze(size.rows, size.cols));

  const start = useMemo<Cell>(() => ({ r: 0, c: 0 }), []);
  const goal = useMemo<Cell>(() => ({ r: maze.rows - 1, c: maze.cols - 1 }), [maze.cols, maze.rows]);
  const result = useMemo(() => runSearch(maze, start, goal, algo), [algo, goal, maze, start]);

  useEffect(() => {
    setMaze(generateMaze(size.rows, size.cols));
  }, [size.cols, size.rows]);

  useEffect(() => {
    setStep(0);
    setShowPath(false);
    setIsRunning(true);
  }, [maze, algo]);

  useEffect(() => {
    if (!isRunning) return;
    if (step < result.visitOrder.length) {
      const timer = window.setTimeout(() => setStep((v) => v + 1), speedMs);
      return () => window.clearTimeout(timer);
    }
    if (!showPath) {
      const timer = window.setTimeout(() => {
        setShowPath(true);
        setIsRunning(false);
      }, 220);
      return () => window.clearTimeout(timer);
    }
  }, [isRunning, result.visitOrder.length, showPath, speedMs, step]);

  const visitSegments = useMemo(() => {
    const segments: Array<{ from: Cell; to: Cell }> = [];
    const visitedSlice = result.visitOrder.slice(0, step);
    for (const cell of visitedSlice) {
      const childKey = keyOf(cell);
      const parentKey = result.cameFrom.get(childKey);
      if (!parentKey) continue;
      const [pr, pc] = parentKey.split(",").map(Number);
      segments.push({ from: { r: pr, c: pc }, to: cell });
    }
    return segments;
  }, [result.cameFrom, result.visitOrder, step]);

  const pathPoints = useMemo(
    () => (showPath ? result.path.map((c) => toPoint(c, 22, 16)).join(" ") : ""),
    [result.path, showPath],
  );

  const width = 16 * 2 + maze.cols * 22;
  const height = 16 * 2 + maze.rows * 22;

  const statusText = isRunning ? "Solving..." : result.found ? `Solved in ${result.path.length} steps` : "No route found";
  const currentNode = step > 0 ? result.visitOrder[Math.min(step - 1, result.visitOrder.length - 1)] : null;
  const currentParent = currentNode ? result.cameFrom.get(keyOf(currentNode)) : null;
  const currentParentCell = currentParent
    ? (() => {
        const [r, c] = currentParent.split(",").map(Number);
        return { r, c };
      })()
    : null;
  const liveBacktracks = useMemo(() => {
    const visited = result.visitOrder.slice(0, Math.min(step, result.visitOrder.length));
    let count = 0;
    for (let i = 1; i < visited.length; i += 1) {
      const prevKey = keyOf(visited[i - 1]);
      const curParent = result.cameFrom.get(keyOf(visited[i]));
      if (curParent && curParent !== prevKey) count += 1;
    }
    return count;
  }, [result.cameFrom, result.visitOrder, step]);
  const justBacktracked = useMemo(() => {
    if (step < 2 || step > result.visitOrder.length) return false;
    const visited = result.visitOrder;
    const prevKey = keyOf(visited[step - 2]);
    const curParent = result.cameFrom.get(keyOf(visited[step - 1]));
    return Boolean(curParent && curParent !== prevKey);
  }, [result.cameFrom, result.visitOrder, step]);
  const openEstimate = Math.max(0, Math.min(step, result.visitOrder.length) - (showPath ? result.path.length : 0));
  const algorithmLogic =
    algo === "dfs"
      ? "Depth-first stack expansion, prioritizes deep branch before backtracking."
      : algo === "bfs"
        ? "Breadth-first expansion, explores layer by layer from the start."
        : algo === "dijkstra"
          ? "Uniform-cost expansion, always expands lowest known distance."
          : "A* expansion, chooses lowest f(n)=g(n)+h(n) with Manhattan heuristic.";
  const algorithmLabel = algo === "astar" ? "A*" : algo.toUpperCase();
  const teachingLines = useMemo(
    () =>
      buildTeachingExplanation({
        algo,
        isRunning,
        found: result.found,
        step,
        totalVisited: result.visitOrder.length,
        currentNode,
        parentNode: currentParentCell,
        backtracks: liveBacktracks,
        pathLength: result.path.length,
        locale,
        justBacktracked,
      }),
    [algo, currentNode, currentParentCell, isRunning, justBacktracked, liveBacktracks, locale, result.found, result.path.length, result.visitOrder.length, step],
  );

  const speedSliderValue = useMemo(() => 361 - speedMs, [speedMs]);
  const canStepForward = !isRunning && step < result.visitOrder.length;
  const stepHint = isRunning
    ? "Next Step is disabled while auto-run is active."
    : canStepForward
      ? "Paused mode: click Next Step to advance exactly one expansion."
      : "No further step available (search reached end).";
  const currentNodePoint = useMemo(() => {
    if (!currentNode) return null;
    const [x, y] = toPoint(currentNode, 22, 16).split(",").map(Number);
    return { x, y };
  }, [currentNode]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10">
      <div
        style={{ fontFamily: "Inter, Arial, sans-serif" }}
        className="rounded-2xl border border-neutral-700 bg-neutral-950 p-6 text-white shadow-xl"
      >
        <h1 className="text-4xl font-semibold text-white">Maze Solver</h1>
        <p className="mt-2 text-base text-neutral-300">Line-maze visualization with route overlay.</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <select
            value={algo}
            onChange={(e) => setAlgo(e.target.value as Algo)}
            className="rounded border px-3 py-2 text-sm"
            style={{ backgroundColor: "#fff", color: "#000", borderColor: "#888" }}
          >
            <option value="bfs">BFS</option>
            <option value="dfs">DFS</option>
            <option value="dijkstra">Dijkstra</option>
            <option value="astar">A*</option>
          </select>

          <select
            value={mazeSize}
            onChange={(e) => setMazeSize(e.target.value as MazeSize)}
            className="rounded border px-3 py-2 text-sm"
            style={{ backgroundColor: "#fff", color: "#000", borderColor: "#888" }}
          >
            <option value="small">{SIZE_PRESETS.small.label}</option>
            <option value="medium">{SIZE_PRESETS.medium.label}</option>
            <option value="large">{SIZE_PRESETS.large.label}</option>
          </select>

          <button
            type="button"
            onClick={() => setMaze(generateMaze(size.rows, size.cols))}
            className="rounded border px-4 py-2 text-sm"
            style={{ backgroundColor: "#fff", color: "#000", borderColor: "#888" }}
          >
            New Maze
          </button>
          <button
            type="button"
            onClick={() => {
              setStep(0);
              setShowPath(false);
              setIsRunning(true);
            }}
            className="rounded border px-4 py-2 text-sm"
            style={{ backgroundColor: "#fff", color: "#000", borderColor: "#888" }}
          >
            Replay
          </button>
          <button
            type="button"
            onClick={() => setIsRunning((v) => !v)}
            className="rounded border px-4 py-2 text-sm"
            style={{ backgroundColor: "#fff", color: "#000", borderColor: "#888" }}
          >
            {isRunning ? "Pause" : "Resume"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!canStepForward) return;
              setStep((v) => Math.min(v + 1, result.visitOrder.length));
            }}
            disabled={!canStepForward}
            className="rounded border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "#fff", color: "#000", borderColor: "#888" }}
            title={stepHint}
          >
            Next Step
          </button>

          <label className="ml-1 inline-flex items-center gap-2 text-sm text-neutral-300">
            Speed
            <input
              type="range"
              min={1}
              max={360}
              step={1}
              value={speedSliderValue}
              onChange={(e) => setSpeedMs(361 - Number(e.target.value))}
            />
            <span className="w-16 text-right text-sm text-neutral-300">{speedMs} ms</span>
          </label>
        </div>

        <div className="mt-3 text-sm text-neutral-200">
          {algorithmLabel} | visited: {Math.min(step, result.visitOrder.length)} | path:{" "}
          {showPath ? result.path.length : "-"} | {statusText}
        </div>
        <div className="mt-1 text-xs text-neutral-400">{stepHint}</div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-xl bg-white p-3">
            <div
              className="mx-auto flex items-center justify-center overflow-hidden rounded-lg bg-white"
              style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT, maxWidth: "100%" }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ display: "block" }}
              >
            {/* maze walls */}
            {maze.walls.map((row, r) =>
              row.map((cell, c) => {
                const x = 16 + c * 22;
                const y = 16 + r * 22;
                const right = x + 22;
                const bottom = y + 22;
                return (
                    <g key={`${r}-${c}`} stroke="#111" strokeWidth="2" strokeLinecap="square" vectorEffect="non-scaling-stroke">
                    {cell.top && <line x1={x} y1={y} x2={right} y2={y} />}
                    {cell.left && <line x1={x} y1={y} x2={x} y2={bottom} />}
                    {r === maze.rows - 1 && cell.bottom && <line x1={x} y1={bottom} x2={right} y2={bottom} />}
                    {c === maze.cols - 1 && cell.right && <line x1={right} y1={y} x2={right} y2={bottom} />}
                  </g>
                );
              }),
            )}

            {/* explored trail: draw valid parent-child edges only */}
            {visitSegments.map((segment, index) => {
              const [x1, y1] = toPoint(segment.from, 22, 16).split(",").map(Number);
              const [x2, y2] = toPoint(segment.to, 22, 16).split(",").map(Number);
              return (
                <line
                  key={`visit-${index}-${x1}-${y1}-${x2}-${y2}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#fca5a5"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              );
            })}

            {/* final route overlay */}
            {pathPoints && (
              <polyline
                points={pathPoints}
                fill="none"
                stroke="#fb7185"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.95"
              />
            )}

            {/* frontier/current expansion node highlight */}
            {currentNodePoint && (
              <>
                <circle
                  cx={currentNodePoint.x}
                  cy={currentNodePoint.y}
                  r="7"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3.5"
                  opacity="0.95"
                />
                <circle
                  cx={currentNodePoint.x}
                  cy={currentNodePoint.y}
                  r="10"
                  fill="none"
                  stroke="#f87171"
                  strokeWidth="2"
                  opacity="0.45"
                />
              </>
            )}

            <circle cx={16 + 11} cy={16 + 11} r="4" fill="#2563eb" />
            <circle cx={16 + (maze.cols - 1) * 22 + 11} cy={16 + (maze.rows - 1) * 22 + 11} r="4" fill="#06b6d4" />
              </svg>
            </div>
          </div>

          <aside className="rounded-xl border border-neutral-700 bg-neutral-900 p-4">
            <h2 className="text-xl font-semibold text-white">Runtime Panel</h2>
            <p className="mt-2 text-sm text-neutral-300">{algorithmLogic}</p>

            <div className="mt-4 space-y-2 text-sm text-neutral-200">
              <p>Current node: {currentNode ? `(${currentNode.r}, ${currentNode.c})` : "-"}</p>
              <p>
                Parent node:{" "}
                {currentParentCell ? `(${currentParentCell.r}, ${currentParentCell.c})` : "Root / None"}
              </p>
              <p>Backtrack count: {liveBacktracks}</p>
              <p>Open-set estimate: {openEstimate}</p>
              <p>Maze size: {maze.rows}x{maze.cols}</p>
            </div>

            <div className="mt-5 rounded-lg border border-neutral-700 bg-black/40 p-3">
              <h3 className="text-sm font-semibold text-white">Teaching Explanation (实时讲解)</h3>
              <div className="mt-2 h-44 overflow-y-auto space-y-2 pr-1 text-sm leading-6 text-neutral-200">
                {teachingLines.map((line, index) => (
                  <p key={`teaching-${index}`}>{line}</p>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
