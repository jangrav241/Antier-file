// Vercel serverless function — proxies calls to the EWMS API.
//
// WHY THIS EXISTS: the browser can't call api-ewms.antiers.work directly
// because that server doesn't send the CORS headers browsers require for
// cross-origin requests. This function runs on Vercel's servers instead
// (server-to-server calls aren't subject to CORS), so the browser just
// calls this same-origin endpoint, e.g.:
//   /api/ewms?quarter=Q2&year=2026
// and this function fetches the real data behind the scenes and returns it.
//
// This file needs no setup — just commit it to the repo at api/ewms.js
// (same repo/folder level as index.html) and Vercel auto-detects and
// deploys it as a serverless function.

export default async function handler(req, res) {
  const { quarter = 'Q2', year = '2026' } = req.query;

  const targetUrl = `https://api-ewms.antiers.work/payment-milestone/open/quarterly-projection?quarter=${encodeURIComponent(quarter)}&year=${encodeURIComponent(year)}`;

  try {
    const response = await fetch(targetUrl);
    const data = await response.json();

    // Allow the dashboard (same domain) to read this — harmless same-site default,
    // included in case you ever call this from a different domain too.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(response.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach EWMS API', detail: String(err) });
  }
}
