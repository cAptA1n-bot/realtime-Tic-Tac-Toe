import { useState, useEffect } from 'react'
import socket from '../socket.js';
import { useParams } from 'react-router-dom';

const Board = () => {
  const { roomid } = useParams();
  const [board, setBoard] = useState(Array(9).fill(""));
  const [turn, setTurn] = useState("");

  const handleClick = (index) => {
    socket.emit("make-move", {
      roomId: roomid,
      index
    })
  };
  useEffect(() => {

    const handleBoardUpdate = ({ board, turn }) => {
      setBoard(board);
      setTurn(turn);
      console.log(board, turn);
    };

    socket.on("board-update", handleBoardUpdate);

    return () => {
      socket.off("board-update", handleBoardUpdate);
    };

  }, []);


  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-base-200">
      <h1 className="text-3xl font-bold">
        Turn: {turn}
      </h1>

      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className="btn btn-primary btn-square w-24 h-24 text-4xl font-bold"
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Board
