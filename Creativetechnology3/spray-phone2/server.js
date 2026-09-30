/**
 * Street Spray · Phone Edition — relay server
 *
 * Laptop (connected to the big screen) runs this file.
 *   - Serves the display page  →  http://localhost:3001
 *   - Serves the phone page    →  <public https url>/phone
 *   - Relays phone motion data to every display over WebSocket (/ws)
 *   - Starts a free Cloudflare quick tunnel so phones get an HTTPS URL.
 *     iOS only exposes motion sensors to HTTPS pages, so this matters.
 *
 * Usage:  npm install  →  npm start
 *         NO_TUNNEL=1 npm start   (LAN only; Android/desktop testing)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT) || 3001;
const ROOT = __dirname;

// ---------- Static files: a fixed route table, nothing else is exposed ----------
const ROUTES = {
  '/':                   ['public/display.html', 'text/html; charset=utf-8'],
  '/display':            ['public/display.html', 'text/html; charset=utf-8'],
  '/phone':              ['public/phone.html',   'text/html; charset=utf-8'],
  '/vendor/p5.min.js':   ['node_modules/p5/lib/p5.min.js', 'text/javascript'],
  '/vendor/qrcode.js':   ['node_modules/qrcode-generator/qrcode.js', 'text/javascript'],
};

let publicUrl = null;   // https://xxxx.trycloudflare.com once the tunnel is up
const lanUrl = (() => {
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list || []) if (i.family === 'IPv4' && !i.internal) return `http://${i.address}:${PORT}`;
  }
  return `http://localhost:${PORT}`;
})();

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/config') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify({ publicUrl, lanUrl }));
  }
  const route = ROUTES[url.pathname];
  if (!route) { res.writeHead(404); return res.end('Not found'); }
  fs.readFile(path.join(ROOT, route[0]), (err, data) => {
    if (err) { res.writeHead(500); return res.end('Missing file: ' + route[0]); }
    res.writeHead(200, { 'Content-Type': route[1], 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

// ---------- WebSocket relay ----------
const wss = new WebSocketServer({ server, path: '/ws' });
const displays = new Set();
const phones = new Map();   // ws -> { id }
let nextId = 1;

function toDisplays(msg) {
  const s = JSON.stringify(msg);
  for (const d of displays) if (d.readyState === 1) d.send(s);
}
function toPhones(msg) {
  const s = JSON.stringify(msg);
  for (const p of phones.keys()) if (p.readyState === 1) p.send(s);
}
function roster() {
  toPhones({ t: 'roster', displays: displays.size, players: phones.size });
}

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => (ws.isAlive = true));

  ws.on('message', (raw) => {
    let m;
    try { m = JSON.parse(raw); } catch { return; }

    if (m.t === 'hello' && m.role === 'display') {
      displays.add(ws);
      ws.send(JSON.stringify({ t: 'config', publicUrl, lanUrl }));
      for (const { id } of phones.values()) ws.send(JSON.stringify({ t: 'join', id }));
      roster();
      return;
    }
    if (m.t === 'hello' && m.role === 'phone') {
      const id = nextId++;
      phones.set(ws, { id });
      ws.send(JSON.stringify({ t: 'welcome', id }));
      toDisplays({ t: 'join', id });
      roster();
      console.log(`📱 phone #${id} connected (${phones.size} total)`);
      return;
    }

    // Everything else from a phone is forwarded with its id attached
    const p = phones.get(ws);
    if (!p) return;
    if (m.t === 'p') {
      const out = { t: 'p', id: p.id, x: +m.x, y: +m.y, s: m.s ? 1 : 0 };
      if (Number.isInteger(m.b) && m.b >= 0 && m.b < 16) out.b = m.b;          // brush index
      if (typeof m.c === 'string' && /^#[0-9a-f]{6}$/i.test(m.c)) out.c = m.c;  // color
      toDisplays(out);
    }
    if (m.t === 'shake')  toDisplays({ t: 'shake', id: p.id });
    if (m.t === 'clear')  toDisplays({ t: 'clear', id: p.id });
  });

  ws.on('close', () => {
    if (displays.delete(ws)) return roster();
    const p = phones.get(ws);
    if (p) {
      phones.delete(ws);
      toDisplays({ t: 'leave', id: p.id });
      roster();
      console.log(`📱 phone #${p.id} left`);
    }
  });
});

// Drop dead connections (phone locked, Wi-Fi lost…)
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }
    ws.isAlive = false;
    ws.ping();
  }
}, 5000);

// ---------- HTTPS tunnel for phones ----------
function startTunnel() {
  if (process.env.NO_TUNNEL) return;
  let proc;
  try {
    proc = spawn('cloudflared', ['tunnel', '--no-autoupdate', '--url', `http://localhost:${PORT}`]);
  } catch (e) { return tunnelMissing(); }
  proc.on('error', tunnelMissing);
  const onData = (buf) => {
    const hit = String(buf).match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (hit && !publicUrl) {
      publicUrl = hit[0];
      toDisplays({ t: 'config', publicUrl, lanUrl });
      console.log(`\n✅ Phone URL (HTTPS): ${publicUrl}/phone`);
      console.log('   The QR code on the display points here.\n');
    }
  };
  proc.stdout.on('data', onData);
  proc.stderr.on('data', onData);
  process.on('exit', () => proc.kill());
  process.on('SIGINT', () => { proc.kill(); process.exit(0); });
}
function tunnelMissing() {
  console.log('\n⚠️  cloudflared not found, so phones only get a plain HTTP LAN address.');
  console.log('   iPhones block motion sensors on HTTP. Install it once with:');
  console.log('     brew install cloudflared');
  console.log(`   LAN URL (Android/desktop testing only): ${lanUrl}/phone\n`);
}

server.listen(PORT, () => {
  console.log('\n🎨 STREET SPRAY · Phone Edition');
  console.log(`   Big screen: open  http://localhost:${PORT}  and press F for fullscreen`);
  startTunnel();
});
