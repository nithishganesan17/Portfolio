const fs = require('fs');
const zlib = require('zlib');

function getPngPixels(filePath) {
    const buffer = fs.readFileSync(filePath);
    let offset = 8;
    let width = 0;
    let height = 0;
    let idatBuffers = [];
    
    while (offset < buffer.length) {
        const length = buffer.readInt32BE(offset);
        const type = buffer.toString('ascii', offset + 4, offset + 8);
        
        if (type === 'IHDR') {
            width = buffer.readInt32BE(offset + 8);
            height = buffer.readInt32BE(offset + 12);
        } else if (type === 'IDAT') {
            idatBuffers.push(buffer.subarray(offset + 8, offset + 8 + length));
        } else if (type === 'IEND') {
            break;
        }
        
        offset += 12 + length;
    }
    
    const decompressed = zlib.inflateSync(Buffer.concat(idatBuffers));
    const rowBytes = 1 + width * 4;
    const luma = new Float32Array(width * height);
    
    for (let y = 0; y < height; y++) {
        const rowStart = y * rowBytes;
        for (let x = 0; x < width; x++) {
            const pixelStart = rowStart + 1 + x * 4;
            const r = decompressed[pixelStart];
            const g = decompressed[pixelStart + 1];
            const b = decompressed[pixelStart + 2];
            const a = decompressed[pixelStart + 3];
            
            // If transparent, treat as white/background
            if (a < 10) {
                luma[y * width + x] = 255;
            } else {
                luma[y * width + x] = 0.299 * r + 0.587 * g + 0.114 * b;
            }
        }
    }
    
    return { width, height, luma };
}

try {
    const black = getPngPixels('black.png');
    const color = getPngPixels('color.png');
    
    const w = black.width;
    const h = black.height;
    
    // We will search for a shift (dx, dy) in range [-30, 30] that minimizes the absolute difference
    let minDiff = Infinity;
    let bestDx = 0;
    let bestDy = 0;
    
    for (let dy = -30; dy <= 30; dy++) {
        for (let dx = -30; dx <= 30; dx++) {
            let totalDiff = 0;
            let count = 0;
            
            for (let y = 0; y < h; y++) {
                const targetY = y + dy;
                if (targetY < 0 || targetY >= h) continue;
                
                for (let x = 0; x < w; x++) {
                    const targetX = x + dx;
                    if (targetX < 0 || targetX >= w) continue;
                    
                    const valBlack = black.luma[y * w + x];
                    const valColor = color.luma[targetY * w + targetX];
                    
                    totalDiff += Math.abs(valBlack - valColor);
                    count++;
                }
            }
            
            const avgDiff = totalDiff / count;
            if (avgDiff < minDiff) {
                minDiff = avgDiff;
                bestDx = dx;
                bestDy = dy;
            }
        }
    }
    
    console.log(`Best Shift (Color relative to Black): dx = ${bestDx}px, dy = ${bestDy}px`);
    console.log(`Minimum average luma difference: ${minDiff.toFixed(2)}`);
} catch (e) {
    console.error("Error:", e);
}
