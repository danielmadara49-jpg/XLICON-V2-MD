module.exports = {
    name: 'kick',
    aliases: ['remove'],
    description: 'Kick a member from the group',
    enabled: true,

    async execute(sock, m, args) {
        try {
            if (!m.isGroup) {
                return await m.reply(
                    'ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴏɴʟʏ ᴡᴏʀᴋs ɪɴ ɢʀᴏᴜᴘs.'
                );
            }

            if (!m.isAdmin && !m.isOwner) {
                return await m.reply(
                    'ᴏɴʟʏ ᴀᴅᴍɪɴs ᴏʀ ᴏᴡɴᴇʀs ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.'
                );
            }

            const participants = Array.isArray(m.groupMetadata?.participants)
                ? m.groupMetadata.participants
                : [];

            if (!participants.length) {
                return await m.reply(
                    'ᴄᴏᴜʟᴅ ɴᴏᴛ ғɪɴᴅ ɢʀᴏᴜᴘ ᴘᴀʀᴛɪᴄɪᴘᴀɴᴛs.'
                );
            }

            let targetParticipant = null;

            const mentionedJid =
                m.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
                m.msg?.contextInfo?.mentionedJid;

            if (m.quoted?.key?.participant) {
                const quotedParticipant = m.quoted.key.participant;

                targetParticipant = participants.find(
                    p => p.id === quotedParticipant
                );
            } else if (mentionedJid?.length) {
                const mentioned = mentionedJid[0];

                targetParticipant = participants.find(
                    p =>
                        p.id === mentioned ||
                        p.phoneNumber === mentioned
                );
            } else if (args?.[0]) {
                const input = args[0]
                    .replace(/^@/, '')
                    .trim();

                const cleanNumber = input.replace(/[^0-9]/g, '');

                targetParticipant = participants.find(p => {
                    const id = p.id?.split('@')[0];
                    const phone = p.phoneNumber?.split('@')[0];

                    return id === input || phone === input;
                });

                if (!targetParticipant && cleanNumber.length >= 7) {
                    targetParticipant = participants.find(p => {
                        const id = p.id?.split('@')[0];
                        const phone = p.phoneNumber?.split('@')[0];

                        return (
                            id === cleanNumber ||
                            phone === cleanNumber
                        );
                    });
                }
            } else {
                return await m.reply(
                    'ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴍᴇssᴀɢᴇ, ᴛᴀɢ ᴀ ᴜsᴇʀ, ᴏʀ ᴘʀᴏᴠɪᴅᴇ ᴀ ɴᴜᴍʙᴇʀ ᴏʀ ʟɪᴅ ᴛᴏ ᴋɪᴄᴋ.'
                );
            }

            if (!targetParticipant) {
                return await m.reply(
                    'ᴄᴏᴜʟᴅ ɴᴏᴛ ɪᴅᴇɴᴛɪꜰʏ ᴛʜᴇ ᴜsᴇʀ ᴛᴏ ᴋɪᴄᴋ.'
                );
            }

            const targetJid = targetParticipant.id;

            if (!targetJid) {
                return await m.reply(
                    'ᴄᴏᴜʟᴅ ɴᴏᴛ ʀᴇsᴏʟᴠᴇ ᴛʜᴇ ᴜsᴇʀ ɪᴅᴇɴᴛɪᴛʏ.'
                );
            }

            const targetNumber =
                targetParticipant.phoneNumber?.split('@')[0] ||
                targetJid.split('@')[0];

            const owners = Array.isArray(global.owner)
                ? global.owner
                : [global.owner];

            const isBotOwner = owners.some(owner => {
                const ownerNumber = String(owner)
                    .replace(/[^0-9]/g, '');

                return (
                    ownerNumber &&
                    ownerNumber === targetNumber
                );
            });

            if (isBotOwner) {
                return await m.reply(
                    'ʏᴏᴜ ᴄᴀɴɴᴏᴛ ᴋɪᴄᴋ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ.'
                );
            }

            const senderJid = m.sender;

            const senderBase = senderJid
                ?.split(':')[0]
                ?.split('@')[0];

            const targetBase = targetJid
                ?.split(':')[0]
                ?.split('@')[0];

            if (
                senderBase &&
                targetBase &&
                senderBase === targetBase
            ) {
                return await m.reply(
                    'ʏᴏᴜ ᴄᴀɴɴᴏᴛ ᴋɪᴄᴋ ʏᴏᴜʀsᴇʟꜰ.'
                );
            }

            const botJid = sock.user?.id;

            const botBase = botJid
                ?.split(':')[0]
                ?.split('@')[0];

            if (
                targetBase &&
                botBase &&
                targetBase === botBase
            ) {
                return await m.reply(
                    'ʏᴏᴜ ᴄᴀɴɴᴏᴛ ᴋɪᴄᴋ ᴛʜᴇ ʙᴏᴛ.'
                );
            }

            await sock.groupParticipantsUpdate(
                m.from,
                [targetJid],
                'remove'
            );

            await m.reply(
                'ᴜsᴇʀ ʜᴀs ʙᴇᴇɴ ᴋɪᴄᴋᴇᴅ ꜰʀᴏᴍ ᴛʜᴇ ɢʀᴏᴜᴘ.'
            );

        } catch (err) {
            console.error('Kick command error:', err);

            if (
                err?.message?.includes('403') ||
                err?.data === 403
            ) {
                return await m.reply(
                    'ɪ ᴅᴏ ɴᴏᴛ ʜᴀᴠᴇ ᴘᴇʀᴍɪssɪᴏɴ ᴛᴏ ᴋɪᴄᴋ ᴜsᴇʀs. ᴍᴀᴋᴇ sᴜʀᴇ ɪ ᴀᴍ ᴀɴ ᴀᴅᴍɪɴ.'
                );
            }

            if (
                err?.message?.includes('400') ||
                err?.data === 400
            ) {
                return await m.reply(
                    'ᴄᴀɴɴᴏᴛ ᴋɪᴄᴋ ᴛʜɪs ᴜsᴇʀ. ᴛʜᴇʏ ᴍɪɢʜᴛ ᴀʟʀᴇᴀᴅʏ ʙᴇ ʀᴇᴍᴏᴠᴇᴅ ᴏʀ ɴᴏᴛ ɪɴ ᴛʜᴇ ɢʀᴏᴜᴘ.'
                );
            }

            if (
                err?.message?.includes(
                    'text.match is not a function'
                )
            ) {
                console.log(
                    'Kick succeeded but reply failed due to formatting'
                );
                return;
            }

            await m.reply(
                'ꜰᴀɪʟᴇᴅ ᴛᴏ ᴋɪᴄᴋ ᴛʜᴇ ᴜsᴇʀ. ᴇʀʀᴏʀ: ' +
                (err?.message || 'ᴜɴᴋɴᴏᴡɴ ᴇʀʀᴏʀ')
            );
        }
    }
};
