"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrecipitacionesTR = void 0;
var cheerio = __importStar(require("cheerio"));
var axios = __importStar(require("axios"));
var informacion_estaciones_1 = require("../nucleo/constantes/informacion-estaciones");
var informacionEstaciones = new informacion_estaciones_1.InformacionEstaciones();
// Establece el tiempo (ms) de validez de los datos antes de que sea necesario actualziarlos
var tiempoValidezDatos = 2 * 60 * 1000; // 2min
var datosPrecipitacionCache;
var getPrecipitacionesTR = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var datosPrecipitacion, datosPC, datosP, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                datosPrecipitacion = [];
                if (!(datosPrecipitacionCache && Date.now() - datosPrecipitacionCache.fecha.getTime() < tiempoValidezDatos)) return [3 /*break*/, 1];
                // Cargar datos cacheados
                datosPrecipitacion = datosPrecipitacionCache.datos;
                return [3 /*break*/, 4];
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, capturarDatosPluviometricos()];
            case 2:
                datosPC = _a.sent();
                datosP = transformarDatosPluviometricos(datosPC);
                datosPrecipitacion = datosP;
                datosPrecipitacionCache = { fecha: new Date(), datos: datosP };
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                res.status(500).json({ ok: false, error: (err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || err_1 || 'desconocido' });
                return [3 /*break*/, 4];
            case 4:
                res.status(200).send(datosPrecipitacion);
                return [2 /*return*/];
        }
    });
}); };
exports.getPrecipitacionesTR = getPrecipitacionesTR;
// Captura los datos de precipitaciones en crudo.
var capturarDatosPluviometricos = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                axios.default
                    .get('https://www.chguadalquivir.es/saih/LluviaTabla.aspx')
                    .then(function (resp) {
                    try {
                        var $_1 = cheerio.load(resp.data);
                        var lista = $_1('#ContentPlaceHolder1_GridLluviaTiempoReal tbody').children();
                        var datos_1 = [];
                        lista.each(function (i, elem) {
                            if (i === 0) {
                                return; // No queremos la cabecera de la tabla
                            }
                            var fila = $_1(elem, 'tr').children();
                            var obj = {
                                nombrePluviometro: fila.eq(1).text(),
                                precipitacionesHoraActual: fila.eq(2).text(),
                                precipitacionesHoraAnterior: fila.eq(3).text(),
                                precipitacionesAcumuladoHoy: fila.eq(5).text(),
                                precipitacionesAcumuladoAyer: fila.eq(6).text(),
                                precipitacionesUnidad: fila.eq(6).text(),
                            };
                            datos_1.push(obj);
                            resolve(datos_1);
                        });
                        return datos_1;
                    }
                    catch (error) {
                        reject(new Error('Error al obtener los datos de la página cargada de CHG'));
                    }
                })
                    .catch(function () {
                    reject(new Error('Error al cargar la página de CHG'));
                });
            })];
    });
}); };
// Transforma los datos en crudo de precipitaciones
var transformarDatosPluviometricos = function (datosPC) {
    // Constantes donde se define una lista de códigos, que s
    var listaProvinciaCodigosNombre = [
        { codigos: ['AB', ''], nombre: 'Albacete' },
        { codigos: ['AL', ''], nombre: 'Almería' },
        { codigos: ['BA', ''], nombre: 'Badajoz' },
        { codigos: ['CE', 'RENEGADO - CEUTA'], nombre: 'Ceuta' },
        { codigos: ['CR', ''], nombre: 'Ciudad Real' },
        { codigos: ['CO', 'GUADALQUIVIR CORDOBA'], nombre: 'Córdoba' },
        { codigos: ['GR', ''], nombre: 'Granada' },
        { codigos: ['HU', ''], nombre: 'Huelva' },
        { codigos: ['JA', ''], nombre: 'Jaén' },
        { codigos: ['ME', 'LAS ADELFAS-MELILLA'], nombre: 'Melilla' },
        { codigos: ['SE', ''], nombre: 'Sevilla' },
    ];
    try {
        return datosPC.map(function (datoPC, idx, arr) {
            // Los nombres de los pluviometros pueden llegar en dos formatos:
            //   P03 CAÑADA DE CAÑEPLA (AL)  <-- Caso habitual
            //   B02 LAS ADELFAS-MELILLA     <-- Caso excepcional
            // Para los casos donde no se indica la provincia con (XX), en la constante de 'listaProvinciaCodigosNombre' se relaciona
            // el nombre del pluviómetros con la provincia a la que pertenece. Esta lista se irá actualizando conforme aparezcan más casos excepcionales.
            // Calcular código pluviómetro
            var pluviometroCodigo = datoPC.nombrePluviometro.split(' ')[0]; // Extraer código pluviometro. Se supone que siempre existe y tiene el formato M13
            // Calcular nombre pluviómetro
            var pluviometroNombre = datoPC.nombrePluviometro.substring(4); // Quitar código pluviómetro. Se supone que siempre existe y tiene el formato M13
            if (pluviometroNombre[0] === ' ') {
                // Elimina los dobles espacio en blanco en la captura de la pantalla por parte de Axios que ocurre algunas veces (A28  PTE. JONTOYA (JA))
                pluviometroNombre = pluviometroNombre.slice(1);
            }
            if (pluviometroNombre.slice(-1) === ')') {
                pluviometroNombre = pluviometroNombre.slice(0, pluviometroNombre.length - 4); // Quitar código provincia si existe. Se supone que tiene el formato (JA)
                while (pluviometroNombre.endsWith(' ')) {
                    pluviometroNombre = pluviometroNombre.slice(0, -1); // Quitar espacios en blanco del final.
                }
            }
            // Calcular código y nombre de provincia
            var provinciaNombreCodigo = listaProvinciaCodigosNombre.find(function (prov) {
                // Primero, busca por (XX)
                if (datoPC.nombrePluviometro.includes("(".concat(prov.codigos[0], ")"))) {
                    return true;
                }
                // Segundo, busca si el nombre del pluviometro está en la lista
                var nombreEncontrado = prov.codigos.slice(1).find(function (provCodigo) {
                    return datoPC.nombrePluviometro.includes(provCodigo);
                });
                if (nombreEncontrado) {
                    return true;
                }
                return false;
            }) || { codigos: ['ER'], nombre: 'ERROR' }; // En caso no tener (XX) y no estar registrado en la lista, entonces muestra ER ERROR
            var infoEstacion = informacionEstaciones.getInfoEstacion(pluviometroCodigo);
            var datoP = {
                pluviometro: {
                    codigo: pluviometroCodigo,
                    nombreWeb: pluviometroNombre,
                    nombrePdf: infoEstacion === null || infoEstacion === void 0 ? void 0 : infoEstacion.estacion.nombre,
                },
                provincia: {
                    codigo: provinciaNombreCodigo.codigos[0],
                    nombre: provinciaNombreCodigo.nombre,
                },
                municipio: infoEstacion === null || infoEstacion === void 0 ? void 0 : infoEstacion.localizacion.municipio,
                precipitacionesHoraActual: Number(datoPC.precipitacionesHoraActual.replace(',', '.')),
                precipitacionesHoraAnterior: Number(datoPC.precipitacionesHoraAnterior.replace(',', '.')),
                precipitacionesAcumuladoHoy: Number(datoPC.precipitacionesAcumuladoHoy.replace(',', '.')),
                precipitacionesAcumuladoAyer: Number(datoPC.precipitacionesAcumuladoAyer.replace(',', '.')),
                precipitacionesUnidad: datoPC.precipitacionesUnidad,
                coordenadasDecimal: infoEstacion === null || infoEstacion === void 0 ? void 0 : infoEstacion.coordenadasDecimal,
            };
            return datoP;
        });
    }
    catch (e) {
        throw new Error('Error al transformar los datos de precipitaciones en tiempo real');
    }
};
//# sourceMappingURL=tiempo-real-precipitaciones.controller.js.map