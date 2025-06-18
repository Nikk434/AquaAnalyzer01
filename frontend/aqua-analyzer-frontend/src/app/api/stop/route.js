// app/api/stop/route.js
export async function POST() {
  try {
    // Call your backend service or logic to stop the analysis
    // For example, forward the request to Flask backend:
    const response = await fetch('https://aqua-analyzer-backend.nllnwr.easypanel.host/stop_analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ message: data.error || 'Failed to stop analysis' }), { status: response.status });
    }

    return new Response(JSON.stringify({ success: true, message: data.message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}
