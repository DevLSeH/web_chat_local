const app = require("express")();
const server = app.listen(3000, () => {});

const { timeStamp, timeLog } = require("console");
const SocketIO = require("socket.io");
const io = SocketIO(server, {path:"/socket.io"});

function messages(roomName){
  this.roomName = roomName;
  this.msgLog = [];
}
let mainCount = 0;
const rooms = [];
function createRoom(roomName){
  const name = roomName;
  const path = "/"+name;
  const room= io.of(path);
  

  app.get(path, (req,res)=>{
      res.sendFile(__dirname+"/room.html")
  });
  
  const localCount = mainCount;
  mainCount += 1;
  rooms[localCount] = new messages(name);
  const msgLog = rooms[localCount].msgLog;
  
  room.on("connection", (socket)=>{
    const req = socket.request;
    
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("new Client Connected", ip, socket.id);

    socket.emit("msg", msgLog);

    socket.on("disconnect", ()=>{
        console.log('Client is Disconnected', ip, socket.id);
        clearInterval(socket.interval);
    });

    socket.on("error", (error)=>{
        console.error(error.message);
    });

    socket.on("reply", (data)=>{
        console.log(data);
    });

    socket.on("msg", (msg)=>{
        console.log(`[${msg['time']}]${msg['userId']}: ${msg['msg']}`);
        msgLog.push(msg);
        socket.emit("msg",msgLog);
        socket.broadcast.emit("msg", msgLog);
        console.log(msgLog);
    });
    
    socket.interval = setInterval(()=>{
        socket.emit("news", "Hello Socket.IO");
    }, 50000);
      
  });
}

const lobby = io.of("/");
app.get("/", (req,res)=>{
  res.sendFile(__dirname+"/lobby.html");
})
lobby.on("connection", (socket)=>{
  console.log("lobby connected");
  
  socket.on("create", (rawRoomInfo)=>{
  const roomInfo = JSON.parse(rawRoomInfo);
  const roomName = roomInfo.roomName;
  console.log("create room :"+roomName);
  createRoom(roomName);
  socket.emit("created", roomName);
})
})
    

createRoom("hi");