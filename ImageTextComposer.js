const sharp = require('sharp');
const Jimp = require('jimp');
const moment = require('moment'); // Asegúrate de tener 'moment' como dependencia

class ImageTextComposer {
    constructor(backgroundImagePath, outputPath) {
        this.backgroundImagePath = backgroundImagePath;
        this.outputPath = outputPath;
    }

    async createImageWithText(text) {
        try {
            const background = await Jimp.read(this.backgroundImagePath);
            const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK); // Tamaño de fuente para el texto principal

            // Procedimiento para dividir el texto en líneas
            const maxWidth = background.bitmap.width * 0.5;
            let lines = this.splitTextIntoLines(text, font, maxWidth);

            const totalTextHeight = lines.reduce((total, line) => total + Jimp.measureTextHeight(font, line, maxWidth), 0);
            let yPos = (background.bitmap.height - totalTextHeight) / 2 - 30;

            for (let line of lines) {
                const textWidth = Jimp.measureText(font, line);
                const xPos = (background.bitmap.width - textWidth) / 2;
                background.print(font, xPos, yPos, line);
                yPos += Jimp.measureTextHeight(font, line, maxWidth);
            }

            // Añadir la firma con fuente de tamaño 64
            await this.printSignature(background, font);

            const buffer = await background.getBufferAsync(Jimp.MIME_PNG);
            await sharp(buffer).toFile(this.outputPath);
            console.log('Imagen creada con éxito.');
        } catch (err) {
            console.error('Error al crear la imagen:', err);
        }
    }

    splitTextIntoLines(text, font, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (let word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            if (Jimp.measureText(font, testLine) > maxWidth) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }

    async printSignature(image, font) {
        const signature = '@barrerot';

        const textWidth = Jimp.measureText(font, signature);
        const xPos = (image.bitmap.width - textWidth) / 2;
        const yPos = image.bitmap.height - 320; // Ajustar la posición para la firma más grande
        image.print(font, xPos, yPos, signature);

        // La fecha con fuente de tamaño 32
        const dateFont = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        await this.printDate(image, dateFont, yPos + 70); // Ajustar espacio entre firma y fecha
    }

    async printDate(image, font, yPos) {
        const dateText = moment().format('D [de] MMMM YYYY');
        const textWidth = Jimp.measureText(font, dateText);
        const xPos = (image.bitmap.width - textWidth) / 2;
        image.print(font, xPos, yPos, dateText);
    }
}

module.exports = ImageTextComposer;
