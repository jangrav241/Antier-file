// Vercel serverless function — proxies calls to the EWMS API.
// CommonJS syntax used deliberately (module.exports, not `export default`)
// so this works without needing a package.json with "type": "module".

module.exports = async (req, res) => {
  const quarter = (req.query && req.query.quarter) || 'Q2';
  const year = (req.query && req.query.year) || '2026';

  const targetUrl = `https://api-ewms.antiers.work/payment-milestone/open/quarterly-projection?quarter=${encodeURIComponent(quarter)}&year=${encodeURIComponent(year)}`;

  try {
    const response = await fetch(targetUrl);
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
