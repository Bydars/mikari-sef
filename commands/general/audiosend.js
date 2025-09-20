const fs = require("fs");
const path = require("path");
const { MessageAttachment } = require("discord.js-selfbot-v13");

let lastAudio = null;

module.exports = {
  name: "sendaudio",
  aliases: ["saudio", "voice"],
  description: "Envía un mensaje de voz. Si no das nombre, se elige uno aleatorio no repetido.",
  usage: "sendaudio [nombre_sin_extension]",
  category: "media",

  async run({ msg, args }) {
    if (msg.deletable) msg.delete().catch(() => {});

    const audioDir = path.join(process.cwd(), "utils", "audios");
    if (!fs.existsSync(audioDir)) {
      return msg.channel.send("❌ Carpeta de audios no encontrada.")
        .then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
    }

    let name = args[0];

    if (!name) {
      const files = fs.readdirSync(audioDir)
        .filter(f => f.endsWith(".mp3"))
        .map(f => f.replace(/\.mp3$/, ""));

      if (files.length === 0) {
        return msg.channel.send("❌ No hay audios disponibles.")
          .then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
      }

      const candidates = files.filter(n => n !== lastAudio);
      const options = candidates.length > 0 ? candidates : files;
      name = options[Math.floor(Math.random() * options.length)];
      lastAudio = name;
    }

    const filePath = path.join(audioDir, `${name}.mp3`);
    if (!fs.existsSync(filePath)) {
      return msg.channel.send(`❌ Archivo no encontrado: \`${name}.mp3\``)
        .then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
    }

    try {
      const attachment = new MessageAttachment(
        filePath,
        `${name}.ogg`,
        {
          waveform: "AAAAAAAAAAAA",
          duration_secs: 2,
        }
      );

      await msg.channel.send({
        files: [attachment],
        flags: "IS_VOICE_MESSAGE",
      });

      console.log(`✅ Audio enviado: ${name}.mp3`);
    } catch (err) {
      console.error("❌ Error al enviar audio:", err);
      msg.channel.send("❌ Error al enviar el audio.")
        .then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
    }
  },
};
