import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
console.log(`Listening for ${wss.address().address}${wss.address().port}`);

wss.on('connection', function connection(ws) {
  console.log("New connection");

  ws.on('error', console.error);

  ws.on('message', function message(rawData) {
    const data = JSON.parse(rawData);
    console.log('received: %s', data);
    console.log('sending: %s', data);
    ws.send(JSON.stringify({msg:data.msg}));
  });

  ws.send(JSON.stringify({msg:'You are now connected. I will respond with the same message as you send me'}));
});

