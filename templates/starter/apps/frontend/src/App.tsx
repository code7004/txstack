import { TxButton } from "@txstack/ui";
import { useState } from "react";

type Health = { status: string; env: string };

export function App() {
  const [health, setHealth] = useState<Health | string>();

  const check = async () => {
    try {
      const response = await fetch("/api/health");
      setHealth(response.ok ? ((await response.json()) as Health) : `HTTP ${response.status}`);
    } catch (error) {
      setHealth(String(error));
    }
  };

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">frontend</h1>
      <p>backend 와 이어졌는지 확인합니다.</p>
      <div>
        <TxButton label="GET /api/health" onClick={check} />
      </div>
      {health && <pre className="rounded bg-gray-100 p-3 text-sm">{typeof health === "string" ? health : JSON.stringify(health, null, 2)}</pre>}
    </main>
  );
}
