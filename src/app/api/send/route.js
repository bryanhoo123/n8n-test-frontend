export const runtime = "nodejs";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const message = formData.get("message");
    const sessionId = formData.get("sessionId");
    const image = formData.get("image");

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Missing sessionId" }),
        { status: 400 }
      );
    }

    const n8nFormData = new FormData();
    n8nFormData.append("message", message || "");
    n8nFormData.append("sessionId", sessionId);

    if (image) {
      n8nFormData.append("image", image, image.name);
    }

    const res = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: "POST",
      body: n8nFormData,
    });

    const text = await res.text();

    if (!res.ok) {
      throw new Error(text || "n8n webhook failed");
    }

    // n8n Respond to Webhook should return JSON
    let data = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { reply: text };
    }

    return Response.json(data);
  } catch (err) {
    console.error("API ERROR:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
