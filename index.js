const http = require("http");

let orders = [];

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }

  if (req.url === "/" || req.url === "/api") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ status: "success", message: "I AM BOSS API LIVE 🔥", total_orders: orders.length }));
  }

  if (req.url === "/api/orders" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(orders));
  }

  if (req.url === "/api/order" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        console.log("NEW ORDER AAYA:", data);
        const newOrder = { id: Date.now(), ...data, time: new Date().toLocaleString() };
        orders.push(newOrder);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, msg: "API Connected! Order Received", orderId: newOrder.id }));
      } catch(e) {
        res.writeHead(400);
        res.end("Invalid JSON");
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(process.env.PORT || 3000, () => console.log("Server Running"));
