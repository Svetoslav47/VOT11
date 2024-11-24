const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017';
console.log(mongoURI);

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("Could not connect to MongoDB", err));

const messageSchema = new mongoose.Schema({
    room: String,
    message: String,
    sender: String,
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);



const io = require('socket.io')(3000, {
    cors: {
        origin: ['http://localhost:5173','http://localhost:3001','https://admin.socket.io'],
        methods: ["GET", "POST"],
    },
});

io.on("connection", socket => {
    console.log('A user connected with ID:', socket.id);

    socket.on('join-room', async (room, cb) => {
        socket.join(room);

        const messages = await Message.find({ room }).sort({ timestamp: 1 });

        cb(`Joined ${room}`, messages);
    });

    socket.on('send-message', async (message, room) => {
        const newMessage = new Message({
            room: room || 'global',
            message: message,
            sender: socket.id,
        });

        await newMessage.save();

        if (room === '') {
            socket.broadcast.emit('receive-message', `${socket.id}: ${message}`);
            console.log(message);
        } else {
            socket.to(room).emit('receive-message', message);
        }
    });

    //instrument(io, { auth: false });
});
