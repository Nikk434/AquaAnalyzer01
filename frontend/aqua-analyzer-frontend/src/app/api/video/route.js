export async function GET() {
  const response = await fetch('http://127.0.0.1:5000/video_feed');
  return new Response(response.body, {
    headers: {
      'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
    },
  });
}
