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
});

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
    for (const combo of wins) {
        const [a, b, c] = combo;

        if (
            board[a] &&
            board[a] === board[b] &&
            board[b] === board[c]
        ) {
            return board[a];
        }
    }

    return null;
}

function isDraw(board) {
    return board.every(cell => cell !== "");
}

io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("create-room", () => {
        const roomId = Math.random().toString(36).substring(2, 8);

        rooms[roomId] = {
            players: [socket.id],
            board: Array(9).fill(""),
            turn: "X"
        };

        socket.join(roomId);

        socket.emit("room-created", roomId);

        console.log(`Room created: ${roomId}`);
    });

    socket.on("join-room", (roomId) => {
        const room = rooms[roomId];

        if (!room) {
            socket.emit("room-error", "Room does not exist");
            return;
        }

        if (room.players.length >= 2) {
            socket.emit("room-error", "Room is already full");
            return;
        }
        if (!room.players.includes(socket.id)) {
            room.players.push(socket.id);
        }

        socket.join(roomId);

        // Send symbols individually
        io.to(room.players[0]).emit("player-symbol", "X");
        io.to(room.players[1]).emit("player-symbol", "O");

        io.to(roomId).emit("start-game", {
            roomId,
            board: room.board,
            turn: room.turn
        });

        console.log(`Player joined room ${roomId}`);
    });

    socket.on("make-move", ({ roomId, index }) => {
        const room = rooms[roomId];

        if (!room) return;

        // Only start after 2 players join
        if (room.players.length < 2) return;

        // Invalid cell
        if (index < 0 || index > 8) return;

        // Cell already occupied
        if (room.board[index] !== "") return;

        const symbol =
            room.players[0] === socket.id
                ? "X"
                : room.players[1] === socket.id
                ? "O"
                : null;

        if (!symbol) return;

        // Turn validation
        if (symbol !== room.turn) return;

        room.board[index] = symbol;

        const winner = checkWinner(room.board);

        if (winner) {
            io.to(roomId).emit("board-update", {
                board: room.board,
                turn: room.turn
            });

            io.to(roomId).emit("game-over", {
                winner
            });

            return;
        }

        if (isDraw(room.board)) {
            io.to(roomId).emit("board-update", {
                board: room.board,
                turn: room.turn
            });

            io.to(roomId).emit("game-over", {
                winner: null,
                draw: true
            });

            return;
        }

        room.turn = room.turn === "X" ? "O" : "X";

        io.to(roomId).emit("board-update", {
            board: room.board,
            turn: room.turn
        });
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id);

        for (const roomId in rooms) {
            const room = rooms[roomId];

            if (room.players.includes(socket.id)) {
                io.to(roomId).emit(
                    "room-error",
                    "Opponent disconnected"
                );

                delete rooms[roomId];

                console.log(`Deleted room ${roomId}`);

                break;
            }
        }
    });
});

server.listen(3000, () => {
    console.log("Server Running on Port 3000");
});