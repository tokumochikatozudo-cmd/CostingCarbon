// netlify/functions/gaia.js
// Serverless proxy — keeps GEMINI_API_KEY out of client-side code
// Set GEMINI_API_KEY in Netlify → Site → Environment Variables

exports.handler = async function (event) {
  // CORS headers (allow same-origin and Netlify preview URLs)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'X-Accel-Buffering': 'no',
  };

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const GEMINI_KEY = process.env.neobeta || process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server misconfiguration: GEMINI_API_KEY not set.' }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { systemPrompt, messages } = payload;

  const geminiBody = {
    system_instruction: { parts: [{ text: systemPrompt || '' }] },
    contents: (messages || []).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      temperature: 0.82,
      maxOutputTokens: 8192,
      topP: 0.92,
    },
  };

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_KEY}`;

  // Netlify Functions don't support true streaming responses, so we collect
  // all SSE chunks from Gemini and return the full assembled text as JSON.
  // The client side reconstructs the typing effect from the text.
  try {
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return {
        statusCode: geminiRes.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Gemini API error', detail: errText }),
      };
    }

    // Read the SSE stream and collect all text chunks
    const rawSSE = await geminiRes.text();
    let fullText = '';
    const lines = rawSSE.split('\n');
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const dataStr = line.slice(6).trim();
      if (!dataStr || dataStr === '[DONE]') continue;
      try {
        const chunk = JSON.parse(dataStr);
        const part = chunk?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (part) fullText += part;
      } catch { /* skip malformed chunks */ }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: fullText }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Proxy error', detail: err.message }),
    };
  }
};
