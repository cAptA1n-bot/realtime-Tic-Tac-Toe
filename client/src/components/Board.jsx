import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket.js";

const Board = () => {
  const { roomid } = useParams();

  const [board, setBoard] = useState(Array(9).fill(""));
  const [turn, setTurn] = useState("X");
  const [symbol, setSymbol] = useState("");
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {

    const handleStartGame = ({ board, turn }) => {
      setBoard(board);
      setTurn(turn);
      setMessage("");
    };

    const handleBoardUpdate = ({ board, turn }) => {
      setBoard(board);
      setTurn(turn);
    };

    const handlePlayerSymbol = (symbol) => {
      setSymbol(symbol);
    };

    const handleGameOver = ({ winner, draw }) => {
      if (draw) {
        setMessage("Game Draw!");
      } else {
        setWinner(winner);
        setMessage(`${winner} Wins!`);
      }
    };

    const handleRoomError = (msg) => {
      setMessage(msg);
    };

    socket.on("start-game", handleStartGame);
    socket.on("board-update", handleBoardUpdate);
    socket.on("player-symbol", handlePlayerSymbol);
    socket.on("game-over", handleGameOver);
    socket.on("room-error", handleRoomError);

    return () => {
      socket.off("start-game", handleStartGame);
      socket.off("board-update", handleBoardUpdate);
      socket.off("player-symbol", handlePlayerSymbol);
      socket.off("game-over", handleGameOver);
      socket.off("room-error", handleRoomError);
    };
  }, [roomid]);

  const handleClick = (index) => {
    if (winner || message === "Game Draw!") return;

    socket.emit("make-move", {
      roomId: roomid,
      index,
    });
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center gap-6">

      <h1 className="text-3xl font-bold">
        Tic Tac Toe
      </h1>

      <div className="flex flex-col items-center gap-2">
        <p className="text-lg font-semibold">
          Room ID: {roomid}
        </p>

        {symbol && (
          <p className="text-lg">
            You are: <span className="font-bold">{symbol}</span>
          </p>
        )}

        {!winner && message !== "Game Draw!" && (
          <p className="text-lg">
            Current Turn:{" "}
            <span className="font-bold">{turn}</span>
          </p>
        )}

        {message && (
          <p className="text-2xl font-bold text-success">
            {message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            disabled={cell !== ""}
            className="btn btn-primary w-24 h-24 text-4xl font-bold"
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Board;