import { Request, Response, NextFunction } from 'express';
import * as cheerio from 'cheerio';
import * as axios from 'axios';
import { InformacionEstaciones } from '../nucleo/constantes/informacion-estaciones';

const informacionEstaciones = new InformacionEstaciones();

// Los datos pluviometricos en crudo obtenidos de la página de CHG
export interface DatosPluviometricosCapturados {
  nombrePluviometro: string;
  precipitacionesHoraActual: string;
  precipitacionesHoraAnterior: string;
  precipitacionesAcumuladoHoy: string;
  precipitacionesAcumuladoAyer: string;
  precipitacionesUnidad: string;
}

// Los datos pluviometricos transformados a enviar a cliente
export interface DatosPluviometricos {
  pluviometro: {
    codigo: string;
    nombreWeb: string;
    nombrePdf?: string;
  };
  provincia: {
    codigo: string;
    nombre: string;
  };
  municipio?: string;
  precipitacionesHoraActual: number;
  precipitacionesHoraAnterior: number;
  precipitacionesAcumuladoHoy: number;
  precipitacionesAcumuladoAyer: number;
  precipitacionesUnidad: string;
  coordenadasDecimal?: {
    lat: number;
    lng: number;
  };
}

// Establece el tiempo (ms) de validez de los datos antes de que sea necesario actualziarlos
const tiempoValidezDatos: number = 2 * 60 * 1000; // 2min
let datosPrecipitacionCache: { fecha: Date; datos: DatosPluviometricos[] } | undefined;

export const getPrecipitacionesTR = async (req: Request, res: Response, next: NextFunction) => {
  let datosPrecipitacion: DatosPluviometricos[] = [];

  if (datosPrecipitacionCache && Date.now() - datosPrecipitacionCache.fecha.getTime() < tiempoValidezDatos) {
    // Cargar datos cacheados
    datosPrecipitacion = datosPrecipitacionCache.datos;
  } else {
    // Obtener datos nuevos
    try {
      const datosPC: DatosPluviometricosCapturados[] = await capturarDatosPluviometricos();
      const datosP: DatosPluviometricos[] = transformarDatosPluviometricos(datosPC);
      datosPrecipitacion = datosP;
      datosPrecipitacionCache = { fecha: new Date(), datos: datosP };
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err?.message || err || 'desconocido' });
    }
  }

  res.status(200).send(datosPrecipitacion);
};

// Captura los datos de precipitaciones en crudo.
const capturarDatosPluviometricos = async (): Promise<DatosPluviometricosCapturados[]> => {
  return new Promise((resolve, reject) => {
    axios.default
      .get('https://www.chguadalquivir.es/saih/LluviaTabla.aspx')
      .then((resp) => {
        try {
          const $ = cheerio.load(resp.data);
          const lista = $('#ContentPlaceHolder1_GridLluviaTiempoReal tbody').children();
          const datos: DatosPluviometricosCapturados[] = [];

          lista.each((i, elem) => {
            if (i === 0) {
              return; // No queremos la cabecera de la tabla
            }
            const fila = $(elem, 'tr').children();
            const obj = {
              nombrePluviometro: fila.eq(1).text(),
              precipitacionesHoraActual: fila.eq(2).text(),
              precipitacionesHoraAnterior: fila.eq(3).text(),
              precipitacionesAcumuladoHoy: fila.eq(5).text(),
              precipitacionesAcumuladoAyer: fila.eq(6).text(),
              precipitacionesUnidad: fila.eq(6).text(),
            };
            datos.push(obj);
            resolve(datos);
          });
          return datos;
        } catch (error) {
          reject(new Error('Error al obtener los datos de la página cargada de CHG'));
        }
      })
      .catch(() => {
        reject(new Error('Error al cargar la página de CHG'));
      });
  });
};

// Transforma los datos en crudo de precipitaciones
const transformarDatosPluviometricos = (datosPC: DatosPluviometricosCapturados[]): DatosPluviometricos[] => {
  // Constantes donde se define una lista de códigos, que s
  const listaProvinciaCodigosNombre = [
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
    return datosPC.map((datoPC, idx, arr) => {
      // Los nombres de los pluviometros pueden llegar en dos formatos:
      //   P03 CAÑADA DE CAÑEPLA (AL)  <-- Caso habitual
      //   B02 LAS ADELFAS-MELILLA     <-- Caso excepcional
      // Para los casos donde no se indica la provincia con (XX), en la constante de 'listaProvinciaCodigosNombre' se relaciona
      // el nombre del pluviómetros con la provincia a la que pertenece. Esta lista se irá actualizando conforme aparezcan más casos excepcionales.

      // Calcular código pluviómetro
      const pluviometroCodigo: string = datoPC.nombrePluviometro.split(' ')[0]; // Extraer código pluviometro. Se supone que siempre existe y tiene el formato M13

      // Calcular nombre pluviómetro
      let pluviometroNombre: string = datoPC.nombrePluviometro.substring(4); // Quitar código pluviómetro. Se supone que siempre existe y tiene el formato M13
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
      const provinciaNombreCodigo = listaProvinciaCodigosNombre.find((prov) => {
        // Primero, busca por (XX)
        if (datoPC.nombrePluviometro.includes(`(${prov.codigos[0]})`)) {
          return true;
        }
        // Segundo, busca si el nombre del pluviometro está en la lista
        const nombreEncontrado = prov.codigos.slice(1).find((provCodigo) => {
          return datoPC.nombrePluviometro.includes(provCodigo);
        });
        if (nombreEncontrado) {
          return true;
        }
        return false;
      }) || { codigos: ['ER'], nombre: 'ERROR' }; // En caso no tener (XX) y no estar registrado en la lista, entonces muestra ER ERROR

      const infoEstacion = informacionEstaciones.getInfoEstacion(pluviometroCodigo);

      const datoP: DatosPluviometricos = {
        pluviometro: {
          codigo: pluviometroCodigo,
          nombreWeb: pluviometroNombre,
          nombrePdf: infoEstacion?.estacion.nombre,
        },
        provincia: {
          codigo: provinciaNombreCodigo.codigos[0],
          nombre: provinciaNombreCodigo.nombre,
        },
        municipio: infoEstacion?.localizacion.municipio,
        precipitacionesHoraActual: Number(datoPC.precipitacionesHoraActual.replace(',', '.')),
        precipitacionesHoraAnterior: Number(datoPC.precipitacionesHoraAnterior.replace(',', '.')),
        precipitacionesAcumuladoHoy: Number(datoPC.precipitacionesAcumuladoHoy.replace(',', '.')),
        precipitacionesAcumuladoAyer: Number(datoPC.precipitacionesAcumuladoAyer.replace(',', '.')),
        precipitacionesUnidad: datoPC.precipitacionesUnidad,
        coordenadasDecimal: infoEstacion?.coordenadasDecimal,
      };

      return datoP;
    });
  } catch (e) {
    throw new Error('Error al transformar los datos de precipitaciones en tiempo real');
  }
};
