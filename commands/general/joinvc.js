const {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
} = require("@discordjs/voice");

module.exports = {
  name: "joinvc",
  aliases: ["vc", "vjoin"],
  description: "Conecta el selfbot a un canal de voz por ID. Reintenta si es desconectado.",
  usage: "joinvc <canal_id>",
  category: "general",

  async run({ client, msg, args, logger }) {
    const MAX_RETRIES = 5;

    try {
      if (!msg.guild) {
        return msg.temp("❌ Este comando solo puede usarse en servidores.", 4000);
      }

      const vcId = args[0];
      if (!vcId || !/^\d{17,20}$/.test(vcId)) {
        return msg.temp(
          `❌ Uso incorrecto.\n📌 Correcto: \`${client.prefix}joinvc <canal_id>\``,
          6000
        );
      }

      const voiceChannel = msg.guild.channels.cache.get(vcId);
      if (!voiceChannel) {
        return msg.temp(`❌ No se encontró ningún canal con el ID \`${vcId}\`.`, 5000);
      }

      if (typeof voiceChannel.isVoice === "function" && !voiceChannel.isVoice()) {
        return msg.temp(`❌ El canal con ID \`${vcId}\` no es un canal de voz.`, 5000);
      }

      if (!voiceChannel.joinable) {
        return msg.temp(
          `❌ No tengo permisos para unirme a **${voiceChannel.name}**.`,
          5000
        );
      }

      await msg.temp(
        [
          "🎧 Conectando al canal de voz:",
          `• Nombre: **${voiceChannel.name}**`,
          `• ID: \`${voiceChannel.id}\``,
          `• Servidor: **${msg.guild.name}**`,
        ].join("\n"),
        6000
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
          await msg.temp(`✅ Conectado a **${voiceChannel.name}**.`, 5000);

          connection.on(VoiceConnectionStatus.Disconnected, async () => {
            if (attempts >= MAX_RETRIES) {
              await msg.temp(
                "⚠️ No pude reconectarme tras varios intentos. Cancelando.",
                5000
              );
              connection.destroy();
              return;
            }

            try {
              await entersState(connection, VoiceConnectionStatus.Connecting, 5_000);
            } catch {
              attempts++;
              await msg.temp(
                `🔁 Reintentando conexión... (${attempts}/${MAX_RETRIES})`,
                4000
              );
              setTimeout(connectToVoice, 4000);
            }
          });
        } catch (err) {
          logger.error("💥 Error al conectarse al canal de voz:", err);
          await msg.temp(
            "❌ Error al intentar conectarme al canal. Revisa el ID y permisos.",
            5000
          );
        }
      };

      await connectToVoice();
    } catch (err) {
      logger.error("💥 Excepción no controlada en joinvc:", err);
      await msg.react("⚠️").catch(() => {});
    }
  },
};
