const sendTemp = require("../../utils/sendTemp");

module.exports = {
  name: "uptime",
  aliases: ["up"],
  description: "Muestra desde hace cuánto está activo Misaki.",
  usage: "uptime",
  category: "utils",

  async run({ client, msg }) {
    const total = Date.now() - client.stats.startedAt;
    const seconds = Math.floor(total / 1000) % 60;
    const minutes = Math.floor(total / (1000 * 60)) % 60;
    const hours = Math.floor(total / (1000 * 60 * 60)) % 24;
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    const content = `⏱️ Uptime: \`${days}d ${hours}h ${minutes}m ${seconds}s\``;

    await sendTemp(msg, content);
  },
};
