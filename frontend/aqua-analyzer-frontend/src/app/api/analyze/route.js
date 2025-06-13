export async function POST(req) {
  try {
    const body = await req.json();
    const API_BASE_URL = "http://127.0.0.1:5000";
    const flaskEndpoint = `${API_BASE_URL}/analyze`;

    const flaskResponse = await fetch(flaskEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!flaskResponse.ok) {
      throw new Error("Flask API returned error");
    }

    // Create a readable stream to pass chunks to frontend
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = flaskResponse.body.getReader();
    const decoder = new TextDecoder();

    async function pushStream() {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        await writer.write(chunk);
      }
      writer.close();
    }

    pushStream();

    return new Response(readable, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream", // Keep this to support live frontend updates
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (error) {
    console.error("Error in Next.js API:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
