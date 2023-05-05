const app = require("express")();
const server = app.listen(3000, () => {});

const { timeStamp, timeLog } = require("console");
const SocketIO = require("socket.io");
const io = SocketIO(server, {path:"/socket.io"});

const time = new Date();
const timenow = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;

app.get("/", (req,res)=>{
    res.sendFile(__dirname+"/index.html")
})

io.on("connection", (socket)=>{
    const req = socket.request;

    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("new Client Connected", ip, socket.id, req.ip);

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
        msg = JSON.parse(msg);
        console.log(timenow);
        console.log("ID: "+msg.userId);
        console.log("message: "+msg.msg);
        console.log("---------------");
    })
    
    socket.interval = setInterval(()=>{
        socket.emit("news", "Hello Socket.IO");
    }, 10000);
    
})