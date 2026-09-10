const http = require('http');
let orders = [];
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
  if (req.url === '/api/orders' && req.method === 'POST') {
    let body = ''; req.on('data', c => body += c);
    req.on('end', () => {
      const d = JSON.parse(body);
      const newOrder = { id: Date.now(), ...d, status: 'Pending', date: new Date().toLocaleString() };
      orders.unshift(newOrder);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({success:true, order:newOrder}));
    });
  } else if (req.url === '/api/orders' && req.method === 'GET') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(orders));
  } else {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: "I AM BOSS API LIVE 🔥", total_orders: orders.length }));
  }
});
server.listen(10000);
