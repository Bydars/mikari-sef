const sendTemp = require("../../utils/sendTemp");

module.exports = {
  name: "ping",
  aliases: ["latency"],
  description: "Muestra la latencia actual.",
  usage: "ping",
  category: "utils",

  async run({ client, msg }) {
    const start = Date.now();
    const tempMsg = await sendTemp(msg, "🏓 Calculando...");

    if (tempMsg) {
      const latency = Date.now() - start;
      await tempMsg.edit(`🏓 Pong! Latencia: \`${latency}ms\``).catch(() => {});
    }
  },
};
