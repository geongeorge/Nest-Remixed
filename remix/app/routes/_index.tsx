import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const [count, setCount] = useState(1);
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Nest Remixed!</h1>
      <ul>
        <li>All /api routes go to Nest js</li>
        <li>All /build and /assets is served by nest from /remix/public</li>
        <li>All other routes go to Remix</li>
      </ul>
      <p>
        <button onClick={() => setCount(count + 1)}>Count {count}</button>
      </p>
    </div>
  );
}
