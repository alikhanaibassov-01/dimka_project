function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || (err.code === 'LIMIT_FILE_SIZE' ? 400 : 500);
  const message =
    err.code === 'LIMIT_FILE_SIZE'
      ? 'Файл слишком большой (макс. 5 MB)'
      : err.message || 'Ішкі қате / Внутренняя ошибка';
  res.status(status).json({ error: message });
}

module.exports = errorHandler;
