import { useEffect, useRef } from "react";
import useWebSocket from "react-use-websocket";
import throttle from "lodash.throttle";

import { Cursor } from "../components/Cursor";

const WS_URL = "ws://127.0.0.1:8000";
const THROTTLE_TIME = 50; // 0.05s

const renderCursors = (users) => {
  return Object.keys(users).map((user) => {
    const { state, username } = users[user];
    /**
     *  user data structure
     *  [uuid]: {
     *    username: string,
     *    state: {
     *      x: number,
     *      y: number,
     *    },
     *  }
     */
    return (
      <Cursor key={user.uuid} point={[state.x, state.y]} username={username} />
    );
  });
};

const renderUserList = (users) => {
  return Object.keys(users).map((user) => {
    const { username } = users[user];
    return <li key={user}>{username}</li>;
  });
};

export default function Home({ username }) {
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
    share: true,
    queryParams: { username },
  });

  const sendJsonMessageThrottled = useRef(
    throttle(sendJsonMessage, THROTTLE_TIME)
  );

  useEffect(() => {
    sendJsonMessage({
      x: 0,
      y: 0,
    });

    window.addEventListener("mousemove", (e) =>
      sendJsonMessageThrottled.current({
        x: e.clientX,
        y: e.clientY,
      })
    );
  }, [sendJsonMessageThrottled, sendJsonMessage]);

  return (
    <main>
      <h1>Live Collaboration</h1>
      <p>Hello, {username}</p>
      {lastJsonMessage && renderCursors(lastJsonMessage)}
      {lastJsonMessage && (
        <div>
          <ul>{renderUserList(lastJsonMessage)}</ul>
        </div>
      )}
    </main>
  );
}
