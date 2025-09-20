const fs = require("fs");
const path = require("path");
const sendTemp = require("../../utils/sendTemp");

const PAGE_SIZE = 20;

module.exports = {
  name: "listaudios",
  aliases: ["laudios", "audios"],
  description: "Lista todos los audios disponibles en utils/audios.",
  usage: "listaudios",
  category: "general",

  async run({ msg }) {
    const audioDir = path.join(process.cwd(), "utils", "audios");

    if (!fs.existsSync(audioDir)) {
      return sendTemp(msg, "❌ Carpeta `utils/audios` no encontrada.", 4000);
    }

    const files = fs
      .readdirSync(audioDir)
      .filter((f) => f.endsWith(".mp3"))
      .map((f) => f.replace(/\.mp3$/, ""));

    if (files.length === 0) {
      return sendTemp(msg, "❌ No hay audios disponibles.", 4000);
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

      const block = "```md\n" + header + list + "\n```";
      await sendTemp(msg, block, 15_000);
    }
  },
};
