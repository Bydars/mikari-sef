const { RichPresence, CustomStatus, SpotifyRPC } = require("discord.js-selfbot-v13");
const logger = require("./logger");

async function setupPresence(client, presenceConfig) {
  if (!presenceConfig || !presenceConfig.enabled) return;

  try {
    const activities = [];
    if (presenceConfig.mode === "rich") {
      let largeImg = presenceConfig.largeImage;

      // Si la imagen es externa, pedirla al CDN de Discord
      if (largeImg?.startsWith("http")) {
        try {
          const res = await RichPresence.getExternal(
            client,
            presenceConfig.applicationId,
            largeImg
          );
          if (res?.[0]) largeImg = res[0].external_asset_path;
        } catch (e) {
          logger.warn(`⚠️ No se pudo cargar imagen externa para RichPresence: ${e.message}`);
        }
      }

      // Tipo de actividad: PLAYING, STREAMING, LISTENING, WATCHING, COMPETING (configurable en config)
      const type = presenceConfig.type?.toUpperCase() || "PLAYING";

      const rp = new RichPresence(client)
        .setApplicationId(presenceConfig.applicationId)
        .setType(type)
        .setName(presenceConfig.name || "Misaki")
        .setDetails(presenceConfig.details || "")
        .setState(presenceConfig.state || "")
        .setURL(type === "STREAMING" ? presenceConfig.url : undefined) // URL solo si es STREAMING
        .setStartTimestamp(Date.now())
        .setAssetsLargeImage(largeImg)
        .setAssetsLargeText(presenceConfig.largeText || "")
        .setAssetsSmallImage(presenceConfig.smallImage || "")
        .setAssetsSmallText(presenceConfig.smallText || "")
        .setPlatform(presenceConfig.platform || "desktop");

      activities.push(rp);
    }

    if (presenceConfig.custom) {
      const custom = new CustomStatus(client)
        .setEmoji(presenceConfig.custom.emoji || "⭐")
        .setState(presenceConfig.custom.text || "");
      activities.push(custom);
    }

    // spotify rpc
    if (presenceConfig.spotify) {
      const sp = presenceConfig.spotify;

      if (!sp.track || !sp.artist) {
        logger.warn("⚠️ SpotifyRPC configurado pero faltan 'track' o 'artist'");
      } else {
        const spotify = new SpotifyRPC(client)
          .setAssetsLargeImage(sp.largeImage)
          .setAssetsSmallImage(sp.smallImage)
          .setAssetsLargeText(sp.album || "")
          .setState(sp.artist)
          .setDetails(sp.track)
          .setStartTimestamp(Date.now())
          .setEndTimestamp(Date.now() + (sp.duration || 180) * 1000)
          .setSongId(sp.songId || "")
          .setAlbumId(sp.albumId || "")
          .setArtistIds(...(sp.artistIds || []));

        activities.push(spotify);
      }
    }
    
    const status = presenceConfig.status || "online";
    client.user.setPresence({
      activities,
      status,
      afk: status === "idle",
    });

    logger.info(
      `🎭 Presencia RPC establecida con ${activities.length} actividades (estado=${status})`
    );
  } catch (err) {
    logger.error("❌ Error configurando presencia RPC:", err);
  }
}

module.exports = { setupPresence };
