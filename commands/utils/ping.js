const { performance } = require("perf_hooks");

module.exports = {
  name: "ping",
  aliases: ["latency"],
  description: "Muestra la latencia real del bot.",
  usage: "ping",
  category: "utils",

  async run({ msg }) {
    try {
      const start = performance.now();
      const placeholder = await msg.temp("🏓 Calculando latencia...", 15000);
      if (!placeholder) return;

      const end = performance.now();
      const msgLatency = Math.round(end - start);
      const wsPing = Math.round(msg.client.ws.ping);
      const total = msgLatency + wsPing;

      const formatted = [
        `🏓 **Mensaje:** \`${msgLatency}ms\``,
        `📡 **WebSocket:** \`${wsPing}ms\``,
        `📊 **Total estimado:** \`${total}ms\``
      ].join("\n");

      await placeholder.edit(formatted).catch(() => {});
    } catch (err) {
      console.error("❌ Error en comando ping:", err);
      await msg.react("⚠️").catch(() => {});
    }
  },
};
