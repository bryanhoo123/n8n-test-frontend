export async function POST(request) {
  const body = await request.json();

  const res = await fetch(process.env.N8N_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: "Failed to call n8n" }),
      { status: 500 }
    );
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200 }
  );
}
