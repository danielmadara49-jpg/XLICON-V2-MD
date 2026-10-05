const axios = require('axios');

module.exports = {
    name: 'tourl',
    description: 'Upload files to sam-cdn.zone.id and get URL',
    aliases: ['upload', 'geturl', 'uguu'],
    tags: ['tools'],
    command: /^\.?(tourl|upload|geturl|uguu)$/i,

    async execute(sock, m, args) {
        try {
            const quoted = m.quoted ? m.quoted : m;
            const mime = (quoted.msg || quoted).mimetype || '';

            if (!m.quoted || !mime) {
                await m.reply(`┏━━━━━━━━━━━━━━━━━━━━┓
┃ ᴇʀʀᴏʀ
┃
┃ ᴘʟᴇᴀꜱᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀɴ
┃ ɪᴍᴀɢᴇ, ᴠɪᴅᴇᴏ, ᴏʀ ᴀᴜᴅɪᴏ
┃
┃ ᴇxᴀᴍᴘʟᴇ: .ᴛᴏᴜʀʟ
┗━━━━━━━━━━━━━━━━━━━━┛`);
                return;
            }

            await m.reply(`┏━━━━━━━━━━━━━━━━━━━━┓
┃ ᴜᴘʟᴏᴀᴅɪɴɢ...
┃
┃ ᴘʟᴇᴀꜱᴇ ᴡᴀɪᴛ ᴀ ᴍᴏᴍᴇɴᴛ
┗━━━━━━━━━━━━━━━━━━━━┛`);

            const buffer = await quoted.download();

            if (!buffer) {
                throw new Error('Failed to download quoted file');
            }

            const response = await axios.post(
                'https://sam-cdn.zone.id/upload',
                buffer,
                {
                    headers: {
                        'Content-Type': 'application/octet-stream'
                    },
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity
                }
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.error ||
                    response.data?.message ||
                    'Upload failed'
                );
            }

            const upload = response.data.upload;

            const uploadUrl =
                typeof upload === 'string'
                    ? upload
                    : upload?.url;

            if (!uploadUrl) {
                throw new Error(
                    'Upload succeeded but no URL was returned'
                );
            }

            const fileSizeKB =
                (buffer.length / 1024).toFixed(2);

            const fileSizeMB =
                (buffer.length / (1024 * 1024)).toFixed(2);

            const result = `┏━━━━━━━━━━━━━━━━━━━━┓
┃ ᴜᴘʟᴏᴀᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟ
┃
┃ ᴛʏᴘᴇ: ${mime.split('/')[0].toUpperCase()}
┃ ꜱɪᴢᴇ: ${fileSizeKB} ᴋʙ (${fileSizeMB} ᴍʙ)
┃ ᴜʀʟ: ${uploadUrl}
┃
┃ ᴜᴘʟᴏᴀᴅᴇᴅ
┗━━━━━━━━━━━━━━━━━━━━┛`;

            await m.reply(result);

        } catch (err) {
            console.error('Tourl Error:', err);

            await m.reply(`┏━━━━━━━━━━━━━━━━━━━━┓
┃ ᴜᴘʟᴏᴀᴅ ꜰᴀɪʟᴇᴅ
┃
┃ ᴇʀʀᴏʀ: ${err.response?.data?.message ||
                err.response?.data?.error ||
                err.message}
┃
┃ ᴘʟᴇᴀꜱᴇ ᴛʀʏ ᴀɢᴀɪɴ
┗━━━━━━━━━━━━━━━━━━━━┛`);
        }
    }
};
