const { getVoiceConnection } = require("@discordjs/voice");
const sendTemp = require("../../utils/sendTemp");

module.exports = {
  name: "leavevc",
  aliases: ["lvc", "vcleave", "disconnect"],
  description: "Desconecta el selfbot del canal de voz actual.",
  usage: "leavevc",
  category: "general",

  async run({ client, msg, args, config }) {
    const prefix = config?.prefix || ".";

    if (!msg.guild) {
      return sendTemp(msg, "❌ Este comando solo funciona dentro de servidores.");
    }

    const connection = getVoiceConnection(msg.guild.id);

    if (!connection) {
      return sendTemp(msg, "❌ No estoy conectado a ningún canal de voz en este servidor.");
    }

    try {
      connection.destroy();
      await sendTemp(msg, "👋 Desconectado del canal de voz correctamente.");
    } catch (err) {
      console.error("💥 Error al salir del VC:", err);
      await sendTemp(msg, "❌ Ocurrió un error al intentar salir del canal de voz.");
    }
  },
};
