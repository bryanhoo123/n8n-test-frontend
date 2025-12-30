"use client";

export default function Home() {
  const handleClick = async () => {
    await fetch("/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Hello from Next.js",
        time: new Date().toISOString(),
      }),
    });

    alert("Sent to n8n!");
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Hello 👋</h1>
      <p>This page is now connected to n8n.</p>

      <button onClick={handleClick}>
        Send to n8n
      </button>
    </main>
  );
}
