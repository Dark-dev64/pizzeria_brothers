class TablesAPI {
  static baseURL = '/api';

  static async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Obtener todas las mesas
  static async getAllTables(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.activa !== undefined) queryParams.append('activa', filters.activa);
    if (filters.id_estado_mesa) queryParams.append('id_estado_mesa', filters.id_estado_mesa);
    if (filters.ubicacion) queryParams.append('ubicacion', filters.ubicacion);
    
    const queryString = queryParams.toString();
    const endpoint = `/mesas${queryString ? `?${queryString}` : ''}`;
    
    return await this.request(endpoint);
  }

  // Obtener estadísticas de mesas
  static async getStatistics() {
    return await this.request('/mesas/estadisticas');
  }

  // Cambiar estado de una mesa
  static async changeTableStatus(tableId, newStatusId, userId) {
    return await this.request(`/mesas/${tableId}/estado`, {
      method: 'PUT',
      body: JSON.stringify({
        id_estado_mesa: newStatusId,
        id_usuario: userId
      })
    });
  }

  // Obtener información del usuario actual
  static async getCurrentUser() {
    return await this.request('/auth/me');
  }

  // Obtener mesas por ubicación
  static async getTablesByLocation(location) {
    return await this.request(`/mesas/ubicacion/${encodeURIComponent(location)}`);
  }

  // Obtener mesa por ID
  static async getTableById(tableId) {
    return await this.request(`/mesas/${tableId}`);
  }
}