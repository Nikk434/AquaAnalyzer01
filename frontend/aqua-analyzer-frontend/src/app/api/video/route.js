export async function GET() {
  const response = await fetch('https://aqua-analyzer-backend.nllnwr.easypanel.host/video_feed');
  return new Response(response.body, {
    headers: {
      'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
    },
  });
}
