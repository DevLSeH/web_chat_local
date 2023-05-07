const app = require("express")();
const server = app.listen(3000, () => {});

const { timeStamp, timeLog } = require("console");
const SocketIO = require("socket.io");
const io = SocketIO(server, {path:"/socket.io"});

app.get("/", (req,res)=>{
    res.sendFile(__dirname+"/index.html")
});

io.on("connection", (socket)=>{
    const req = socket.request;

    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("new Client Connected", ip, socket.id);

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

    socket.on("msg", (rawMsg)=>{
        msg = JSON.parse(rawMsg);
        console.log(`[${msg.time}]${msg.userId}: ${msg.msg}`);
        socket.broadcast.emit("msg", rawMsg);
    });
    
    socket.interval = setInterval(()=>{
        socket.emit("news", "Hello Socket.IO");
    }, 50000);
    
});