function errorHandler(err, req, res, next) {
  const status = Number(err.status || 500);
  const message = status >= 500 ? "Internal server error" : err.message;

  const payload = {
    ok: false,
    error: message,
  };

  if (process.env.NODE_ENV !== "production") {
    payload.details = err.details;
  }

  // eslint-disable-next-line no-console
  if (status >= 500) console.error(err);

  res.status(status).json(payload);
}

module.exports = { errorHandler };

