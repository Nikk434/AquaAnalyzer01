export async function GET(req) {
  try {
    const API_BASE_URL = "https://aqua-analyzer-backend.nllnwr.easypanel.host";
    const flaskEndpoint = `${API_BASE_URL}/analyze_stream`; // Changed to /analyze/stream

    const flaskResponse = await fetch(flaskEndpoint, {
      method: "GET", // Changed to GET
      headers: {
        "Accept": "text/event-stream"
      }
      // Removed body since it's GET request
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
        "Content-Type": "text/event-stream",
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

// If you also want a one-time data fetch endpoint
// export async function POST(req) {
//   try {
//     const API_BASE_URL = "http://127.0.0.1:5000";
//     const flaskEndpoint = `${API_BASE_URL}/analyze`; // One-time GET request

//     const flaskResponse = await fetch(flaskEndpoint, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json"
//       }
//     });

//     if (!flaskResponse.ok) {
//       throw new Error("Flask API returned error");
//     }

//     const data = await flaskResponse.json();
    
//     return new Response(JSON.stringify(data), {
//       status: 200,
//       headers: { "Content-Type": "application/json" }
//     });

//   } catch (error) {
//     console.error("Error in Next.js API:", error);
//     return new Response(JSON.stringify({ error: "Internal Server Error" }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }