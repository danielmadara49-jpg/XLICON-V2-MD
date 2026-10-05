const fs = require("fs");
const { tmpdir } = require("os");
const path = require("path");
const Crypto = require("crypto");
const { execFileSync } = require("child_process");
const ffmpeg = require("fluent-ffmpeg");
const { addStickerMetadata } = require("../lib/sticker");

function ensureFFmpeg() {
    const isTermux = fs.existsSync(
        "/data/data/com.termux/files/usr/bin/termux-info"
    );

    if (!isTermux) {
        return;
    }

    try {
        execFileSync("ffmpeg", ["-version"], {
            stdio: "ignore"
        });
    } catch {
        try {
            console.log("Termux detected. Installing FFmpeg...");
            execFileSync("pkg", ["install", "-y", "ffmpeg"], {
                stdio: "inherit"
            });
            console.log("FFmpeg installation completed.");
        } catch (error) {
            console.error("FFmpeg installation failed:", error);
        }
    }
}

ensureFFmpeg();

function tempFile(ext) {
    return path.join(
        tmpdir(),
        `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}${ext}`
    );
}

function cleanupFiles(...files) {
    for (const file of files) {
        try {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        } catch {}
    }
}

function convertImageToWebp(buffer) {
    const input = tempFile(".input");
    const output = tempFile(".webp");

    return new Promise((resolve, reject) => {
        try {
            fs.writeFileSync(input, buffer);

            ffmpeg(input)
                .outputOptions([
                    "-vcodec libwebp",
                    "-pix_fmt yuva420p",
                    "-lossless 0",
                    "-compression_level 6",
                    "-vf scale=512:512:force_original_aspect_ratio=decrease:flags=lanczos,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0,format=yuva420p"
                ])
                .toFormat("webp")
                .on("end", () => {
                    try {
                        resolve(fs.readFileSync(output));
                    } catch (error) {
                        reject(error);
                    } finally {
                        cleanupFiles(input, output);
                    }
                })
                .on("error", error => {
                    cleanupFiles(input, output);
                    reject(error);
                })
                .save(output);
        } catch (error) {
            cleanupFiles(input, output);
            reject(error);
        }
    });
}

function convertVideoToWebp(buffer) {
    const input = tempFile(".mp4");
    const output = tempFile(".webp");

    return new Promise((resolve, reject) => {
        try {
            fs.writeFileSync(input, buffer);

            ffmpeg(input)
                .outputOptions([
                    "-vcodec libwebp",
                    "-pix_fmt yuva420p",
                    "-loop 0",
                    "-t 6",
                    "-an",
                    "-vsync 0",
                    "-compression_level 6",
                    "-vf scale=512:512:force_original_aspect_ratio=decrease:flags=lanczos,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0,fps=15,format=yuva420p"
                ])
                .toFormat("webp")
                .on("end", () => {
                    try {
                        resolve(fs.readFileSync(output));
                    } catch (error) {
                        reject(error);
                    } finally {
                        cleanupFiles(input, output);
                    }
                })
                .on("error", error => {
                    cleanupFiles(input, output);
                    reject(error);
                })
                .save(output);
        } catch (error) {
            cleanupFiles(input, output);
            reject(error);
        }
    });
}

module.exports = {
    name: "sticker",
    description: "Convert image or video to sticker with metadata",
    aliases: ["s", "stiker", "sticker"],
    tags: ["convert", "sticker", "tools"],
    command: /^\.?(sticker|stiker|s)/i,

    async execute(sock, m, args) {
        try {
            await sock.sendMessage(m.from, {
                react: {
                    text: "⏳",
                    key: m.key
                }
            });

            if (!m.quoted) {
                await sock.sendMessage(m.from, {
                    react: {
                        text: "❌",
                        key: m.key
                    }
                });

                return m.reply(
                    "Usage: Reply to an image or video with .sticker\n\nExample: Reply to a photo or video and type .sticker"
                );
            }

            const mimeType = (
                m.quoted.mtype ||
                m.quoted.msg?.mimetype ||
                m.quoted.mimetype ||
                ""
            ).toLowerCase();

            const isImage = mimeType.includes("image");
            const isVideo = mimeType.includes("video");

            if (!isImage && !isVideo) {
                await sock.sendMessage(m.from, {
                    react: {
                        text: "❌",
                        key: m.key
                    }
                });

                return m.reply(
                    "Please reply to an image or video to convert it to a sticker!"
                );
            }

            const buffer = await m.quoted.download();

            if (!buffer || buffer.length === 0) {
                await sock.sendMessage(m.from, {
                    react: {
                        text: "❌",
                        key: m.key
                    }
                });

                return m.reply("Failed to download media!");
            }

            let webpBuffer;

            if (isVideo) {
                webpBuffer = await convertVideoToWebp(buffer);
            } else {
                webpBuffer = await convertImageToWebp(buffer);
            }

            if (!webpBuffer || webpBuffer.length === 0) {
                await sock.sendMessage(m.from, {
                    react: {
                        text: "❌",
                        key: m.key
                    }
                });

                return m.reply("Failed to convert media to WebP!");
            }

            let packname = "XLICON V2";
            let author = "abztech";
            let categories = ["😀", "🎉"];
            let isAvatar = 0;

            if (args.length > 0) {
                const metaArgs = args.join(" ").split("|");

                if (metaArgs[0] && metaArgs[0].trim()) {
                    packname = metaArgs[0].trim();
                }

                if (metaArgs[1] && metaArgs[1].trim()) {
                    author = metaArgs[1].trim();
                }

                if (metaArgs[2] && metaArgs[2].trim()) {
                    categories = metaArgs[2]
                        .split(",")
                        .map(e => e.trim())
                        .filter(e => e);
                }

                if (
                    metaArgs[3] &&
                    metaArgs[3].trim().toLowerCase() === "avatar"
                ) {
                    isAvatar = 1;
                }
            }

            const stickerWithMetadata = await addStickerMetadata(
                webpBuffer,
                packname,
                author,
                categories,
                {
                    "is-avatar-sticker": isAvatar
                }
            );

            await sock.sendMessage(m.from, {
                sticker: stickerWithMetadata || webpBuffer
            });

            await sock.sendMessage(m.from, {
                react: {
                    text: "✅",
                    key: m.key
                }
            });
        } catch (err) {
            console.error("Sticker Creation Error:", err);

            try {
                await sock.sendMessage(m.from, {
                    react: {
                        text: "❌",
                        key: m.key
                    }
                });
            } catch {}

            await m.reply(
                "Failed to create sticker. Error: " + err.message
            );
        }
    }
};
