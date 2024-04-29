import { useCallback, useContext, useEffect, useRef, useState } from "react";
import "./chat.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { format } from "timeago.js";
import { SocketContext } from "../../context/SocketContext";
import { useNotificationStore } from "../../lib/notificationStore";
import Cookies from "js-cookie";

function Chat({ chats }) {
  const token = Cookies.get("token");

  const [chat, setChat] = useState(null);
  const { currentUser } = useContext(AuthContext);

  const { socket } = useContext(SocketContext);

  const messageEndRef = useRef();

  const decrease = useNotificationStore((state) => state.decrease);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleOpenChat = async (id, receiver) => {
    try {
      const res = await apiRequest("/chats/" + id, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.data.data.seenBy.includes(currentUser.data.id)) {
        decrease();
      }
      setChat({ ...res.data.data, receiver });
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const text = formData.get("text");

    if (!text) return;

    try {
      const res = await apiRequest.post(`/messages/${chat.id}`, { text });
      const newMessage = res.data.data;

      // Update chat messages state
      setChat((prevChat) => ({
        ...prevChat,
        messages: [...prevChat.messages, newMessage],
      }));

      // Reset the form
      e.target.reset();

      // Emit a "sendMessage" event via socket
      socket.emit("newMessage", {
        receiverId: chat.receiver.id,
        data: newMessage,
      });
    } catch (err) {
      console.error("Error sending message:", err);
      // Handle error (e.g., show error message to user)
    }
  };

  useEffect(() => {
    const read = async () => {
      try {
        await apiRequest.patch(`/chats/${chat.id}`);
      } catch (err) {
        console.log(err);
      }
    };

    if (socket && chat) {
      const getMessageHandler = (data) => {
        if (chat.id === data.content.data.chatId) {
          setChat((prevChat) => {
            const isNewMessage = !prevChat.messages.some(
              (message) => message.id === data.content.data.id
            );
            if (isNewMessage) {
              return {
                ...prevChat,
                messages: [...prevChat.messages, data.content.data],
              };
            } else {
              return prevChat; // Message already exists, no need to update state
            }
          });
          read();
        }
      };

      socket.on("onMessage", getMessageHandler);
      return () => {
        socket.off("getMessage", getMessageHandler);
      };
    }
  }, [socket, chat]);

  console.log(chat, "chat");

  return (
    <div className="chat">
      <div className="messages">
        <h1>Messages</h1>
        {chats?.map((c) => (
          <div
            className="message"
            key={c.id}
            style={{
              backgroundColor:
                (c.seenBy ?? "").includes(currentUser?.data?.id) ||
                chat?.id === c.id
                  ? "white"
                  : "#fecd514e",
            }}
            onClick={() => handleOpenChat(c.id, c?.receiver)}
          >
            <img src={c?.receiver?.avatar || "/noavatar.jpg"} alt="" />
            <span>{c?.receiver?.username}</span>
            <p>{c?.lastMessage}</p>
          </div>
        ))}
      </div>
      {chat && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <img src={chat.receiver.avatar || "noavatar.jpg"} alt="" />
              {chat.receiver.username}
            </div>
            <span className="close" onClick={() => setChat(null)}>
              X
            </span>
          </div>
          <div className="center">
            {chat.messages.map((message) => (
              <div
                className="chatMessage"
                style={{
                  alignSelf:
                    message.userId === currentUser.data.id
                      ? "flex-end"
                      : "flex-start",
                  textAlign:
                    message.userId === currentUser.data.id ? "right" : "left",
                }}
                key={message.id}
              >
                <p>{message.text}</p>
                <span>{format(message.createdAt)}</span>
              </div>
            ))}
            <div ref={messageEndRef}></div>
          </div>
          <form onSubmit={handleSubmit} className="bottom">
            <textarea name="text"></textarea>
            <button>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;
