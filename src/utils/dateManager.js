const { DateTime } = require('luxon');

const getDateInAmericaCentral = () => {
    console.log(DateTime.now().setZone('America/Guatemala').toJSDate());
    return DateTime.now().setZone('America/Guatemala').toJSDate();
}

const formatDateDMY = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error('Se esperaba un objeto Date válido');
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

const getDateInLetters = (date = new Date()) => {
    const options = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
        timeZone: 'UTC' 
    };

    const formatter = new Intl.DateTimeFormat('es-ES', options);
    const parts = formatter.formatToParts(date);

    const day = parts.find(part => part.type === 'day').value;
    const month = parts.find(part => part.type === 'month').value;
    const year = parts.find(part => part.type === 'year').value;

    return `${day} de ${month} del año ${year}`;
};

const formatDateToDayMonthInLetters = (date) => {
    try {
        if (!date) throw new Error('No se proporcionó fecha');
        
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            throw new Error('fecha inválida');
        }

        const opciones = { 
            day: 'numeric', 
            month: 'long',
            timeZone: 'UTC'
        };
        
        return dateObj.toLocaleDateString('es-ES', opciones);
    } catch (error) {
        console.error('Error al formatear fecha:', error.message);
        return 'Fecha inválida';
    }
}

module.exports = {
    getDateInLetters,
    formatDateToDayMonthInLetters,
    formatDateDMY,
    getDateInAmericaCentral
}