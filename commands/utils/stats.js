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
    const uptime = ((Date.now() - client.stats.startedAt) / 1000 / 60).toFixed(1);

    const content =
      "```md\n" +
      `# Misaki — Stats\n` +
      `Usuario: ${client.user.tag} (${client.user.id})\n` +
      `Comandos usados: ${cmds}\n` +
      `Memoria: ${mem} MB\n` +
      `Uptime: ${uptime} min\n` +
      "```";

    await sendTemp(msg, content);
  },
};
