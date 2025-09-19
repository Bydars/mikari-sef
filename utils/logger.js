const fs = require("fs");
const path = require("path");
const LOG_DIR = path.join(process.cwd(), "logs");
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const CONFIG = {
  silent: false,
  json: false,
  keepDays: 30,
};

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

function now() {
  const d = new Date();
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  const s = d.getSeconds().toString().padStart(2, "0");
  const ms = d.getMilliseconds().toString().padStart(3, "0");
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return `${h}:${m}:${s}.${ms} ${tz}`;
}

function tag(level, extras = []) {
  const base = [`[${now()}]`, `[${level}]`, ...extras.map((e) => `[${e}]`)];
  return base.join("");
}

function serialize(args) {
  return args
    .map((a) => {
      if (a instanceof Error) return a.stack || a.message;
      if (typeof a === "object") {
        try {
          return JSON.stringify(a);
        } catch {
          return "[Circular]";
        }
      }
      return String(a);
    })
    .join(" ");
}

function getLogFile() {
  return path.join(LOG_DIR, `${new Date().toISOString().slice(0, 10)}.log`);
}

function cleanOldLogs() {
  try {
    const files = fs.readdirSync(LOG_DIR);
    const cutoff = Date.now() - CONFIG.keepDays * 24 * 60 * 60 * 1000;
    for (const f of files) {
      const full = path.join(LOG_DIR, f);
      const stats = fs.statSync(full);
      if (stats.mtimeMs < cutoff) {
        fs.unlinkSync(full);
      }
    }
  } catch (e) {
  }
}


function log(level, color, extras, ...args) {
  const message = serialize(args);
  const line = `${tag(level, extras)} ${message}`;
  try {
    const file = getLogFile();
    if (CONFIG.json) {
      const obj = { time: new Date().toISOString(), level, tags: extras, message };
      fs.appendFileSync(file, JSON.stringify(obj) + "\n");
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
  info: (...a) => log("INFO", COLORS.green, [], ...a),
  warn: (...a) => log("WARN", COLORS.yellow, [], ...a),
  error: (...a) => log("ERROR", COLORS.red, [], ...a),
  debug: (...a) => log("DEBUG", COLORS.magenta, [], ...a),
  raw: (...a) => log("RAW", COLORS.gray, [], ...a),

  tag: (tags = [], level = "INFO", color = COLORS.cyan, ...a) => {
    if (!Array.isArray(tags)) tags = [tags];
    return log(level, color, tags, ...a);
  },

  setSilent: (v) => (CONFIG.silent = v),
  setJson: (v) => (CONFIG.json = v),
  setKeepDays: (n) => (CONFIG.keepDays = n),
};

cleanOldLogs();

module.exports = logger;
