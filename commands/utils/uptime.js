const sendTemp = require("../../utils/sendTemp");

module.exports = {
  name: "uptime",
  aliases: ["up"],
  description: "Muestra desde hace cuánto está activo Misaki.",
  usage: "uptime",
  category: "utils",

  async run({ client, msg }) {
    const total = Date.now() - client.stats.startedAt;

    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor(total / (1000 * 60 * 60)) % 24;
    const minutes = Math.floor(total / (1000 * 60)) % 60;
    const seconds = Math.floor(total / 1000) % 60;

    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    const content = `⏱️ Uptime: \`${parts.join(" ")}\``;
    await sendTemp(msg, content);
  },
};
