import React, { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client'; // Import socket.io-client and the Socket type
import './styles.css'; // Import the CSS file
import * as cookie from 'cookie';

interface MessageData {
  senderId: string;
  message: string;
  cookieData: Record<string, string>;
  senderName: string;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null); // State to hold the socket instance

  useEffect(() => {
    // Create the Socket.IO connection using io() function only once when the component mounts
    const newSocket = io('http://localhost:5000'); // Change the port to match your backend WebSocket port
    setSocket(newSocket);

    // Add event listeners to handle Socket.IO events only once
    newSocket.on('connect', () => {
      console.log('Socket.IO connection established.');
    });

    newSocket.on('error', (errorEvent: Event) => {
      console.log('Socket.IO error:', errorEvent);
    });

    newSocket.on('chatMessage', (messageData: MessageData) => {
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    // Clean up Socket.IO connection when the component unmounts
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (socket) {
      const cookieData = cookie.parse(document.cookie);

      const messageData: MessageData = {
        message: inputValue,
        senderId: socket.id, // Add the sender's ID to the message data
        cookieData,
        senderName: "x",
      };

      socket.emit('chatMessage', messageData);
    }
    setInputValue('');
  };
  // ... (App component code)

  // ... (existing code)

  return (
      <div>
        <h1>Chat Test</h1>
        <div className="messages-container">
          {messages.map((messageData, index) => (
              <div
                  key={index}
                  className={
                    socket && messageData.senderId === socket.id
                        ? 'message-wrapper self'
                        : 'message-wrapper others'
                  }
              >
                {/* Add the label for the message sender */}
                <div className="message-label">
                  {socket && messageData.senderId === socket.id ? 'You' : messageData.senderName}
                </div>
                <div className="message">{messageData.message}</div>
              </div>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Enter message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
  );
};

export default App;




