import  express  from "express";
import "dotenv/config" ;
import cors from "cors" ;
import http from "http";
import { connectDB } from "./lib/db.js";
import messageRouter from "./routes/messageRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { Server} from "socket.io";


// create Express app and HTTP server

const app = express();
const server = http.createServer(app);


//Initialze socket.io server
export const io = new Server(server,{
    cors: {orgin: "*"}
})

//store online Users
export const userSocketMap = {}; //{userId: socketId}

//socket.io connection handler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected",userId);

    if(userId) userSocketMap[userId] = socket.id;

    //Emit online users to all connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("User Disconnected" ,userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})      


//Middleware setup

app.use(express.json( { limit:"10mb" } ));
app.use(cors());

await connectDB()

//Routes setup
app.use("/api/status" , (req,res)=> res.send("server is live"));
app.use("/api/auth" , userRouter);
app.use("/api/messages",messageRouter);

const PORT = process.env.PORT || 5001;
server.listen(PORT , ()=> console.log("server is running on PORT :" + PORT));