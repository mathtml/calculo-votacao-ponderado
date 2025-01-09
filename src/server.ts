import express, { Request, Response } from "express";
import votosRoutes from "./routes/voteRoutes";  
import './cronjobs/cronJobs';  
import swaggerUi from 'swagger-ui-express';  
import { swaggerSpec } from "./config/swaggerConfig";
import cors from 'cors';
import pesquisasRoutes from "./routes/pesquisasRoutes";

const app = express();
app.use(express.json());  

app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/", votosRoutes);  
app.use("/", pesquisasRoutes);  

app.get("/", (req: Request, res: Response) => {
  res.send("Servidor Express com TypeScript funcionando!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
