// public/js/components/particles.js - CORREGIDO
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;
  
  const particleCount = 20;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Tamaño aleatorio (igual que el original)
    const size = Math.random() * 20 + 5;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Posición inicial aleatoria
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    
    // Retraso de animación aleatorio
    particle.style.animationDelay = `${Math.random() * 15}s`;
    
    particlesContainer.appendChild(particle);
  }
}

function initParticles() {
  window.addEventListener('load', createParticles);
}

export { createParticles, initParticles };