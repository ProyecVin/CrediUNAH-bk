const { getConnection, sql } = require('../../config/awsDB');

class MediaModel {
    saveMedia = async (name, url, mediaTypeId, description) => {
        const pool = await getConnection();

        let transaction;

        // Iniciar transacción
        transaction = pool.transaction();
        await transaction.begin();
        
        try {
            // Validar campos requeridos
            if (!name || !url || !mediaTypeId) {
                throw new Error('Faltan parámetros requeridos: name, url, mediaTypeId');
            }

            // Query optimizada para SQL Server (retorna el ID insertado)
            const query = `
                INSERT INTO linkage.Media (
                    name,
                    URL,
                    media_type_id,
                    description,
                    created_at
                ) 
                OUTPUT inserted.ID
                VALUES (
                    @name,
                    @url,
                    @mediaTypeId,
                    @description,
                    GETDATE()
                )
            `;
            
            // Ejecutar consulta
            const result = await transaction.request()
                .input('name', sql.NVarChar, name)
                .input('url', sql.NVarChar, url)
                .input('mediaTypeId', sql.Int, mediaTypeId)
                .input('description', sql.NVarChar, description)
                .query(query);

            // Confirmar transacción
            await transaction.commit();

            // Retornar el ID insertado
            return {
                mediaId: result.recordset[0].ID,
                success: true,
                message: 'Media guardada exitosamente'
            };

        } catch (error) {
            // Revertir transacción en caso de error
            if (transaction) await transaction.rollback();
            
            console.error('Error guardando media:', error);
            throw new Error(`Error al guardar media: ${error.message}`);

        };

    };
}

module.exports = new MediaModel();