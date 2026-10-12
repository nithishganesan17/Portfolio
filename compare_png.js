const fs = require('fs');
const zlib = require('zlib');

function getPngAlphaBounds(filePath) {
    const buffer = fs.readFileSync(filePath);
    
    // Parse PNG chunks
    let offset = 8; // skip signature
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
        
        offset += 12 + length; // 4 length + 4 type + length + 4 CRC
    }
    
    // Decompress pixel data
    const compressed = Buffer.concat(idatBuffers);
    const decompressed = zlib.inflateSync(compressed);
    
    // PNG scanlines have a 1-byte filter type prefix at the start of each row
    const bytesPerPixel = 4; // Assuming RGBA
    const rowBytes = 1 + width * bytesPerPixel;
    
    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    
    let totalX = 0;
    let totalY = 0;
    let nonTransparentCount = 0;
    
    for (let y = 0; y < height; y++) {
        const rowStart = y * rowBytes;
        // Ignore filter byte at decompressed[rowStart]
        for (let x = 0; x < width; x++) {
            const pixelStart = rowStart + 1 + x * bytesPerPixel;
            const alpha = decompressed[pixelStart + 3];
            
            if (alpha > 10) { // Non-transparent pixel
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                
                totalX += x;
                totalY += y;
                nonTransparentCount++;
            }
        }
    }
    
    return {
        width,
        height,
        nonTransparentCount,
        bounds: { minX, maxX, minY, maxY },
        centerOfMass: {
            x: nonTransparentCount > 0 ? (totalX / nonTransparentCount) : 0,
            y: nonTransparentCount > 0 ? (totalY / nonTransparentCount) : 0
        }
    };
}

try {
    const blackInfo = getPngAlphaBounds('black.png');
    const colorInfo = getPngAlphaBounds('color.png');
    
    console.log("Black PNG Info:", JSON.stringify(blackInfo, null, 2));
    console.log("Color PNG Info:", JSON.stringify(colorInfo, null, 2));
    
    const dx = colorInfo.centerOfMass.x - blackInfo.centerOfMass.x;
    const dy = colorInfo.centerOfMass.y - blackInfo.centerOfMass.y;
    console.log(`\nPixel Shift (Color - Black): dx = ${dx.toFixed(2)}px, dy = ${dy.toFixed(2)}px`);
} catch (e) {
    console.error("Error analyzing images:", e);
}
