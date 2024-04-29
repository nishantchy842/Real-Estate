import { defer } from "react-router-dom";
import apiRequest from "./apiRequest";
import Cookies from "js-cookie";

export const singlePageLoader = async ({ request, params }) => {
  const res = await apiRequest("/posts/" + params.id);
  return res.data;
};
export const listPageLoader = async ({ request, params }) => {
  const query = request.url.split("?")[1];
  let postPromise;
  if (query) {
    postPromise = apiRequest(
      "/posts" + "?pagination=true&page=1&size=20&" + query
    );
  } else {
    postPromise = apiRequest("/posts");
  }
  return defer({
    postResponse: postPromise,
  });
};

export const profilePageLoader = async () => {
  const token = Cookies.get("token");
  const postPromise = apiRequest("/users/posts", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const chatPromise = apiRequest("/chats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return defer({
    postResponse: postPromise,
    chatResponse: chatPromise,
  });
};
