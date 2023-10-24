import React, { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import './styles.css';
import * as cookie from 'cookie';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import {stringify} from "querystring";

interface MessageData {
    senderId: string;
    message: string;
    cookieData: Record<string, string>;
    senderName: string;
    receiverName: string;
}

const ChatRoom: React.FC = () => {
    const [messages, setMessages] = useState<MessageData[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {

        const cookieData = cookie.parse(document.cookie);

        const headers = {
            'cookieheader': JSON.stringify(cookieData), // Use a custom header name
        };

        console.log('Headers to send:', headers);

        const newSocket = io('http://localhost:5000', { extraHeaders: headers });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket.IO connection established.');
        });

        newSocket.on('error', (errorEvent: Event) => {
            console.log('Socket.IO error:', errorEvent);
        });

        newSocket.on('chatMessage', (messageData: MessageData) => {
            setMessages((prevMessages) => [...prevMessages, messageData]);
        });

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, []);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (socket) {

            const currentURL = window.location.href;
            console.log('Current URL:', currentURL);
            const urlParts = currentURL.split('/');
            console.log('URL Parts:', urlParts);
            console.log(urlParts[urlParts.length - 1]);

            const cookieData = cookie.parse(document.cookie);

            const messageData: MessageData = {
                message: inputValue,
                senderId: socket.id,
                cookieData,
                senderName: "x",
                receiverName: urlParts[urlParts.length - 1],
            };

            socket.emit('chatMessage', messageData);
        }
        setInputValue('');
    };

    return (
        <div>
            <h1>Chat Room</h1>
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

const Home: React.FC = () => {
    return (
        <div>
            <h1>Home Page</h1>
            <p>Welcome to the home page. Click <Link to="/chat">here</Link> to enter the chat room.</p>
        </div>
    );
};

const UserProfile: React.FC = () => {
    const [userProfile, setUserProfile] = useState<any>(null); // State to hold user profile data

    useEffect(() => {
        // Fetch user profile data from the backend
        const cookieData = cookie.parse(document.cookie);
        const user = cookieData['authCookie1'];
        fetch('http://localhost:5000/user/' + user) // Replace with the actual API endpoint
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setUserProfile(data); // Update the state with the fetched user profile data
            })
            .catch((error) => {
                console.error('Error fetching user profile:', error);
            });
    }, []);

    return (
        <div>
            <h1>User Profile</h1>
            {userProfile ? (
                <pre>{JSON.stringify(userProfile, null, 2)}</pre>
            ) : (
                <p>Loading user profile data...</p>
            )}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <div>
                <nav>
                    <ul>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/chat">Chat Room</Link>
                        </li>
                        <li>
                            <Link to="/user">User Profile</Link>
                        </li>
                    </ul>
                </nav>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/chat" element={<ChatRoom />} />
                    <Route path="/user" element={<UserProfile />} />
                    <Route path="/chat/dm/:id" element={<ChatRoom />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
};

export default App;
