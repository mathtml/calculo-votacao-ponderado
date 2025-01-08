import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'API de Votação',
      version: '1.0.0',
      description: 'API para processar votos e realizar cálculos ponderados',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
      },
    ],
  },
  apis: ['src/routes/*.ts'], 
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export { swaggerSpec };
