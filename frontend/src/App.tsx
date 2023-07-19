import React, { useEffect, useState } from 'react';
const App: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const socket = new WebSocket('ws://localhost:5050');
  socket.onerror = (error) => {
    console.log('WebSocket error: ', error);
  };

  useEffect(() => {
    console.log('WebSocket connection established.');
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;
      setMessages((prevMessages) => [...prevMessages, message]);
    };
    socket.addEventListener('message', messageHandler);
    return () => {
      socket.removeEventListener('message', messageHandler);
      socket.close();
    };
  }, []);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    socket.send(inputValue);
    setInputValue('');
  };
  return (
    <div>
      <h1>Chat Test</h1>
      <div>
        {messages.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Enter message"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
export default App;

