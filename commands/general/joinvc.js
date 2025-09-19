const {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const sendTemp = require("../../utils/sendTemp");

module.exports = {
  name: "joinvc",
  aliases: ["vc", "vjoin"],
  description: "Conecta el selfbot a un canal de voz del servidor por ID. Reintenta si es expulsado.",
  usage: "joinvc <canal_id>",
  category: "utils",

  async run({ client, msg, args, config }) {
    const MAX_RETRIES = 5;
    const prefix = config?.prefix || ".";

    if (!msg.guild) {
      return sendTemp(msg, "❌ Este comando solo puede usarse dentro de servidores.");
    }

    const vcId = args[0];
    if (!vcId || !/^\d{17,20}$/.test(vcId)) {
      return sendTemp(
        msg,
        `❌ Uso incorrecto.\n📌 Correcto: \`${prefix}joinvc <canal_id>\``
      );
    }

    const voiceChannel = msg.guild.channels.cache.get(vcId);

    if (!voiceChannel) {
      return sendTemp(msg, `❌ No se encontró ningún canal con el ID \`${vcId}\`.`);
    }

    if (voiceChannel.type !== "GUILD_VOICE") {
      return sendTemp(msg, `❌ El canal con ID \`${vcId}\` no es un canal de voz.`);
    }

    if (!voiceChannel.joinable) {
      return sendTemp(
        msg,
        `❌ No tengo permisos para unirme al canal **${voiceChannel.name}**.`
      );
    }

    const infoMsg =
      `🎧 Conectando al canal de voz:\n` +
      `• Nombre: **${voiceChannel.name}**\n` +
      `• ID: \`${voiceChannel.id}\`\n` +
      `• Tipo: Servidor\n`;

    await sendTemp(msg, infoMsg);

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
        await sendTemp(
          msg,
          `✅ Conectado exitosamente al canal de voz **${voiceChannel.name}**.`
        );

        connection.on(VoiceConnectionStatus.Disconnected, async () => {
          if (attempts >= MAX_RETRIES) {
            await sendTemp(
              msg,
              "⚠️ No pude reconectarme tras varios intentos. Cancelando."
            );
            connection.destroy();
            return;
          }

          try {
            await entersState(
              connection,
              VoiceConnectionStatus.Connecting,
              5_000
            );
          } catch {
            attempts++;
            await sendTemp(
              msg,
              `🔁 Reintentando conexión... (${attempts}/${MAX_RETRIES})`
            );
            setTimeout(connectToVoice, 4000);
          }
        });
      } catch (err) {
        console.error("💥 Error al conectarse al VC:", err);
        await sendTemp(
          msg,
          "❌ Error al intentar conectarse al canal. Verifica los permisos y el ID."
        );
      }
    };

    await connectToVoice();
  },
};
