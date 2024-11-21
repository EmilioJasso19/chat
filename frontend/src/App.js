import {useEffect, useState} from "react";
import io from "socket.io-client";
import {v4} from "uuid";
import './App.css'

const PORT = 3001;
const socket = io(`localhost:${PORT}`);

function App() {

    const [isConnected, setIsConnected] = useState(socket.connected);
    const [newMessage, setNewMessage] = useState("");
    const [user, setUser] = useState("");
    const [room, setRoom] = useState("");
    const [chatVisible, setChatVisible] = useState(false);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        console.log('connected:', socket.connected)

        socket.on('connect', () => {
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
        }
    }, [isConnected]);

    useEffect(() => {
        socket.on('receive_msg', ({user, message}) => {
            const msg = `${user}: ${message}`;
            setMessages(prevState => [msg, ...prevState]);
        });

        return () => {
            socket.off('receive_msg');
        };

    }, [])

    const handleEnterChatRoom = () => {
        if (user !== '' && room !== '') {
            setChatVisible(true)
            socket.emit('join_room', {user, room});
        }
    }

    const handleSendMessage = () => {
        const newMsgData = {
            room: room,
            user: user,
            message: newMessage,
        }

        socket.emit('send_message', newMsgData)
        const msg = `${user}: ${newMessage}`
        setMessages(prevState => [msg, ...prevState]);
        setNewMessage("")
    }

    return (
        <div className='container-app'>
            {!chatVisible ?
                <>
                    <h3>Entra a un chat</h3>
                    <input type="text" className="input-entrada" placeholder="user" value={user}
                           onChange={e => setUser(e.target.value)}/>
                    <br/>
                    <input type="text" className="input-entrada" placeholder="room" value={room}
                           onChange={e => setRoom(e.target.value)}/>
                    <br/>
                    <button className='button' onClick={handleEnterChatRoom}>
                        <span>Enter</span>
                    </button>
                </>
                :
                <>
                    <h3>Room: {room} | User: {user}</h3>
                    <div className='container-message'>
                        {messages.map(el => <div key={v4()} className='message'>{el}</div>)}
                    </div>
                    <input type="text"
                           placeholder="message"
                           value={newMessage}
                           onChange={e => setNewMessage(e.target.value)}
                    />
                    <button className='button' onClick={handleSendMessage}>
                        <span>Send message</span>
                    </button>
                </>
            }
        </div>
    )
}

export default App;
