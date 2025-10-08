const fs = require("fs");
const path = require("path");
const { PassThrough } = require("stream");
const { MessageAttachment } = require("discord.js-selfbot-v13");
const ffmpeg = require("fluent-ffmpeg");
const wav = require("wav-decoder");
const mm = require("music-metadata");

let lastAudio = null;

const isWin = process.platform === "win32";
const ffmpegPath = isWin
  ? path.resolve("utils", "libs", "ffmpeg", "win", "bin", "ffmpeg.exe")
  : path.resolve("utils", "libs", "ffmpeg", "linux", "bin", "ffmpeg");

ffmpeg.setFfmpegPath(ffmpegPath);

function decodeWavFromMp3(filePath) {
  return new Promise((resolve, reject) => {
    const output = new PassThrough();
    const chunks = [];

    ffmpeg(filePath)
      .format("wav")
      .on("error", err => reject(new Error("FFmpeg error: " + err.message)))
      .pipe(output);

    output.on("data", chunk => chunks.push(chunk));
    output.on("end", () => {
      const buffer = Buffer.concat(chunks);
      wav.decode(buffer).then(resolve).catch(err => {
        reject(new Error("WAV decode error: " + err.message));
      });
    });
  });
}

async function generateWaveform(filePath) {
  try {
    const { format } = await mm.parseFile(filePath);
    const duration = Math.max(1, Math.round(format.duration || 2));
    const audio = await decodeWavFromMp3(filePath);
    const channel = audio.channelData[0];
    const totalSamples = channel.length;
    const step = Math.floor(totalSamples / 64);

    const waveform = Array.from({ length: 64 }, (_, i) => {
      const start = i * step;
      const end = Math.min(start + step, totalSamples);
      const avg =
        channel.slice(start, end).reduce((a, b) => a + Math.abs(b), 0) /
        (end - start);
      return Math.min(255, Math.floor(avg * 512));
    });

    return {
      waveform: Buffer.from(waveform).toString("base64"),
      duration,
    };
  } catch {
    return {
      waveform: "AAAAAAAAAAAA",
      duration: 2,
    };
  }
}

module.exports = {
  name: "sendaudio",
  aliases: ["saudio", "voice"],
  description: "Envía un mensaje de voz con waveform real.",
  usage: "sendaudio [nombre]",
  category: "general",

  async run({ msg, args, logger }) {
    try {
      if (msg.deletable) await msg.delete().catch(() => {});

      const audioDir = path.resolve("utils", "audios");
      if (!fs.existsSync(audioDir)) {
        return msg.temp("❌ No existe la carpeta `utils/audios`.", 4000);
      }

      const audioList = fs
        .readdirSync(audioDir)
        .filter(f => f.endsWith(".mp3"))
        .map(f => f.replace(/\.mp3$/, ""));

      if (!audioList.length) {
        return msg.temp("❌ No hay audios disponibles.", 4000);
      }

      let name = args[0]?.toLowerCase();
      if (!name) {
        const pool = audioList.filter(f => f !== lastAudio);
        const choices = pool.length ? pool : audioList;
        name = choices[Math.floor(Math.random() * choices.length)];
      }

      const filePath = path.join(audioDir, `${name}.mp3`);
      if (!fs.existsSync(filePath)) {
        return msg.temp(`❌ Audio no encontrado: \`${name}.mp3\``, 4000);
      }

      const { waveform, duration } = await generateWaveform(filePath);

      const attachment = new MessageAttachment(filePath, `${name}.ogg`, {
        waveform,
        duration_secs: duration,
      });

      await msg.channel.send({
        files: [attachment],
        flags: "IS_VOICE_MESSAGE",
      });

      lastAudio = name;
      logger.info(`🎧 Audio enviado: ${name}.mp3 (${duration}s)`);
    } catch (err) {
      logger.error("❌ Error al enviar audio:", err);
      await msg.temp("❌ Hubo un error al enviar el audio.", 4000);
    }
  },
};
