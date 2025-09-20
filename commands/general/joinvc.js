const {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const sendTemp = require("../../utils/sendTemp");

module.exports = {
  name: "joinvc",
  aliases: ["vc", "vjoin"],
  description: "Conecta el selfbot a un canal de voz por ID. Reintenta si es desconectado.",
  usage: "joinvc <canal_id>",
  category: "general",

  async run({ client, msg, args, logger }) {
    const MAX_RETRIES = 5;

    if (!msg.guild) {
      return sendTemp(msg, "❌ Este comando solo puede usarse en servidores.");
    }

    const vcId = args[0];
    if (!vcId || !/^\d{17,20}$/.test(vcId)) {
      return sendTemp(
        msg,
        `❌ Uso incorrecto.\n📌 Correcto: \`${client.prefix}joinvc <canal_id>\``
      );
    }

    const voiceChannel = msg.guild.channels.cache.get(vcId);
    if (!voiceChannel) {
      return sendTemp(msg, `❌ No se encontró ningún canal con el ID \`${vcId}\`.`);
    }

    if (!voiceChannel.isVoice?.()) {
      return sendTemp(msg, `❌ El canal con ID \`${vcId}\` no es un canal de voz.`);
    }

    if (!voiceChannel.joinable) {
      return sendTemp(msg, `❌ No tengo permisos para unirme a **${voiceChannel.name}**.`);
    }

    await sendTemp(
      msg,
      [
        "🎧 Conectando al canal de voz:",
        `• Nombre: **${voiceChannel.name}**`,
        `• ID: \`${voiceChannel.id}\``,
        `• Servidor: **${msg.guild.name}**`,
      ].join("\n")
    );

    let attempts = 0;

    const connectToVoice = async () => {
      try {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
          selfDeaf: false,
          selfMute: false,
        });

        await entersState(connection, VoiceConnectionStatus.Ready, 15_000);
        await sendTemp(msg, `✅ Conectado a **${voiceChannel.name}**.`);

        connection.on(VoiceConnectionStatus.Disconnected, async () => {
          if (attempts >= MAX_RETRIES) {
            await sendTemp(msg, "⚠️ No pude reconectarme tras varios intentos. Cancelando.");
            connection.destroy();
            return;
          }

          try {
            await entersState(connection, VoiceConnectionStatus.Connecting, 5_000);
          } catch {
            attempts++;
            await sendTemp(msg, `🔁 Reintentando conexión... (${attempts}/${MAX_RETRIES})`);
            setTimeout(connectToVoice, 4000);
          }
        });
      } catch (err) {
        logger.error("💥 Error al conectarse al canal de voz:", err);
        await sendTemp(msg, "❌ Error al intentar conectarme al canal. Revisa el ID y permisos.");
      }
    };

    await connectToVoice();
  },
};
