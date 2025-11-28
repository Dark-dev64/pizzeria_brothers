// ========== CONFIGURACIÓN INICIAL ==========
let tablesData = {
  floor1: [],
  floor2: [],
  floor3: []
};

let currentUser = null;
let autoRefreshInterval = null;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
  initializeDashboard();
  loadTablesData();
  startAutoRefresh();
});

async function initializeDashboard() {
  try {
    // Verificar autenticación
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Obtener información del usuario
    currentUser = await TablesAPI.getCurrentUser();
    if (currentUser && document.getElementById('userName')) {
      document.getElementById('userName').textContent = currentUser.nombre || 'Usuario';
    }

    // Configurar navegación de pisos
    document.querySelectorAll('.floor-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const floor = this.getAttribute('data-floor');
        switchFloor(floor);
      });
    });

    // Cargar estadísticas iniciales
    await loadStatistics();
    
  } catch (error) {
    console.error('Error inicializando dashboard:', error);
    showNotification('Error al cargar el dashboard', 'error');
  }
}

// ========== GESTIÓN DE PISOS ==========
function switchFloor(floorNumber) {
  // Remover clase active de todos los botones y secciones
  document.querySelectorAll('.floor-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelectorAll('.floor-section').forEach(section => {
    section.classList.remove('active');
  });

  // Activar el piso seleccionado
  document.querySelector(`.floor-btn[data-floor="${floorNumber}"]`).classList.add('active');
  document.getElementById(`floor${floorNumber}`).classList.add('active');
}

// ========== GESTIÓN DE MESAS ==========
async function loadTablesData() {
  try {
    // Obtener mesas de la API
    const mesas = await TablesAPI.getAllTables();
    
    // Organizar mesas por ubicación (piso)
    tablesData.floor1 = mesas.filter(mesa => mesa.ubicacion && mesa.ubicacion.toLowerCase().includes('primer') || mesa.id_mesa <= 12);
    tablesData.floor2 = mesas.filter(mesa => mesa.ubicacion && mesa.ubicacion.toLowerCase().includes('segundo') || (mesa.id_mesa > 12 && mesa.id_mesa <= 24));
    tablesData.floor3 = mesas.filter(mesa => mesa.ubicacion && (mesa.ubicacion.toLowerCase().includes('terraza') || mesa.ubicacion.toLowerCase().includes('tercer')) || mesa.id_mesa > 24);

    renderAllTables();
    updateGlobalStats();
    
  } catch (error) {
    console.error('Error cargando mesas:', error);
    showNotification('Error al cargar las mesas', 'error');
    
    // Datos de ejemplo como fallback
    loadExampleData();
  }
}

function loadExampleData() {
  // Datos de ejemplo en caso de error
  tablesData.floor1 = generateExampleTables(1, 12);
  tablesData.floor2 = generateExampleTables(13, 24);
  tablesData.floor3 = generateExampleTables(25, 36);
  
  renderAllTables();
  updateGlobalStats();
}

function generateExampleTables(start, end) {
  const tables = [];
  for (let i = start; i <= end; i++) {
    const statusId = Math.random() > 0.7 ? 2 : Math.random() > 0.8 ? 3 : 1;
    const status = statusId === 1 ? 'available' : statusId === 2 ? 'occupied' : 'reserved';
    
    tables.push({
      id_mesa: i,
      numero_mesa: i.toString().padStart(2, '0'),
      capacidad: [2, 4, 6, 8][Math.floor(Math.random() * 4)],
      id_estado_mesa: statusId,
      nombre_estado: status === 'available' ? 'Disponible' : status === 'occupied' ? 'Ocupada' : 'Reservada',
      ubicacion: getRandomLocation(),
      activa: true,
      pedidos_activos: status === 'occupied' ? Math.floor(Math.random() * 3) + 1 : 0
    });
  }
  return tables;
}

function getRandomLocation() {
  const locations = ['Frente ventana', 'Centro sala', 'Cerca bar', 'Zona tranquila'];
  return locations[Math.floor(Math.random() * locations.length)];
}

function renderAllTables() {
  renderTablesForFloor(1);
  renderTablesForFloor(2);
  renderTablesForFloor(3);
}

function renderTablesForFloor(floorNumber) {
  const container = document.getElementById(`tablesFloor${floorNumber}`);
  const floorTables = tablesData[`floor${floorNumber}`];
  
  container.innerHTML = '';

  floorTables.forEach(table => {
    const tableCard = createTableCard(table);
    container.appendChild(tableCard);
  });
}

