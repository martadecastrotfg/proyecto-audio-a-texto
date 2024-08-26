document.addEventListener('DOMContentLoaded', function() {
    const sessionForm = document.getElementById('sessionForm');
    const sessionList = document.getElementById('sessionList');
  
    // Cargar las sesiones existentes al cargar la página
    fetch('/api/sessions')
      .then(response => response.json())
      .then(sessions => {
        sessions.forEach(session => {
          const li = document.createElement('li');
          li.textContent = `${session.name}: ${session.description}`;
          sessionList.appendChild(li);
        });
      });
  
    // Manejar la creación de una nueva sesión
    sessionForm.addEventListener('submit', function(event) {
      event.preventDefault();
  
      const formData = new FormData(sessionForm);
      const sessionData = {
        name: formData.get('sessionName'),
        description: formData.get('sessionDescription'),
        status_id: formData.get('sessionStatus'),
        createdUser_id: formData.get('createdUser')
      };
  
      fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      })
      .then(response => response.json())
      .then(newSession => {
        const li = document.createElement('li');
        li.textContent = `${newSession.name}: ${newSession.description}`;
        sessionList.appendChild(li);
        sessionForm.reset();
      })
      .catch(error => console.error('Error al crear sesión:', error));
    });
  });
  