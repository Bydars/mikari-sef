const fs = require("fs");
const path = require("path");

const LOG_DIR = path.resolve(process.cwd(), "logs");
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const COLORS = {
  reset: "\x1b[0m",
  gray: "\x1b[90m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

const parseBool = (val) =>
  typeof val === "string" && val.toLowerCase() === "true";

const parseIntOr = (val, fallback) => {
  const parsed = parseInt(val, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const CONFIG = {
  silent: parseBool(process.env.LOGGER_SILENT),
  json: parseBool(process.env.LOGGER_JSON),
  keepDays: parseIntOr(process.env.LOGGER_KEEP_DAYS, 30),
};

const formatTime = () => {
  const d = new Date();
  return (
    d.toTimeString().split(" ")[0] +
    "." +
    d.getMilliseconds().toString().padStart(3, "0")
  );
};

const getLogFile = () =>
  path.join(LOG_DIR, new Date().toISOString().slice(0, 10) + ".log");

const cleanOldLogs = () => {
  const cutoff = Date.now() - CONFIG.keepDays * 24 * 60 * 60 * 1000;
  for (const file of fs.readdirSync(LOG_DIR)) {
    try {
      const full = path.join(LOG_DIR, file);
      const stat = fs.statSync(full);
      if (stat.mtimeMs < cutoff) fs.unlinkSync(full);
    } catch {
    }
  }
};

const serialize = (args) =>
  args
    .map((arg) => {
      if (arg instanceof Error) return arg.stack || arg.message;
      if (typeof arg === "object") {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return "[Circular]";
        }
      }
      return String(arg);
    })
    .join(" ");

function writeLog(level, color, tags = [], ...args) {
  const time = formatTime();
  const lvl = level.padEnd(5);
  const tagStr = tags.map((t) => `[${t}]`).join("");
  const msg = serialize(args);

  const line = `[${time}] [${lvl}]${tagStr} ${msg}`;
  const file = getLogFile();

  try {
    if (CONFIG.json) {
      const payload = {
        time: new Date().toISOString(),
        level,
        tags,
        message: msg,
      };
      fs.appendFileSync(file, JSON.stringify(payload) + "\n");
    } else {
      fs.appendFileSync(file, line + "\n");
    }
  } catch {
  }

  if (!CONFIG.silent) {
    console.log(color + line + COLORS.reset);
  }
}

const logger = {
  info: (...a) => writeLog("INFO", COLORS.green, [], ...a),
  warn: (...a) => writeLog("WARN", COLORS.yellow, [], ...a),
  error: (...a) => writeLog("ERROR", COLORS.red, [], ...a),
  debug: (...a) => writeLog("DEBUG", COLORS.magenta, [], ...a),
  raw: (...a) => writeLog("RAW", COLORS.gray, [], ...a),

  tag: (tags = [], level = "INFO", color = COLORS.cyan, ...a) => {
    const arr = Array.isArray(tags) ? tags : [String(tags)];
    writeLog(level.toUpperCase(), color || COLORS.cyan, arr, ...a);
  },

  setSilent: (v) => {
    CONFIG.silent = !!v;
  },
  setJson: (v) => {
    CONFIG.json = !!v;
  },
  setKeepDays: (n) => {
    if (typeof n === "number" && n > 0) CONFIG.keepDays = n;
  },

  _config: CONFIG,
  _colors: COLORS,
};

cleanOldLogs();
module.exports = logger;
