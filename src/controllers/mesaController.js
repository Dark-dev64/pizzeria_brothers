const db = require('../../config/database');

class MesaController {
  // Obtener todas las mesas con filtros
  async obtenerTodas(req, res) {
    try {
      const { activa, id_estado_mesa, ubicacion } = req.query;
      
      const [rows] = await db.execute('CALL sp_mesas_obtener_todas(?, ?, ?)', [
        activa !== undefined ? parseInt(activa) : null,
        id_estado_mesa ? parseInt(id_estado_mesa) : null,
        ubicacion || null
      ]);
      
      res.json(rows[0]);
    } catch (error) {
      console.error('Error obteniendo mesas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener estadísticas de mesas
  async obtenerEstadisticas(req, res) {
    try {
      const [rows] = await db.execute('CALL sp_mesas_estadisticas()');
      res.json(rows[0][0]);
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Cambiar estado de una mesa
  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { id_estado_mesa, id_usuario } = req.body;
      
      if (!id_estado_mesa || !id_usuario) {
        return res.status(400).json({ error: 'Datos incompletos' });
      }

      const [rows] = await db.execute('CALL sp_mesa_cambiar_estado(?, ?, ?)', [
        parseInt(id),
        parseInt(id_estado_mesa),
        parseInt(id_usuario)
      ]);
      
      res.json({ 
        success: true, 
        mesa: rows[0][0],
        mensaje: 'Estado actualizado correctamente'
      });
    } catch (error) {
      console.error('Error cambiando estado de mesa:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener mesas por ubicación
  async obtenerPorUbicacion(req, res) {
    try {
      const { ubicacion } = req.params;
      
      const [rows] = await db.execute('CALL sp_mesas_obtener_por_ubicacion(?)', [ubicacion]);
      res.json(rows[0]);
    } catch (error) {
      console.error('Error obteniendo mesas por ubicación:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener mesa por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      
      const [rows] = await db.execute('CALL sp_mesa_obtener_por_id(?)', [parseInt(id)]);
      res.json(rows[0][0]);
    } catch (error) {
      console.error('Error obteniendo mesa por ID:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = new MesaController();