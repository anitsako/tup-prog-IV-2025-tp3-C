export function notFound(req, res, next) {
  res.status(404).json({ message: 'Recurso no encontrado' });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  const status =
    err.status ?? err.statusCode ?? (err.name === 'ValidationError' ? 400 : 500);
  res.status(status).json({
    message: err.message || 'Error interno del servidor'
  });
}
