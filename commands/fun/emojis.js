const path = require("path");
const fs = require("fs");

module.exports = {
  name: "emojiroll",
  aliases: ["eroll"],
  description: "Lanza un emoji aleatorio (Unicode y personalizados si tienes Nitro).",
  usage: "emojiroll",
  category: "fun",

  async run({ msg }) {
    try {
      await msg.delete().catch(() => {});

      const unicode = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../../assets/emojis-unicode.json"), "utf8")
      );

      const custom = [];
      const self = msg.client.user;
      const hasNitro = self.premiumType > 0 || self.avatar?.startsWith("a_");

      if (hasNitro) {
        for (const guild of msg.client.guilds.cache.values()) {
          for (const emoji of guild.emojis.cache.values()) {
            if (emoji.available) custom.push(emoji.toString());
          }
        }
      }

      const pool = unicode.concat(custom);
      if (!pool.length) return msg.channel.send("❌ No hay emojis disponibles.");

      const emoji = pool[Math.floor(Math.random() * pool.length)];
      return msg.channel.send(emoji);
    } catch (err) {
      console.error("❌ Error en emojiroll:", err);
      msg.channel.send("❌ Error al lanzar el emoji.");
    }
  },
};
