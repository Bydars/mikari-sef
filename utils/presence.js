const {
  RichPresence,
  CustomStatus,
  SpotifyRPC,
} = require("discord.js-selfbot-v13");

const logger = require("./logger");

async function setupPresence(client, presenceConfig) {
  if (!presenceConfig || !presenceConfig.enabled) return;

  const activities = [];

  try {
    if (presenceConfig.mode === "rich") {
      const rp = await createRichPresence(client, presenceConfig);
      if (rp) activities.push(rp);
    }

    if (presenceConfig.custom) {
      const customStatus = createCustomStatus(client, presenceConfig.custom);
      if (customStatus) activities.push(customStatus);
    }

    if (presenceConfig.spotify) {
      const spotifyStatus = createSpotifyRPC(client, presenceConfig.spotify);
      if (spotifyStatus) activities.push(spotifyStatus);
    }

    const status = presenceConfig.status || "online";

    client.user.setPresence({
      activities,
      status,
      afk: status === "idle",
    });

    logger.info(
      `🎭 Presencia configurada (${status}) con ${activities.length} actividad(es)`
    );
  } catch (err) {
    logger.error("❌ Error al configurar la presencia:", err);
  }
}

async function createRichPresence(client, config) {
  if (!config.applicationId) {
    logger.warn("⚠️ RichPresence: falta 'applicationId'");
    return null;
  }

  let largeImg = config.largeImage;

  // Si se provee una imagen externa, intentar obtenerla desde Discord CDN
  if (largeImg?.startsWith("http")) {
    try {
      const res = await RichPresence.getExternal(client, config.applicationId, largeImg);
      if (res?.[0]) {
        largeImg = res[0].external_asset_path;
        logger.info("🌐 Imagen externa RichPresence cargada exitosamente.");
      } else {
        logger.warn("⚠️ No se pudo resolver imagen externa para RichPresence.");
      }
    } catch (e) {
      logger.warn(`⚠️ Error cargando imagen externa: ${e.message}`);
    }
  }

  const type = config.type?.toUpperCase() || "PLAYING";

  return new RichPresence(client)
    .setApplicationId(config.applicationId)
    .setType(type)
    .setName(config.name)
    .setDetails(config.details)
    .setState(config.state)
    .setURL(type === "STREAMING" ? config.url : undefined)
    .setStartTimestamp(Date.now())
    .setAssetsLargeImage(largeImg)
    .setAssetsLargeText(config.largeText)
    .setAssetsSmallImage(config.smallImage)
    .setAssetsSmallText(config.smallText)
    .setPlatform(config.platform || "desktop");
}

function createCustomStatus(client, customCfg) {
  const text = customCfg.text?.trim();
  if (!text && !customCfg.emoji) return null;

  return new CustomStatus(client)
    .setState(text || "")
    .setEmoji(customCfg.emoji || "");
}

function createSpotifyRPC(client, sp) {
  const { track, artist } = sp;

  if (!track || !artist) {
    logger.warn("⚠️ SpotifyRPC requiere 'track' y 'artist'");
    return null;
  }

  const now = Date.now();

  return new SpotifyRPC(client)
    .setAssetsLargeImage(sp.largeImage)
    .setAssetsSmallImage(sp.smallImage)
    .setAssetsLargeText(sp.album)
    .setState(artist)
    .setDetails(track)
    .setStartTimestamp(now)
    .setEndTimestamp(now + (sp.duration || 180) * 1000)
    .setSongId(sp.songId)
    .setAlbumId(sp.albumId)
    .setArtistIds(...(sp.artistIds || []));
}

module.exports = { setupPresence };
