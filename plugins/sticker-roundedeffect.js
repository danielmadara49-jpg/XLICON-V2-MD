const pix = require('pixcore');

const TINTS = {
    red:    [1.35, 0.45, 0.45],
    blue:   [0.45, 0.55, 1.35],
    green:  [0.45, 1.35, 0.45],
    purple: [1.20, 0.40, 1.20],
    yellow: [1.20, 1.15, 0.35],
    cyan:   [0.35, 1.20, 1.20],
    pink:   [1.30, 0.40, 1.15],
};

function applyEffect(img, effect) {
    if (effect === 'normal' || effect === 'none') return img;

    if (effect === 'grayscale' || effect === 'grey') return img.grayscale();
    if (effect === 'invert') return img.negate();

    if (effect === 'sepia' || effect === 'vintage') {
        return img._apply(({ data, width, height }) => {
            const d = new Uint8Array(data);
            for (let i = 0; i < d.length; i += 4) {
                const r = d[i], g = d[i + 1], b = d[i + 2];
                d[i]     = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
                d[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
                d[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
            }
            return { data: d, width, height };
        });
    }

    if (effect === 'bright') {
        return img._apply(({ data, width, height }) => {
            const d = new Uint8Array(data);
            for (let i = 0; i < d.length; i += 4) {
                d[i]     = Math.min(255, d[i]     * 1.3);
                d[i + 1] = Math.min(255, d[i + 1] * 1.3);
                d[i + 2] = Math.min(255, d[i + 2] * 1.3);
            }
            return { data: d, width, height };
        });
    }

    if (effect === 'dark') {
        return img._apply(({ data, width, height }) => {
            const d = new Uint8Array(data);
            for (let i = 0; i < d.length; i += 4) {
                d[i]     = d[i]     * 0.7;
                d[i + 1] = d[i + 1] * 0.7;
                d[i + 2] = d[i + 2] * 0.7;
            }
            return { data: d, width, height };
        });
    }

    const t = TINTS[effect];
    if (t) {
        const [rm, gm, bm] = t;
        return img._apply(({ data, width, height }) => {
            const d = new Uint8Array(data);
            for (let i = 0; i < d.length; i += 4) {
                d[i]     = Math.min(255, d[i]     * rm);
                d[i + 1] = Math.min(255, d[i + 1] * gm);
                d[i + 2] = Math.min(255, d[i + 2] * bm);
            }
            return { data: d, width, height };
        });
    }

    return img;
}

function roundCorners(img) {
    const { width, height } = img.metadata();
    const radius = Math.min(width, height) * 0.08;

    return img._apply(({ data, width, height }) => {
        const d = new Uint8Array(data);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let cx, cy, inCorner = false;
                if (x < radius && y < radius) { cx = radius; cy = radius; inCorner = true; }
                else if (x >= width - radius && y < radius) { cx = width - radius; cy = radius; inCorner = true; }
                else if (x < radius && y >= height - radius) { cx = radius; cy = height - radius; inCorner = true; }
                else if (x >= width - radius && y >= height - radius) { cx = width - radius; cy = height - radius; inCorner = true; }

                if (inCorner) {
                    const distance = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
                    if (distance > radius) {
                        d[(y * width + x) * 4 + 3] = 0;
                    }
                }
            }
        }
        return { data: d, width, height };
    });
}

module.exports = {
    name: 'sticker',
    aliases: ['s', 'sr', 'stg'],
    description: 'Create rounded stickers with optional effects',

    async execute(sock, m) {
        if (!m.quoted || !m.quoted.isMedia) {
            return m.reply('Reply to an image with .sr');
        }

        try {
            await m.react('🎨');

            const args = (m.text || '').trim().split(/\s+/).slice(1);
            const effect = (args[0] || 'normal').toLowerCase();

            const allowedEffects = [
                'normal', 'none',
                'red', 'blue', 'green', 'purple', 'yellow', 'cyan', 'pink',
                'grayscale', 'grey', 'sepia', 'vintage',
                'invert', 'bright', 'dark',
            ];

            if (!allowedEffects.includes(effect)) {
                return m.reply(
                    `Unknown effect: ${effect}\n\n` +
                    `Available:\n` +
                    `.sr\n.sr red\n.sr blue\n.sr green\n.sr purple\n` +
                    `.sr yellow\n.sr cyan\n.sr pink\n.sr grayscale\n` +
                    `.sr sepia\n.sr vintage\n.sr invert\n.sr bright\n.sr dark`
                );
            }

            const input = await m.quoted.download();

            let img = await pix.read(input);
            img = img.resize(512, 512, { fit: 'contain' });
            img = applyEffect(img, effect);
            img = roundCorners(img);

            const stickerBuffer = await img.webp({ quality: 90 }).toBuffer();

            await m.reply({ sticker: stickerBuffer });
            await m.react('✅');

        } catch (err) {
            console.error('sticker error:', err);
            await m.reply('Failed to create sticker: ' + (err.message || err));
        }
    }
};
