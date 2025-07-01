export async function GET() {
  const response = await fetch('https://aquaanalyzer.onrender.com/video_feed');
  return new Response(response.body, {
    headers: {
      'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
    },
  });
}
