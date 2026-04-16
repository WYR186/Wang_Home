import Link from "next/link";

const gameItems = [
  {
    title: "Snake 2020",
    description: "Classic snake with WASD/arrow controls.",
    href: "/snake-2020/",
    cta: "Play Snake",
  },
  {
    title: "2048",
    description: "Combine tiles to reach 2048.",
    href: "/games/2048/",
    cta: "Play 2048",
  },
  {
    title: "Maze Solver",
    description: "Generate a random maze and solve with DFS/BFS/Dijkstra/A*.",
    href: "/games/maze-solver/",
    cta: "Run Maze Solver",
  },
];

export default function GamesPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-semibold">Games</h1>
        <p className="mt-3 text-sm text-neutral-500">Choose a game to start playing.</p>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        {gameItems.map((game) => (
          <article
            key={game.href}
            className="rounded-xl border border-neutral-200 bg-background p-6 shadow-sm dark:border-neutral-800"
          >
            <h2 className="text-2xl font-semibold">{game.title}</h2>
            <p className="mt-3 text-sm text-neutral-500">{game.description}</p>
            <Link
              href={game.href}
              className="mt-6 inline-flex rounded bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200"
            >
              {game.cta}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
