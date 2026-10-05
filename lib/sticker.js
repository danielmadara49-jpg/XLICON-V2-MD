const fs = require('fs');
const { tmpdir } = require('os');
const path = require('path');
const Crypto = require('crypto');
const webp = require('node-webpmux');
const ffmpeg = require('fluent-ffmpeg');

function tempFile(ext) {
    return path.join(
        tmpdir(),
        `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}${ext}`
    );
}

function videoToSticker(videoBuffer) {
    const input = tempFile('.mp4');
    const output = tempFile('.webp');

    return new Promise((resolve, reject) => {
        try {
            fs.writeFileSync(input, videoBuffer);

            ffmpeg(input)
                .outputOptions([
                    '-vcodec libwebp',
                    '-vf scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=black',
                    '-loop 0',
                    '-ss 0',
                    '-t 6',
                    '-an',
                    '-vsync 0'
                ])
                .toFormat('webp')
                .on('end', () => {
                    try {
                        resolve(fs.readFileSync(output));
                    } catch (error) {
                        reject(error);
                    } finally {
                        if (fs.existsSync(input)) fs.unlinkSync(input);
                        if (fs.existsSync(output)) fs.unlinkSync(output);
                    }
                })
                .on('error', error => {
                    if (fs.existsSync(input)) fs.unlinkSync(input);
                    if (fs.existsSync(output)) fs.unlinkSync(output);
                    reject(error);
                })
                .save(output);
        } catch (error) {
            if (fs.existsSync(input)) fs.unlinkSync(input);
            if (fs.existsSync(output)) fs.unlinkSync(output);
            reject(error);
        }
    });
}

async function addStickerMetadata(webpBuffer, packname, author, categories = [''], extra = {}) {
    const tmpFileIn = tempFile('.webp');
    const tmpFileOut = tempFile('.webp');

    try {
        fs.writeFileSync(tmpFileIn, webpBuffer);

        const img = new webp.Image();
        const stickerPackId = Crypto.randomBytes(32).toString('hex');

        const json = {
            'sticker-pack-id': stickerPackId,
            'sticker-pack-name': packname || '',
            'sticker-pack-publisher': author || '',
            'emojis': categories.length ? categories : [''],
            ...extra
        };

        const exifAttr = Buffer.from([
            0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
            0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x16, 0x00, 0x00, 0x00
        ]);

        const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf-8');
        const exif = Buffer.concat([exifAttr, jsonBuffer]);
        exif.writeUIntLE(jsonBuffer.length, 14, 4);

        await img.load(tmpFileIn);
        img.exif = exif;
        await img.save(tmpFileOut);

        return fs.readFileSync(tmpFileOut);
    } catch (error) {
        console.error('addStickerMetadata error:', error);
        return webpBuffer;
    } finally {
        if (fs.existsSync(tmpFileIn)) fs.unlinkSync(tmpFileIn);
        if (fs.existsSync(tmpFileOut)) fs.unlinkSync(tmpFileOut);
    }
}

async function videoToStickerWithMetadata(videoBuffer, packname, author, categories = [''], extra = {}) {
    const sticker = await videoToSticker(videoBuffer);
    return addStickerMetadata(sticker, packname, author, categories, extra);
}

module.exports = {
    videoToSticker,
    addStickerMetadata,
    videoToStickerWithMetadata
};
