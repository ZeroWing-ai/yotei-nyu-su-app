// Minimal WebSocket lobby/presence server for up to 50 players per match.
// Run: node server/server.js
// This is a presence sync server (not authoritative physics).

import http from 'http';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 8787;

const server = http.createServer();
const wss = new WebSocketServer({ server });

// One shared room "island" for simplicity
const room = {
  clients: new Map(), // ws -> { id, name, desired }
  seq: 1,
};

function broadcast(obj) {
  const msg = JSON.stringify(obj);
  for (const ws of room.clients.keys()) {
    if (ws.readyState === 1 /* OPEN */) ws.send(msg);
  }
}

function peersSnapshot() {
  const peers = [];
  for (const [ws, meta] of room.clients.entries()) {
    peers.push({ id: meta.id, name: meta.name || 'player' });
  }
  return peers;
}

wss.on('connection', (ws) => {
  const id = `p${room.seq++}`;
  room.clients.set(ws, { id, name: `user-${id}`, desired: 20 });
  ws.send(JSON.stringify({ t: 'welcome', id }));
  broadcast({ t: 'peers', peers: peersSnapshot() });

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      const meta = room.clients.get(ws);
      if (!meta) return;
      if (msg.t === 'join') {
        meta.name = (msg.name || '').slice(0, 24) || meta.name;
        meta.desired = Math.max(10, Math.min(50, msg.desired || 20));
        broadcast({ t: 'peers', peers: peersSnapshot() });
      } else if (msg.t === 'state') {
        // Forward state to others
        msg.id = meta.id;
        for (const [other, _] of room.clients.entries()) {
          if (other !== ws && other.readyState === 1) other.send(JSON.stringify(msg));
        }
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    room.clients.delete(ws);
    broadcast({ t: 'peers', peers: peersSnapshot() });
  });
});

server.listen(PORT, () => {
  console.log(`Island Royale WS server listening on :${PORT}`);
});
