import { useState, useEffect } from 'react';
import socket from '../socket.js';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [inputField, setInputField] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [text, setText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleRoomCreated = (roomId) => {
      setRoomId(roomId);
    };

    const handleStartGame = ({roomId}) => {
      navigate(`/board/${roomId}`);
    };

    const handleRoomError = (message) => {
      alert(message);
    };

    socket.on("room-created", handleRoomCreated);
    socket.on("start-game", handleStartGame);
    socket.on("room-error", handleRoomError);

    return () => {
      socket.off("room-created", handleRoomCreated);
      socket.off("start-game", handleStartGame);
      socket.off("room-error", handleRoomError);
    };
  }, [navigate]);

  const joinRoom = () => {
    setInputField(false);
    socket.emit("join-room", text);
  };

  const createRoom = () => {
    socket.emit("create-room");
  };

  return (
    <div>
      {inputField && (
        <div className="fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-150 h-75 z-50">
          <div className="bg-black p-6 rounded-lg h-full flex flex-col justify-around items-center">
            <div className="text-white text-3xl font-bold text-center">
              Join Room
            </div>

            <input
              type="text"
              placeholder="Enter Room Id"
              className="input input-bordered w-full max-w-xs text-2xl"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <button
              className="btn btn-secondary text-2xl w-40"
              onClick={joinRoom}
            >
              Join
            </button>
          </div>
        </div>
      )}

      {roomId ? (
        <div className="flex justify-center items-center h-screen gap-4">
          <div className="bg-black p-6 rounded-lg">
            <h1 className="text-white text-2xl font-bold">
              Room ID: {roomId}
            </h1>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen gap-4">
          <button
            className="btn btn-primary w-50 h-30 text-2xl"
            onClick={() => setInputField(true)}
          >
            Join Room
          </button>

          <button
            className="btn btn-primary w-50 h-30 text-2xl"
            onClick={createRoom}
          >
            Create Room
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;