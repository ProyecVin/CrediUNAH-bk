const getActualDateInLetters = (fecha = new Date()) => {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return fecha.toLocaleDateString('es-ES', options);
}

module.exports = {
    getActualDateInLetters
}