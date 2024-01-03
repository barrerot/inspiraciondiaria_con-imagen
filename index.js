// Importar las dependencias necesarias
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');
const moment = require('moment');
const ImageTextComposer = require("./ImageTextComposer");

// Configurar Moment.js para usar el idioma español
moment.locale('es');

// Cargar variables de entorno
const WP_URL = process.env.WP_URL;
const USER = process.env.WP_USER;
const PASSWORD = process.env.WP_PASSWORD;
const CSV_FILE = process.env.CSV_FILE;

// Función para crear un post en WordPress
const createPost = async (date, content) => {
  // Formatear la fecha al estándar ISO 8601 y al formato deseado
  const formattedDateISO = moment(date).format('YYYY-MM-DDTHH:mm:ss');
  const formattedDate = moment(date).format('dddd DD [de] MMMM YYYY'); // Ejemplo: Miércoles 27 de diciembre de 2023

  const postData = {
    date: formattedDateISO,
    status: 'publish',
    title: content,
    content: `La frase de inspiración de hoy ${formattedDate} es: ${content}`,
    categories: [12] // ID de la categoría
  };

  try {
    const response = await axios.post(`${WP_URL}/posts`, postData, {
      auth: {
        username: USER,
        password: PASSWORD,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error al crear el post:', error.message);
    if (error.response) {
        console.log('Data:', error.response.data);
        console.log('Status:', error.response.status);
        console.log('Headers:', error.response.headers);
    } else if (error.request) {
        console.log('Request:', error.request);
    } else {
        console.log('Error', error.message);
    }
  }
};

// Función principal para publicar la frase del día
const publishPost = () => {
  fs.createReadStream(CSV_FILE)
    .pipe(csv())
    .on('data', async (row) => {
      const today = moment().format('YYYY-MM-DD');
      if (row.fecha === today) {
        //const postResult = await createPost(today, row.frases);
        // Configura estas variables con tus propios valores
const backgroundImagePath = "./assets/background.png"; // Ruta a la imagen de fondo
const text = row.frases;

// Generar un timestamp único con formato año, mes, día, hora, minutos y segundos
const timestamp = moment().format('YYYYMMDD_HHmmss');

// Concatenar el timestamp con el nombre del archivo de salida
const outputPath = `./assets/output/${timestamp}_output.png`; 

// Crear una instancia de ImageTextComposer
const composer = new ImageTextComposer(backgroundImagePath, outputPath);

// Usar la instancia para crear una imagen con texto
composer.createImageWithText(text)
    .then(() => console.log('Proceso completado.'))
    .catch(err => console.error('Error al crear la imagen:', err));
       
      }
    })
    .on('end', () => {
      console.log('Proceso finalizado.');
    });
};

// Ejecutar la función principal
publishPost();
