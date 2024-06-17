const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Pontos de Interesse',
            version: '1.0.0',
            description: 'Documentação da API de Pontos de Interesse',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor Local',
            },
        ],
    },
    apis: [path.resolve(__dirname, '../api/routes/*.js')],
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};
