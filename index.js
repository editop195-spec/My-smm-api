const http = require('http');
let orders = [];

const SMMSTONE_API_URL = 'https://smmstone.com/api/v2';
const SMMSTONE_API_KEY = '6ffbbbfbd82948198b143aea77ea7ac1';

// Aapka Service 101 = SMMStone ka 2351 (Followers)
// Agar SMMStone ka ID alag hai to yahan change kar dena
const SERVICE_MAP = {
  '101': '1580', // <-- Ye SMMStone ka main Followers ID hai, 90% yahi hota hai
  '102': '1971', // Likes
  '103': '1975' // Views
};

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  if (req.url === '/api/orders' && req.method === 'POST') {
    let body = ''; req.on('data', c => body += c);
    req.on('end', () => {
      const d = JSON.parse(body);
      const newOrder = { id: Date.now(),...d, status: 'Pending', date: new Date().toLocaleString() };
      orders.unshift(newOrder);
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({success:true, order:newOrder}));
    });
  }
  else if (req.url === '/api/orders' && req.method === 'GET') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(orders));
  }
  else if (req.url.startsWith('/api/confirm/') && req.method === 'GET') {
    const id = req.url.split('/')[3];
    const order = orders.find(o => o.id == id);
    if(!order){ res.end(JSON.stringify({success:false})); return; }

    console.log('Boss ne Confirm dabaya, ab SMMStone par bhej raha hu...', order);

    try {
      const smmServiceId = SERVICE_MAP[order.service] || '1580';
      const params = new URLSearchParams();
      params.append('key', SMMSTONE_API_KEY);
      params.append('action', 'add');
      params.append('service', smmServiceId);
      params.append('link', order.link);
      params.append('quantity', order.quantity);

      const smmRes = await fetch(SMMSTONE_API_URL, { method: 'POST', body: params });
      const smmData = await smmRes.json();
      console.log('SMMStone Response:', smmData);

      if(smmData.order){
        orders = orders.map(o => o.id == id? {...o, status: 'Completed', supplier_order_id: smmData.order} : o);
      } else {
        orders = orders.map(o => o.id == id? {...o, status: 'Error: '+JSON.stringify(smmData)} : o);
      }
    } catch(e){
      console.log('Error:', e);
      orders = orders.map(o => o.id == id? {...o, status: 'Completed (API Error but Marked)'} : o);
    }

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({success:true}));
  }
  else {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ message: "I AM BOSS - AUTO MODE ON 🔥", total_orders: orders.length, orders }));
  }
});
server.listen(10000);
