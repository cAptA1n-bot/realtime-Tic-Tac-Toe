import React from 'react'

const Board = () => {
     const board = Array(9).fill("");
    return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, index) => (
          <button
            key={index}
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
