## EJECUCION EN SERVIDOR LOCAL

Nodemon trae incorporado soporte para archivos de typescript. Para ello se apolla en la librería 'ts-node'.
Para correr el servicor en `http://localhost:3000` es necesario tener instalado globalemente 'ts-node' `npm install -g ts-node`, y despues ejecutar `npm run nodemon`

~~## DESPLIEGUE EN LA NUBE (CYCLIC)~~

~~Para desplegar a la nube (cyclic), primero hay que generar la build con `npm run postinstall` para que se generen los ficheros de distribución en la carpeta `./dist`. Después solo hay que hacer commit y subir al repositorio de github, y automáticamente 'cyclick' se encarga de desplegar la carpeta `./dist`, ya que ese repositorio tiene instalado el plugin de despliegue de 'cyclick'.~~

## DESPLIEGUE EN LA NUBE (RENDER)

para desplegar a la nube (RENDER), primero hay que generar la build con `npm run postinstall` para que se generen los ficheros de distribución en la carpeta `./dist`. Después solo hay que hacer commit y subir al repositorio de github, y automáticamente 'render' se encarga de desplegar la carpeta `./dist`.
