// Vercel serverless function — proxies calls to the EWMS API.
// CommonJS syntax (module.exports) for compatibility without package.json config.

module.exports = async (req, res) => {
  const quarter = (req.query && req.query.quarter) || 'Q2';
  const year = (req.query && req.query.year) || '2026';

  const targetUrl = `https://api-ewms.antiers.work/payment-milestone/open/quarterly-projection?quarter=${encodeURIComponent(quarter)}&year=${encodeURIComponent(year)}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        // Some APIs/WAFs block requests that don't look like they're
        // coming from a real browser. These headers mimic one.
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://api-ewms.antiers.work/'
      }
    });
    const text = await response.text();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (!response.ok) {
      res.status(response.status).send(text);
      return;
    }

    res.status(200).send(text);
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach EWMS API', detail: String(err && err.message || err) });
  }
};
