const fs = require("fs");

module.exports = {
  name: "emojiroll",
  aliases: ["eroll"],
  description: "Lanza un emoji aleatorio (Unicode y personalizados si tienes Nitro).",
  usage: "emojiroll",
  category: "fun",

  async run({ client, msg }) {
    try {
      await msg.delete().catch(() => {});
      
      const unicode = JSON.parse(
        fs.readFileSync("assets/emojis-unicode.json", "utf8")
      );

      const custom = [];
      const hasNitro =
        client.user.premiumType > 0 || client.user.avatar?.startsWith("a_");

      if (hasNitro) {
        for (const guild of client.guilds.cache.values()) {
          for (const emoji of guild.emojis.cache.values()) {
            if (emoji.available) custom.push(emoji.toString());
          }
        }
      }

      const pool = unicode.concat(custom);
      if (!pool.length) return msg.temp("❌ No hay emojis disponibles.");
      const emoji = pool[Math.floor(Math.random() * pool.length)];
      return msg.channel.send(emoji);
    } catch (err) {
      console.error("❌ Error en emojiroll:", err);
      msg.temp("❌ Error al lanzar el emoji.");
    }
  },
};
