"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiempoRealPrecipitacionesRoute = void 0;
var tiempo_real_precipitaciones_controller_1 = require("../controladores/tiempo-real-precipitaciones.controller");
var express_1 = require("express");
var TiempoRealPrecipitacionesRoute = /** @class */ (function () {
    function TiempoRealPrecipitacionesRoute() {
        this.router = (0, express_1.Router)();
        // /api/tiempo-real/precipitaciones
        this.router.get('/', tiempo_real_precipitaciones_controller_1.getPrecipitacionesTR);
    }
    return TiempoRealPrecipitacionesRoute;
}());
exports.TiempoRealPrecipitacionesRoute = TiempoRealPrecipitacionesRoute;
//# sourceMappingURL=tiempo-real-precipitaciones.route.js.map