import React from 'react';

const ClienteCard = ({ cliente, onCambiarCliente }) => {
  // Validación de cliente
  if (!cliente) {
    console.warn('ClienteCard: No se recibió cliente');
    return null;
  }
  
  if (!cliente.nombreCompleto || !cliente.telefono || !cliente.direccion) {
    console.error('ClienteCard: Cliente con datos incompletos:', cliente);
    return (
      <div style={{ color: 'red', padding: '16px' }}>
        Error: Datos del cliente incompletos
      </div>
    );
  }

  return (
    <div style={{
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      background: '#fff',
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      maxWidth: '400px',
      margin: '16px 0',
      border: '2px solid #1976d2'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#1976d2' }}>
          {cliente.nombreCompleto}
        </div>
        <div style={{ color: '#ff9800', margin: '8px 0 0 0' }}>
          {cliente.telefono}
        </div>
        <div style={{ color: '#333', marginTop: 4 }}>
          {cliente.direccion}
        </div>
      </div>
      <button
        onClick={onCambiarCliente}
        style={{
          background: '#ff9800',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 16px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Cambiar cliente
      </button>
    </div>
  );
};

export default ClienteCard;