function errorHandler(err, req, res, next) {
  console.error(`[Error ${req.method} ${req.url}]:`, err.message);

  const status = err.status || 500;
  const message = err.message || 'Erro interno no servidor.';

  return res.status(status).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;