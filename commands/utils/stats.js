const sendTemp = require("../../utils/sendTemp");

module.exports = {
  name: "stats",
  aliases: ["status", "info"],
  description: "Muestra estadísticas del selfbot.",
  usage: "stats",
  category: "utils",

  async run({ client, msg }) {
    const mem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
    const cmds = client.stats.commandsUsed;
    const uptimeMs = Date.now() - client.stats.startedAt;

    const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60)) % 24;
    const minutes = Math.floor(uptimeMs / (1000 * 60)) % 60;
    const seconds = Math.floor(uptimeMs / 1000) % 60;

    const uptime = [
      days ? `${days}d` : null,
      hours ? `${hours}h` : null,
      minutes ? `${minutes}m` : null,
      `${seconds}s`,
    ]
      .filter(Boolean)
      .join(" ");

    const lines = [
      "# Misaki — Stats",
      `Usuario: ${client.user.tag} (${client.user.id})`,
      `Comandos usados: ${cmds}`,
      `Memoria: ${mem} MB`,
      `Uptime: ${uptime}`,
    ];

    const content = ["```md", ...lines, "```"].join("\n");
    await sendTemp(msg, content);
  },
};
