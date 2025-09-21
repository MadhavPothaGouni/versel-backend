const morgan = require("morgan");
const logger = require("winston");

logger.add(new logger.transports.Console({
  format: logger.format.simple(),
}));

module.exports = {
  requestLogger: morgan("dev"),
  appLogger: logger,
};
