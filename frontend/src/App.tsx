import React, { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import './styles.css';
import * as cookie from 'cookie';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';

const ChatRoom: React.FC = () => {
    const [messages, setMessages] = useState<MessageData[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [newSocket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {

        const cookieData = cookie.parse(document.cookie);

        const headers = {
            'cookieheader': JSON.stringify(cookieData), // Use a custom header name
            'connectiontype': "1",
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
            const messageType = urlParts[urlParts.length - 2];

            console.log(senderName);
            console.log(receiverName);

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
                            messageType: messageType,
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

        newSocket.on('gameFound', (gameId: string) => {
            console.log("CHALLENGE STARTED!!!!!!!!!!!!");
            console.log(gameId);
            window.location.href = "http://localhost:3000/game/" + gameId;
        });

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, []);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (newSocket) {

            const currentURL = window.location.href;
            const urlParts = currentURL.split('/');
            const receiverName = urlParts[urlParts.length - 1];
            const messageType = urlParts[urlParts.length - 2];

            const cookieData = cookie.parse(document.cookie);

            const messageData: MessageData = {
                message: inputValue,
                senderId: newSocket.id,
                cookieData,
                senderName: cookieData['authCookie1'],
                receiverName: receiverName,
                messageType: messageType,
            };

            newSocket.emit('chatMessage', messageData);
        }
        setInputValue('');
    };

    const cookieData = cookie.parse(document.cookie);
    const currentUser = cookieData['authCookie1'];

    const Challenge = () => {
        const user = cookie.parse(document.cookie)['authCookie1'];
        const url = window.location.href;
        const user2 = url.split('/')[5];
        const challengeInfo = user + ":" + user2;
        if (newSocket) {
            newSocket.emit('challenge', challengeInfo);
        }
    };

    const AcceptChallenge = () => {
        const user = cookie.parse(document.cookie)['authCookie1'];
        const url = window.location.href;
        const user2 = url.split('/')[5];
        const challengeInfo = user2 + ":" + user;
        if (newSocket) {
            newSocket.emit('acceptchallenge', challengeInfo);
        }
    }

    return (
        <div>
            <h1>Chat Room</h1>
            <div className="messages-container">
                {messages.map((messageData, index) => (
                    <div
                        key={index}
                        className={
                            newSocket && messageData.senderName === currentUser
                                ? 'message-wrapper self'
                                : 'message-wrapper others'
                        }
                    >
                        <div className="message-label">
                            {newSocket && messageData.senderName === currentUser ? 'You' : messageData.senderName}
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
            <button type="button" onClick={Challenge}>
                Challenge
            </button>
            <button type="button" onClick={AcceptChallenge}>
                Accept Challenge
            </button>
        </div>
    );
};

interface MessageData {
    senderId: string;
    message: string;
    cookieData: Record<string, string>;
    senderName: string;
    receiverName: string;
    messageType: string,
}

interface GameData {
    ballX: number;
    ballY: number;
    ballSpeedX: number;
    ballSpeedY: number;
    score: string;
    player0: number;
    player1: number;
}

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
// const ChatRoom: React.FC = () => {

const Game = () => {
    const [newSocket, setSocket] = useState<Socket | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    let context: CanvasRenderingContext2D | null = null;

    useEffect(() => {
        const cookieData = cookie.parse(document.cookie);

        const currentURL = window.location.href;
        const urlParts = currentURL.split('/');
        const gameId = urlParts[urlParts.length - 1];

        console.log(gameId);

        const headers = {
            'cookieheader': JSON.stringify(cookieData),
            'connectiontype': '2',
            'gameid': gameId,
        };

        const newSocket = io('http://localhost:5000', {extraHeaders: headers});
        setSocket(newSocket);

        const canvas = canvasRef.current;
        if (canvas) {
            context = canvas.getContext('2d');
        }

        newSocket.on('connect', () => {
            console.log('Socket.IO connection established.');
            // newSocket.emit('startgame');
        });

        newSocket.on('gameupdate', (gameData: GameData) => {
            renderGameFrame(gameData);
        });

        const renderGameFrame = (gameData: GameData) => {
            if (context && canvas) {
                clearCanvas();
                drawField();
                EstamosNaChampions(gameData.score);
                drawPaddle(0, gameData.player0, 10, 150);
                drawPaddle(1, gameData.player1, 10, 150);
                drawBall(gameData.ballX, gameData.ballY);
            }
        };

        const clearCanvas = () => {
            if (context && canvas) {
                context.clearRect(0, 0, canvas.width, canvas.height);
            }
        };

        const drawBall = (x: number, y: number) => {
            if (context) {
                context.fillStyle = 'yellow';
                context.beginPath();
                context.arc(x, y, 10, 0, Math.PI * 2);
                context.fill();
                context.closePath();
            }
        };

        const drawPaddle = (player: number, y: number, width: number , height: number) => {
            if (context)
            {
                if (player === 0)
                {
                    context.fillStyle = 'red'; // Player 0 Paddle color
                    context.fillRect(0, y, width, height);
                }
                else
                {
                    context.fillStyle = 'blue'; // Player 1 Paddle color
                    context.fillRect(790, y, width, height);
                }
            }
        };

        const drawField = () => {
            if (context) {
                context.fillStyle = 'white'
                context.fillRect(395, 0, 5, 400);
            }
        };

        const EstamosNaChampions = (score: string) => {
            if (context) {
                context.fillStyle = 'white'
                context.fillRect(280, 5, 240, 50);
                context.fillRect(360, 40, 60, 30);
                context.fillStyle = 'black';
                context.font = "20px 'Sports World', sans-serif";
                context.fillText("FINAL DA CHAMPIONS", 290, 40);
                context.font = "16px 'Sports World', sans-serif";
                context.fillText(score, 370, 65);
            }
        };

        const handleKeyPress = (event: KeyboardEvent) => {
            const gameinfo = cookieData['authCookie1'] + '|' + gameId;
            if (event.key === "w") {
                // Handle Player 0 UP key press
                newSocket.emit('player0Up', gameinfo);
            } else if (event.key === "s") {
                // Handle Player 0 DOWN key press
                newSocket.emit('player0Down', gameinfo);
            } else if (event.key === "i") {
                // Handle Player 1 UP key press
                newSocket.emit('player1Up', gameinfo);
            } else if (event.key === "k") {
                // Handle Player 1 DOWN key press
                newSocket.emit('player1Down', gameinfo);
            }
        };

        document.addEventListener("keypress", handleKeyPress)

        return () => {
            document.removeEventListener("keypress", handleKeyPress);
        };

    }, []);

    const startGame = () => {
        // Emit 'startgame' event when the button is clicked
        if (newSocket) {
            newSocket.emit('stopgame');
            const currentURL = window.location.href;
            const urlParts = currentURL.split('/');
            const gameId = urlParts[urlParts.length - 2] + "/" + urlParts[urlParts.length - 1];
            newSocket.emit('startgame', gameId);
        }
    };

    const stopGame = () => {
        // Emit 'startgame' event when the button is clicked
        if (newSocket) {
            newSocket.emit('stopgame');
        }
    };

    return (
        <div>
            <canvas ref={canvasRef} width={800} height={400} style={{backgroundColor: 'black'}}/>
            <button onClick={startGame}>Start Game</button>
            <button onClick={stopGame}>Stop Game</button>
        </div>
    );
};

const Matchmaking = () => {
    const [isInQueue, setIsInQueue] = useState(false);
    const [newSocket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {

        const cookieData = cookie.parse(document.cookie);

        const headers = {
            'cookieheader': JSON.stringify(cookieData),
        };
        const newSocket = io('http://localhost:5000', {extraHeaders: headers});
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket.IO Queue connection established.');
            // newSocket.emit('startgame');
        });

        newSocket.on('gameFound', (gameId: string) => {
            console.log('Game Found!!!!!!!');
            console.log(gameId);
            window.location.href = "http://localhost:3000/game/" + gameId;
        });

    }, []);

    const joinLadderQueue = () => {
        // Emit 'startgame' event when the button is clicked
        if (newSocket) {
            const cookieData = cookie.parse(document.cookie);
            const user = cookieData['authCookie1'];
            newSocket.emit('ladderqueue', user);
        }
    };

    const joinDesLadderQueue = () => {
        // Emit 'startgame' event when the button is clicked
        if (newSocket) {
            const cookieData = cookie.parse(document.cookie);
            const user = cookieData['authCookie1'];
            newSocket.emit('friendlyqueue', user);
        }
    };

    return (
        <div>
            <p>Choose a Queue:</p>
            <button onClick={() => joinLadderQueue()}>Join Ladder Queue</button>
            <button onClick={() => joinDesLadderQueue()}>Join Friendly Queue</button>
        </div>
    );
}

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
                        <li>
                            <Link to="/game">Game</Link>
                        </li>
                        <li>
                            <Link to="/matchmaking">Matchmaking</Link>
                        </li>
                    </ul>
                </nav>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/chat" element={<ChatRoom />} />
                    <Route path="/user" element={<UserProfile />} />
                    <Route path="/chat/dm/:id" element={<ChatRoom />} />
                    <Route path="/chat/gc/:id" element={<ChatRoom />} />
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/matchmaking" element={<Matchmaking/>} />
                    <Route path="/game/:type/:id" element={<Game/>} />
                </Routes>
            </div>
        </BrowserRouter>
    );
};

export default App;
