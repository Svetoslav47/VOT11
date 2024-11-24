import React, { useState, useEffect } from 'react';
import { socket } from './socket';

interface HistoryMessage {
  sender: string;
  message: string;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');
  const [room, setRoom] = useState<string>('');

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('receive-message', (message: string) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('receive-message');
    };
  }, []);

  const handleSend = () => {
    if (input.trim()) {
      setMessages((prevMessages) => [...prevMessages, `You: ${input}`]);
      socket.emit('send-message', input, room);
      setInput('');
    }
  };

  useEffect(() => {
    socket.emit('join-room', 'global', (joinMessage: string, history: HistoryMessage[]) => {
      setMessages(history.map((msg) => `${msg.sender}: ${msg.message}`));

      setMessages((prevMessages) => [...prevMessages, joinMessage]);
    });
  }, []);

  const handleJoinRoom = () => {
    socket.emit('join-room', room ? room : 'global', (joinMessage: string, history: HistoryMessage[]) => {
      setMessages(history.map((msg) => `${msg.sender}: ${msg.message}`));

      setMessages((prevMessages) => [...prevMessages, joinMessage]);
    });
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-100 p-4">
      <div className="flex flex-col w-full max-w-xl h-full bg-white rounded-lg shadow-lg">
        <div className="px-4 py-2 bg-gray-200 text-gray-600 text-sm rounded-t-lg">
          You are currently chatting in room: "<span className="font-semibold">{room ? room : 'global'}</span>"
        </div>

        <div className="flex-1 p-4 overflow-y-auto border-b border-gray-300">
          {messages.map((message, index) => (
            <div key={index} className="mb-2 text-gray-700">
              {message}
            </div>
          ))}
        </div>

        <div className="flex items-center p-4 space-x-2 border-b border-gray-300">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message"
            className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Send
          </button>
        </div>

        <div className="p-4">
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Room"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200"
          />
          <button
            onClick={handleJoinRoom}
            className="w-full mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
