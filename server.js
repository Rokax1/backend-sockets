const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { CLIENT_RENEG_LIMIT } = require('tls');
const cors = require('cors');

let clients = [];
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4200", // Cambia esto al origen de tu cliente
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: "http://localhost:4200" // Cambia esto al origen de tu cliente
}));

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  socket.on('set_name', (name) => {
    clients.push({ id: socket.id, name });
    console.log(`Cliente ${name} conectado con ID: ${socket.id}`);
    io.emit('clients_update', clients);
  });

  // Escuchar evento de dibujo
  socket.on('drawing', (data) => {
    console.log(data,"drawing");
    // Emitir el evento de dibujo a todos los demás clientes
    socket.broadcast.emit('drawing', data);
  });

  // Escuchar evento de desconexión
  socket.on('disconnect', () => {
    clients = clients.filter(client => client.id !== socket.id);
    console.log(`Cliente desconectado con ID: ${socket.id}`);
    io.emit('clients_update', clients);
  });
});

const PORT = 4000;
server.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
