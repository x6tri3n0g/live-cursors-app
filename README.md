# Live Cursor App with Web Socket

Node Web Socket 서버 구현 및 React Client App 구현
- Web Socket Server로 Live Cursor App 만들기

## Server
> [!info]
> node 22.13.1
```bash
# 패키지 설치
> npm i

# 서버 실행
> node index.js
```

### 설명
```
const http = require("http");
const { WebSocketServer } = require("ws");
const url = require("url");
const { v4: uuidv4 } = require("uuid");

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const PORT = 8000;

// 해당 서버에 연결 정보를 저장
const connections = {};
// 해당 서버에 연결 '유저' 정보를 저장
const users = {};

// 연결된 사용자에게 브로드캐스트
const broadcast = () => {
  // 현재 coonnection uuid 목록을 순회하여 메시지 전송
  Object.keys(connections).forEach((uuid) => {
    const connection = connections[uuid];
    const message = JSON.stringify(users);
    connection.send(message);
  });
};

// connection 중 message 처리
const handleMessage = (bytes, uuid) => {
  const message = JSON.parse(bytes.toString());
  const user = users[uuid];
  user.state = message;

  broadcast();
  console.log(
    `${users[uuid].username} updated state: ${JSON.stringify(message)}`
  );
};

// connection 중 연결 종료
const handleClose = (uuid) => {
  console.log(`${users[uuid].username} disconnected`);

  delete connections[uuid];
  delete users[uuid];

  // connections, users 변경 사항을 브로드캐스트
  broadcast();
};

// 2. Web Socket Server Connection 이벤트 처리
wsServer.on("connection", async (connection, request) => {
  const { username } = url.parse(request.url, true).query;

  // 동일한 username의 유저를 uuid를 통해 식별
  const uuid = uuidv4();
  // connection된 유저를 uuid를 기준으로 dictionary 저장
  connections[uuid] = connection;
  // user의 username과 cursor point(state) 저장
  users[uuid] = { username, state: { x: 0, y: 0 } };

  // connection 중 message를 수신하는 경우 발생
  connection.on("message", (message) => handleMessage(message, uuid));

  // connection 중 close를 수신하는 경우 발생(종료)
  connection.on("close", () => handleClose(uuid));
});

// 1. Initial HTTP handshake
server.listen(PORT, () => {
  console.log(`WebSocket Server is running on port ${PORT}`);
});
```

## Client
> [!info]
> node 22.13.1
```
# 패키지 설치
> npm i

# 앱 실행
> npm run dev
```

### 설명
```
  ...

  // react-use-websocket의 useWebSocket 사용하여 통신
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
    share: true,
    queryParams: { username },
  });

  // throttling update
  const sendJsonMessageThrottled = useRef(
    throttle(sendJsonMessage, THROTTLE_TIME)
  );

  useEffect(() => {
    // 지금 나(유저)의 cursor point 초기화
    sendJsonMessage({
      x: 0,
      y: 0,
    });

    // mousemove 이벤트 리스터를 통해 server에 현재 cursor point 전송
    window.addEventListener("mousemove", (e) =>
      sendJsonMessageThrottled.current({
        x: e.clientX,
        y: e.clientY,
      })
    );
  }, [sendJsonMessageThrottled, sendJsonMessage]);

  ...
```


## WebSocket flow
1. Client send an HTTP `Upgrade` request.
2. Server agrees and upgrade to WebSocket protocol.
3. A persistent connection is established.
4. Messages can now be sent in either direction with minimal overhead

## WebSocket Concept
- Persistent connection(until closed)
- Low protocol overhead
- Full-duplex communication
- Operates over TCP(port 80 or 443)

## Preview
https://github.com/user-attachments/assets/a9cc40d9-6c7f-4f1f-97d7-ec003c21aa31

