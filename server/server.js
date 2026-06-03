const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
})

const rooms = {};

const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function checkWinner(board) {

    for (let combo of wins) {

        const [a, b, c] = combo;

        if (board[a] && board[a] === board[b] && board[b] === board[c]) {
            return board[a];
        }
    }

    return null;
}

io.on("connection", (socket) => {
    console.log("User Connected: " + socket.id);

    socket.on("create-room", () => {
        const roomId = Math.random().toString(36).substring(2, 8);
        rooms[roomId] = {
            players: [socket.id],
            board: Array(9).fill(""),
            turn: "X",
        }
        socket.join(roomId);
        socket.emit("room-created", roomId);
    })

    socket.on("join-room", (roomId) => {
        const room = rooms[roomId];
        if (!room) {
            socket.emit("error", "Room does not exist");
            return;
        }
        if (room.players.length >= 2) {
            socket.emit("error", "Room is already full");
            return;
        }
        room.players.push(socket.id);
        socket.join(roomId);
        io.to(roomId).emit("Game Starts");
    })

    socket.on("make-move", ({ roomId, index }) => {

        const room = rooms[roomId];

        if (!room) return;

        if (room.board[index] !== "") return;

        const symbol =
            room.players[0] === socket.id ? "X" : "O";

        room.board[index] = symbol;

        room.turn = room.turn === "X"
            ? "O"
            : "X";

        io.to(roomId).emit("board-update", {
            board: room.board,
            turn: room.turn
        });
        const winner = checkWinner(room.board);

        if (winner) {

            io.to(roomId).emit("game-over", {
                winner
            });

            return;
        }
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected: " + socket.id);
    })
})

server.listen(3000, () => {
    console.log("Server Running");
});