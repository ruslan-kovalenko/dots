### Description
Dots is an abstract strategy game, played by two players on a sheet of squared paper. The game is somewhat similar to Go, in that the goal is to "capture" enemy dots by surrounding them with a continuous line of one's own dots. Once an area containing enemy dots is surrounded, that area ceases to be playable.

https://en.wikipedia.org/wiki/Dots_(game)

note: a bit simplified implementation. Here you can't surround already surrounded areas

### Project setup
From the repository root:
```
npm install
```

### Start the client and the server
```
npm run dev
```

This starts both parts together:
- the server (socket.io) on http://localhost:3000
- the client (Vite) on http://127.0.0.1:8080

Open http://127.0.0.1:8080 in two windows. The first window to connect plays red and moves first, the second plays blue.

### Run the tests
```
npx jest
```
