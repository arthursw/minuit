const WebSocket = require('ws');
const fs = require('fs');

send = (ws, type, data)=> {
    if(ws != null) {
        ws.send( JSON.stringify({type: type, data: data}) );
    }
}

let wsController = null;

let onMessage = (message)=> {
    let type = null;
    let data = null;
    try {
        let json = JSON.parse(message);
        type = json.type;
        data = json.data;
        console.log(json);
    } catch (e) {
        console.log(e);
    }
}


let onConnection = (ws)=> {
    console.log('WebSocket connected');
    wsController = ws
    ws.on('message', onMessage)
}

let wssController = new WebSocket.Server({ port: 4568 })
wssController.on('connection', onConnection)


fs.watch('js/shaders', (eventType, filename) => {

  let content = fs.readFileSync(__dirname + '/js/shaders/' + filename, 'utf8')
  const regex = /export let shader = `(.*)`;/gsm;
  let m = regex.exec(content)

  send(wsController, 'file-changed', {eventType: eventType, filename: filename, content: m[1]})

  console.log(`event type is: ${eventType}`);
  if (filename) {
    console.log(`filename provided: ${filename}`);
  } else {
    console.log('filename not provided');
  }
});


fs.watch('js/sounds', (eventType, filename) => {

  let content = fs.readFileSync(__dirname + '/js/sounds/' + filename, 'utf8')

  send(wsController, 'sound-file-changed', { eventType: eventType, filename: filename, content: content })

  console.log(`event type is: ${eventType}`);
  if (filename) {
    console.log(`filename provided: ${filename}`);
  } else {
    console.log('filename not provided');
  }
});