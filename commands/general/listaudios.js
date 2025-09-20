const fs = require("fs");
const path = require("path");

const PAGE_SIZE = 20;

module.exports = {
  name: "listaudios",
  aliases: ["laudios", "audios"],
  description: "Lista todos los audios disponibles en utils/audios.",
  usage: "listaudios",
  category: "general",

  async run({ msg }) {
    try {
      const audioDir = path.join(process.cwd(), "utils", "audios");

      if (!fs.existsSync(audioDir)) {
        return msg.temp("❌ Carpeta `utils/audios` no encontrada.", 4000);
      }

      const files = fs
        .readdirSync(audioDir)
        .filter((f) => f.toLowerCase().endsWith(".mp3"))
        .map((f) => f.replace(/\.mp3$/i, ""));

      if (!files.length) {
        return msg.temp("❌ No hay audios disponibles.", 4000);
      }

      const pages = [];
      for (let i = 0; i < files.length; i += PAGE_SIZE) {
        pages.push(files.slice(i, i + PAGE_SIZE));
      }

      for (let i = 0; i < pages.length; i++) {
        const header = `🎵 Lista de audios (página ${i + 1}/${pages.length}):\n`;
        const list = pages[i]
          .map((name, idx) => `${i * PAGE_SIZE + idx + 1}. ${name}`)
          .join("\n");

        const block = ["```md", header + list, "```"].join("\n");
        await msg.temp(block, 15_000);
      }
    } catch (err) {
      console.error("❌ Error en comando listaudios:", err);
      await msg.react("⚠️").catch(() => {});
    }
  },
};
