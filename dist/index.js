"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); // Debe ir el primero para que funcione bien la carga del .env
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var tiempo_real_precipitaciones_route_1 = require("./rutas/tiempo-real-precipitaciones.route");
// Crear el servidor de express
var app = (0, express_1.default)();
// Configurar CORS
app.use((0, cors_1.default)());
// Lectura y parseo del body
app.use(express_1.default.json());
// // Directorio público
// app.use(express.static('public'));
// Rutas
// app.use('/api/tiempo-real/precipitaciones', require('./rutas/tiempo-real-precipitaciones'));
app.use('/api/tiempo-real/precipitaciones', new tiempo_real_precipitaciones_route_1.TiempoRealPrecipitacionesRoute().router);
app.listen(process.env.PORT, function () {
    console.log('Servidor corriendo en puerto ' + process.env.PORT);
});
// import express, { Application, Request, Response, NextFunction } from 'express';
// // Boot express
// const app: Application = express();
// const port = 5000;
// // Application routing
// app.use('/', (req: Request, res: Response, next: NextFunction) => {
//   res.status(200).send({ data: 'Hello from Ornio AS' });
// });
// // Start server
// app.listen(port, () => console.log(`Server is listening on port ${port}!`));
//# sourceMappingURL=index.js.map