function createTableCard(table) {
  const card = document.createElement('div');
  const status = getStatusFromId(table.id_estado_mesa);
  card.className = `table-card ${status}`;
  card.setAttribute('data-table', table.id_mesa);
  
  const statusClass = `status-${status}`;
  const statusText = table.nombre_estado || 
                    (status === 'available' ? 'DISPONIBLE' : 
                     status === 'occupied' ? 'OCUPADA' : 'RESERVADA');

  card.innerHTML = `
    <div class="table-header">
      <div class="table-number">Mesa ${table.numero_mesa}</div>
      <div class="table-status ${statusClass}">${statusText}</div>
    </div>
    <div class="table-info">
      <div class="info-item">
        <i class="fas fa-users"></i>
        <span>Capacidad: ${table.capacidad} personas</span>
      </div>
      <div class="info-item">
        <i class="fas fa-map-marker-alt"></i>
        <span>${table.ubicacion}</span>
      </div>
      <div class="info-item">
        <i class="fas fa-door-open"></i>
        <span>${getFloorFromLocation(table.ubicacion)}</span>
      </div>
      <div class="info-item">
        <i class="fas fa-shopping-cart"></i>
        <span>Pedidos: ${table.pedidos_activos || 0}</span>
      </div>
    </div>
    <div class="table-actions">
      <button class="action-btn occupy" ${status !== 'available' ? 'disabled' : ''} onclick="handleTableAction(${table.id_mesa}, 2)">
        <i class="fas fa-utensils"></i> Ocupar
      </button>
      <button class="action-btn reserve" ${status !== 'available' ? 'disabled' : ''} onclick="handleTableAction(${table.id_mesa}, 3)">
        <i class="fas fa-calendar-check"></i> Reservar
      </button>
      <button class="action-btn" onclick="handleTableAction(${table.id_mesa}, 1)">
        <i class="fas fa-check"></i> Liberar
      </button>
    </div>
  `;

  return card;
}

function getStatusFromId(statusId) {
  switch(statusId) {
    case 1: return 'available';
    case 2: return 'occupied';
    case 3: return 'reserved';
    default: return 'available';
  }
}

function getFloorFromLocation(location) {
  if (!location) return 'Piso 1';
  if (location.toLowerCase().includes('segundo')) return 'Piso 2';
  if (location.toLowerCase().includes('terraza') || location.toLowerCase().includes('tercer')) return 'Terraza';
  return 'Piso 1';
}

async function handleTableAction(tableId, newStatusId) {
  try {
    if (!currentUser) {
      showNotification('Usuario no autenticado', 'error');
      return;
    }

    const result = await TablesAPI.changeTableStatus(tableId, newStatusId, currentUser.id_usuario);
    
    if (result.success) {
      await loadTablesData(); // Recargar datos
      const statusText = getStatusFromId(newStatusId) === 'available' ? 'liberada' : 
                        getStatusFromId(newStatusId) === 'occupied' ? 'ocupada' : 'reservada';
      showNotification(`Mesa ${statusText} exitosamente`);
    } else {
      showNotification('Error al cambiar estado de la mesa', 'error');
    }
  } catch (error) {
    console.error('Error cambiando estado de mesa:', error);
    showNotification('Error al cambiar estado de la mesa', 'error');
  }
}

// ========== ESTADÍSTICAS ==========
async function loadStatistics() {
  try {
    const stats = await TablesAPI.getStatistics();
    updateStatsDisplay(stats);
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
    // Usar estadísticas calculadas localmente
    updateGlobalStats();
  }
}

function updateStatsDisplay(stats) {
  if (stats) {
    document.getElementById('totalTables').textContent = stats.total_mesas || 0;
    document.getElementById('availableTables').textContent = stats.mesas_disponibles || 0;
    document.getElementById('occupiedTables').textContent = stats.mesas_ocupadas || 0;
    document.getElementById('reservedTables').textContent = stats.mesas_reservadas || 0;
  }
}

function updateGlobalStats() {
  let total = 0;
  let available = 0;
  let occupied = 0;
  let reserved = 0;

  for (const floor in tablesData) {
    total += tablesData[floor].length;
    available += tablesData[floor].filter(table => table.id_estado_mesa === 1).length;
    occupied += tablesData[floor].filter(table => table.id_estado_mesa === 2).length;
    reserved += tablesData[floor].filter(table => table.id_estado_mesa === 3).length;
  }

  document.getElementById('totalTables').textContent = total;
  document.getElementById('availableTables').textContent = available;
  document.getElementById('occupiedTables').textContent = occupied;
  document.getElementById('reservedTables').textContent = reserved;
}

// ========== ACTUALIZACIÓN AUTOMÁTICA ==========
function startAutoRefresh() {
  // Actualizar cada 30 segundos
  autoRefreshInterval = setInterval(async () => {
    await loadTablesData();
    showNotification('<i class="fas fa-sync-alt"></i> Estado actualizado automáticamente');
  }, 30000);
}

function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
}

// ========== UI FUNCTIONS ==========
function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  const messageElement = document.getElementById('notificationMessage');
  
  // Añadir clase de tipo si es necesario
  notification.className = 'notification';
  if (type === 'error') {
    notification.classList.add('error');
  }
  
  messageElement.innerHTML = message;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

function logout() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    stopAutoRefresh();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}

// ========== EVENT LISTENERS GLOBALES ==========
window.handleTableAction = handleTableAction;
window.logout = logout;
window.showNotification = showNotification;