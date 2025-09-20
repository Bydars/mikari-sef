const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  name: "leavevc",
  aliases: ["lvc", "vcleave", "disconnect"],
  description: "Desconecta el selfbot del canal de voz actual.",
  usage: "leavevc",
  category: "general",

  async run({ msg, logger }) {
    try {
      if (!msg.guild) {
        return msg.temp("❌ Este comando solo funciona en servidores.", 4000);
      }

      const connection = getVoiceConnection(msg.guild.id);
      if (!connection) {
        return msg.temp("❌ No estoy en ningún canal de voz en este servidor.", 4000);
      }

      connection.destroy();
      await msg.temp("👋 Desconectado del canal de voz.", 4000);
    } catch (err) {
      logger.error("💥 Error al salir del canal de voz:", err);
      await msg.temp("❌ Ocurrió un error al desconectarme del canal de voz.", 4000);
    }
  },
};
