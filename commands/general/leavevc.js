const { getVoiceConnection } = require("@discordjs/voice");
const sendTemp = require("../../utils/sendTemp");

module.exports = {
  name: "leavevc",
  aliases: ["lvc", "vcleave", "disconnect"],
  description: "Desconecta el selfbot del canal de voz actual.",
  usage: "leavevc",
  category: "general",

  async run({ msg, logger }) {
    if (!msg.guild) {
      return sendTemp(msg, "❌ Este comando solo funciona en servidores.");
    }

    const connection = getVoiceConnection(msg.guild.id);
    if (!connection) {
      return sendTemp(msg, "❌ No estoy en ningún canal de voz en este servidor.");
    }

    try {
      connection.destroy();
      await sendTemp(msg, "👋 Desconectado del canal de voz.");
    } catch (err) {
      logger.error("💥 Error al salir del canal de voz:", err);
      await sendTemp(msg, "❌ Ocurrió un error al desconectarme del canal de voz.");
    }
  },
};
