module.exports = {
  name: "ping",
  aliases: ["latency"],
  description: "Muestra la latencia actual.",
  usage: "ping",
  category: "utils",

  async run({ msg }) {
    try {
      const sentAt = Date.now();
      const placeholder = await msg.temp("🏓 Calculando...", 5000);
      if (!placeholder) return;
      const latency = Date.now() - sentAt;
      const content = `🏓 Pong! Latencia: \`${latency}ms\``;

      await placeholder.edit(content).catch(() => {});
    } catch (err) {
      console.error("❌ Error en comando ping:", err);
      await msg.react("⚠️").catch(() => {});
    }
  },
};
