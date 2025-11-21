
export interface PixelData {
    char: string;
    color: string;
}

export interface AsciiResult {
    text: string; // Versión texto plano para copiar
    colorData: PixelData[][] | null; // Versión coloreada para renderizar
}

// Rampa Clásica (Contraste alto)
const CHARS_STANDARD = "@%#*+=-:. ";
// Rampa Estilo Código (Similar a tu imagen de referencia)
const CHARS_CODE = "W@B#8&0Qdbphwkmzu1{}?|/;:<>^,.' ";

export const imageToAscii = (
    img: HTMLImageElement,
    context: CanvasRenderingContext2D,
    width: number,
    invert: boolean = false,
    colorMode: boolean = false,
    charSetType: 'standard' | 'code' = 'standard'
): AsciiResult => {
    const aspectRatio = img.height / img.width;
    // Ajustamos la altura. En modo color (span) el line-height es menor, ajustamos factor
    const heightFactor = colorMode ? 0.6 : 0.55;
    const height = Math.floor(width * aspectRatio * heightFactor);

    context.canvas.width = width;
    context.canvas.height = height;
    
    context.clearRect(0, 0, width, height);
    context.drawImage(img, 0, 0, width, height);

    const imageData = context.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    
    let asciiText = '';
    const colorRows: PixelData[][] = [];

    const chars = charSetType === 'code' ? CHARS_CODE : CHARS_STANDARD;

    for (let y = 0; y < height; y++) {
        const rowPixels: PixelData[] = [];
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const r = pixels[index];
            const g = pixels[index + 1];
            const b = pixels[index + 2];
            const a = pixels[index + 3];

            // Si es totalmente transparente, usa un espacio
            if (a === 0) {
                asciiText += ' ';
                rowPixels.push({ char: ' ', color: 'transparent' });
                continue;
            }
            
            // Conversión a escala de grises para elegir el carácter
            const gray = (r * 0.2126 + g * 0.7152 + b * 0.0722);
            
            let charIndex = Math.floor((gray / 255) * (chars.length - 1));
            
            if (invert) {
                charIndex = (chars.length - 1) - charIndex;
            }
            
            const char = chars[charIndex];
            asciiText += char;

            if (colorMode) {
                rowPixels.push({
                    char: char,
                    color: `rgb(${r},${g},${b})`
                });
            }
        }
        asciiText += '\n';
        if (colorMode) {
            colorRows.push(rowPixels);
        }
    }

    return {
        text: asciiText,
        colorData: colorMode ? colorRows : null
    };
};
