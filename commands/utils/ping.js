const sendTemp = require("../../utils/sendTemp");

module.exports = {
  name: "ping",
  aliases: ["latency"],
  description: "Muestra la latencia actual.",
  usage: "ping",
  category: "utils",

  async run({ msg }) {
    const sentAt = Date.now();
    const placeholder = await sendTemp(msg, "🏓 Calculando...");

    if (!placeholder) return;

    const latency = Date.now() - sentAt;
    const content = `🏓 Pong! Latencia: \`${latency}ms\``;

    await placeholder.edit(content).catch(() => null);
  },
};
