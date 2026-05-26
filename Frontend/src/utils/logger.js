const isDev = import.meta.env.DEV;


export const logger = {
  debug: (meta, message, ...args) => {
    if (isDev) {
      const prefix = typeof meta === "string" ? meta : `[${meta.module || "global"}:${meta.source || "log"}]`;
      console.debug(`🐛 ${prefix} ${message}`, ...args);
    }
  },

  info: (meta, message, ...args) => {
    if (isDev) {
      const prefix = typeof meta === "string" ? meta : `[${meta.module || "global"}:${meta.source || "log"}]`;
      console.info(`ℹ️ ${prefix} ${message}`, ...args);
    }
  },

  warn: (meta, message, ...args) => {
    const prefix = typeof meta === "string" ? meta : `[${meta.module || "global"}:${meta.source || "log"}]`;
    console.warn(`⚠️ ${prefix} ${message}`, ...args);
  },

  error: (meta, message, err, ...args) => {
    const prefix = typeof meta === "string" ? meta : `[${meta.module || "global"}:${meta.source || "log"}]`;
    const details = err instanceof Error ? {
      name: err.name,
      message: err.message,
      stack: isDev ? err.stack : undefined,
    } : err;

    console.error(`❌ ${prefix} ${message}`, details, ...args);
  }
};
