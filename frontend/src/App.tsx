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

                const cookieData = cookie.parse(document.cookie);
                const senderName = cookieData['authCookie1'];

                const currentURL = window.location.href;
                const urlParts = currentURL.split('/');
                const receiverName = urlParts[urlParts.length - 1];

                // Fetch messages for the user with otherUserId
                fetch(`http://localhost:5000/message/${senderName}/${receiverName}`)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then((data) => {
                        const messageDataArray: MessageData[] = new Array(data.length);

                        // Use a for loop to iterate through the JSON array
                        for (let i = 0; i < data.length; i++) {
                            const item: {id: string, sender: string, receiver: string,
                            content: string, timestamp: string} = data[i];

                            // Log the item
                            console.log('Item:', item);

                            console.log('ìtem.senderId: ', item.id);
                            const messageData: MessageData = {
                                senderId: item.id,
                                message: item.content,
                                cookieData: {"ola": "ola"},
                                senderName: item.sender,
                                receiverName: item.receiver,
                            };

                            console.log("MessageData:" + messageData);


                            // Set the MessageData object at the corresponding index in the array
                            messageDataArray[i] = messageData;
                            console.log(messageDataArray[i]);
                        }

                        setMessages(messageDataArray);
                        // const messageData: MessageData = data as MessageData;
                        // console.log(messageData);
                        // setMessages(data);
                    })
                    .catch((error) => {
                        console.error('Error fetching messages:', error);
                    });

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
            const urlParts = currentURL.split('/');

            const cookieData = cookie.parse(document.cookie);

            const messageData: MessageData = {
                message: inputValue,
                senderId: socket.id,
                cookieData,
                senderName: cookieData['authCookie1'],
                receiverName: urlParts[urlParts.length - 1],
            };

            socket.emit('chatMessage', messageData);
        }
        setInputValue('');
    };

    const cookieData = cookie.parse(document.cookie);
    const currentUser = cookieData['authCookie1'];

    return (
        <div>
            <h1>Chat Room</h1>
            <div className="messages-container">
                {messages.map((messageData, index) => (
                    <div
                        key={index}
                        className={
                            socket && messageData.senderName === currentUser
                                ? 'message-wrapper self'
                                : 'message-wrapper others'
                        }
                    >
                        <div className="message-label">
                            {socket && messageData.senderName === currentUser ? 'You' : messageData.senderName}
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
        fetch('http://localhost:5000/user/' + user, {
            method: 'GET',
            credentials: 'include',
        }) // Replace with the actual API endpoint
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


const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:5000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include',
				referrer: '',
				mode: "cors",
            });

            if (response.ok) {
                console.log("facil");
            } else {
                console.log("epa wtf");
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form>
                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor="email">E-mail</label>
                    <input
                        type="text"
                        id="email"
                        name="email"
                        value={formData.email}
                        placeholder="rodrigo@.antonio"
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                    />
                </div>
                <button type="button" onClick={handleLogin}>
                    Log In
                </button>
            </form>
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
                    <Route path="/auth/login" element={<Login />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
};

export default App;
