const http = require("http");
const { WebSocketServer } = require("ws");
const url = require("url");
const { v4: uuidv4 } = require("uuid");

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const PORT = 8000;

const connections = {};
const users = {};

// 연결된 사용자에게 브로드캐스트
const broadcast = () => {
  // 접속된 uuid 목록을 순회하여 메시지 전송
  Object.keys(connections).forEach((uuid) => {
    const connection = connections[uuid];
    const message = JSON.stringify(users);
    connection.send(message);
  });
};

// 연결 된 사용자에게 메시지 전송
const handleMessage = (bytes, uuid) => {
  const message = JSON.parse(bytes.toString());
  const user = users[uuid];
  user.state = message;

  broadcast();
  console.log(
    `${users[uuid].username} updated state: ${JSON.stringify(message)}`
  );
};

// 연결 종료
const handleClose = (uuid) => {
  console.log(`${users[uuid].username} disconnected`);

  delete connections[uuid];
  delete users[uuid];

  // connections, users 변경 사항을 브로드캐스트
  broadcast();
};

wsServer.on("connection", async (connection, request) => {
  // ws://localhost:8000?username=Mark
  const { username } = url.parse(request.url, true).query;
  console.log(`Client connected: ${username}`);

  // 동일한 username의 유저 식별하기
  const uuid = uuidv4();
  console.log(`UUID: ${uuid}`);

  connections[uuid] = connection;
  users[uuid] = { username, state: { x: 0, y: 0 } };

  connection.on("message", (message) => handleMessage(message, uuid));
  connection.on("close", () => handleClose(uuid));
});

server.listen(PORT, () => {
  console.log(`WebSocket Server is running on port ${PORT}`);
});
