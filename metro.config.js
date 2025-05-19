const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Добавляем настройки для правильной обработки MIME-типов
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      if (req.url.endsWith(".bundle")) {
        res.setHeader("Content-Type", "application/javascript");
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
