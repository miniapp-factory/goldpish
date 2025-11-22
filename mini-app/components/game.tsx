"use client";

import { useEffect, useState } from "react";

type Coin = {
  id: number;
  row: number;
  col: number;
};

export default function Game() {
  const rows = 4;
  const cols = 6;
  const [fishPos, setFishPos] = useState({ row: rows - 1, col: Math.floor(cols / 2) });
  const [coins, setCoins] = useState<Coin[]>([]);
  const [eaten, setEaten] = useState(0);
  const [missed, setMissed] = useState(0);
  const [health, setHealth] = useState(100);
  const [intervalMs, setIntervalMs] = useState(2000);

  // Drop coins at random intervals
  useEffect(() => {
    const drop = () => {
      const id = Date.now();
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      setCoins((prev) => [...prev, { id, row, col }]);
    };
    const timer = setInterval(drop, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  // Move fish left/right
  const moveFish = (dir: -1 | 1) => {
    setFishPos((prev) => ({
      ...prev,
      col: Math.max(0, Math.min(cols - 1, prev.col + dir)),
    }));
  };

  // Check collisions and update state
  useEffect(() => {
    setCoins((prev) =>
      prev.filter((coin) => {
        if (coin.row === fishPos.row && coin.col === fishPos.col) {
          setEaten((e) => e + 1);
          // Increase frequency every 5 coins eaten
          if ((eaten + 1) % 5 === 0) {
            setIntervalMs((ms) => Math.max(500, ms - 200));
          }
          // Gain health every 6 coins eaten
          if ((eaten + 1) % 6 === 0) {
            setHealth((h) => Math.min(100, h + 10));
          }
          return false; // remove coin
        }
        // Missed coin if it reaches bottom row
        if (coin.row === rows - 1) {
          setMissed((m) => m + 1);
          if (missed + 1 >= 3) {
            alert("Game Over! You missed 3 coins.");
            // Reset game
            setCoins([]);
            setEaten(0);
            setMissed(0);
            setHealth(100);
            setIntervalMs(2000);
          }
          return false; // remove coin
        }
        return true;
      })
    );
  }, [coins, fishPos, eaten, missed, rows]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-rows-4 grid-cols-6 gap-1">
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const isFish = r === fishPos.row && c === fishPos.col;
            const coin = coins.find((c) => c.row === r && c.col === c);
            return (
              <div
                key={`${r}-${c}`}
                className="w-12 h-12 flex items-center justify-center border border-gray-300"
              >
                {isFish && <span role="img" aria-label="gold fish">🐠</span>}
                {coin && <span role="img" aria-label="coin">🪙</span>}
              </div>
            );
          })
        )}
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => moveFish(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          ←
        </button>
        <button
          onClick={() => moveFish(1)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          →
        </button>
      </div>
      <div className="text-sm">
        <p>Eaten: {eaten}</p>
        <p>Missed: {missed}</p>
        <p>Health: {health}</p>
      </div>
    </div>
  );
}
