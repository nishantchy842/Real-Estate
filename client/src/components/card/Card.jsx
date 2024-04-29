import { Link } from "react-router-dom";
import "./card.scss";
import apiRequest from "../../lib/apiRequest";
import Cookies from "js-cookie";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function Card({ item }) {
  const { currentUser } = useContext(AuthContext);

  const checkCurrentUser = () => {
    const user = item.savedBy.filter(
      (item) => item.userId === currentUser.data.id
    );

    if (user.length > 0) {
      return true;
    } else {
      return false;
    }
  };

  const handleSave = async () => {
    const token = Cookies.get("token");
    const res = await apiRequest.post(`/savedPost?postId=${item?.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    window.alert("saved post");
  };

  const handleAddChat = async () => {
    const token = Cookies.get("token");

    const res = await apiRequest.post(`/chats/${item?.userId.username}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    window.alert("added");
  };

  return (
    <div className="card">
      <Link to={`/${item.id}`} className="imageContainer">
        <img src={item.images[0]} alt="" />
      </Link>
      <div className="textContainer">
        <h2 className="title">
          <Link to={`/${item.id}`}>{item.title}</Link>
        </h2>
        <p className="address">
          <img src="/pin.png" alt="" />
          <span>{item.address}</span>
        </p>
        <p className="price">$ {item.price}</p>
        <div className="bottom">
          <div className="features">
            <div className="feature">
              <img src="/bed.png" alt="" />
              <span>{item.bedroom} bedroom</span>
            </div>
            <div className="feature">
              <img src="/bath.png" alt="" />
              <span>{item.bathroom} bathroom</span>
            </div>
          </div>
          <div className="icons">
            <div
              className="icon"
              onClick={handleSave}
              style={{
                background: checkCurrentUser() == true ? "red" : "",
              }}
            >
              <img src="/save.png" alt="" />
            </div>
            <div className="icon" onClick={handleAddChat}>
              <img src="/chat.png" alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
