module.exports = {
  name: "uptime",
  aliases: ["up"],
  description: "Muestra desde hace cuánto está activo Misaki.",
  usage: "uptime",
  category: "utils",

  async run({ client, msg }) {
    try {
      const total = Date.now() - client.stats.startedAt;

      const days = Math.floor(total / 86400000);
      const hours = Math.floor(total / 3600000) % 24;
      const minutes = Math.floor(total / 60000) % 60;
      const seconds = Math.floor(total / 1000) % 60;

      const parts = [];
      if (days) parts.push(`${days}d`);
      if (hours) parts.push(`${hours}h`);
      if (minutes) parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      await msg.temp(`⏱️ Uptime: \`${parts.join(" ")}\``);
    } catch (err) {
      console.error("❌ Error en comando uptime:", err);
      await msg.react("⚠️").catch(() => {});
    }
  },
};
