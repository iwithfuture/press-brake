module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const chunks = [];
  let size = 0;
  const maxBytes = 8 * 1024 * 1024;

  try {
    for await (const chunk of req) {
      size += chunk.length;
      if (size > maxBytes) {
        res.status(413).json({ ok: false, error: 'Inquiry payload is too large' });
        return;
      }
      chunks.push(chunk);
    }

    console.log('press_brake_inquiry_received', {
      contentType: req.headers['content-type'] || '',
      bytes: size,
      receivedAt: new Date().toISOString(),
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('press_brake_inquiry_error', error);
    res.status(500).json({ ok: false, error: 'Unable to receive inquiry' });
  }
};
