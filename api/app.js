//app
const express = require('express');
const swaggerConfig = require('./swagger'); // Importa a configuração do Swagger
const cors = require('cors');
const pontosInteresseRouter = require('./routes/ponto_interesse'); // Importa o roteador dos pontos de interesse

const app = express();
const port = 3000;

// Middleware para permitir CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Configura o Swagger
swaggerConfig(app);

// Roteador para os pontos de interesse
app.use('/api/ponto_interesse', pontosInteresseRouter);

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor da API rodando em http://localhost:${port}`);
});

module.exports = app;
