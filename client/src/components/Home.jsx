import { React, useState } from 'react'

const Home = () => {
    const[inputField, setInputField] = useState(false);
    const joinRoom = () => {
        setInputField(false);
    }
  return (
    <div>
        {inputField &&
            <div className="fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-150 h-75 z-50">
                <div className="bg-black p-6 rounded-lg h-full flex flex-col justify-around items-center">
                    <div className="text-white text-3xl font-bold text-center">Join Room</div>
                    <input type="text" placeholder="Enter Room Id" className="input input-bordered w-full max-w-xs text-2xl" />
                    <button className="btn btn-secondary text-2xl w-40" onClick={joinRoom}>Join</button>
                </div>
            </div>
        }
      <div className="flex justify-center items-center h-screen gap-4">
        <button className="btn btn-primary w-50 h-30 text-2xl" onClick={() => setInputField(true)}>Join Room</button>
        <button className="btn btn-primary w-50 h-30 text-2xl">Create Room</button>
      </div>
    </div>
  )
}

export default Home
