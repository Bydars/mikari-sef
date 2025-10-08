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
      const parts = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      await msg.temp(`⏱️ Uptime: \`${parts}\``);
    } catch (err) {
      console.error("❌ Error en comando uptime:", err);
      await msg.react("⚠️").catch(() => {});
    }
  },
};
