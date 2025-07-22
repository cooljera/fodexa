import React, { useState } from 'react';
import ClienteCard from './ClienteCard';
import BuscadorClientes from './BuscadorClientes';

const Ventas = () => {
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Función para seleccionar un cliente desde el buscador o formulario
  const handleSeleccionarCliente = (cliente) => {
    console.log('Ventas: Recibiendo cliente:', cliente);
    
    // Validar que el cliente tenga las propiedades necesarias
    if (!cliente || !cliente.nombreCompleto || !cliente.telefono || !cliente.direccion) {
      console.error('Ventas: Cliente inválido recibido:', cliente);
      alert('Error: No se pudo seleccionar el cliente. Datos incompletos.');
      return;
    }
    
    setClienteSeleccionado(cliente);
    console.log('Ventas: Cliente seleccionado exitosamente:', cliente);
  };

  // Función para cambiar de cliente (volver a mostrar el buscador)
  const handleCambiarCliente = () => {
    setClienteSeleccionado(null);
  };

  return (
    <div>
      <h2>Sistema de Ventas</h2>
      <p>Debug: clienteSeleccionado = {clienteSeleccionado ? 'SÍ' : 'NO'}</p>
      
      {/* Mostrar buscador solo si no hay cliente seleccionado */}
      {!clienteSeleccionado && (
        <div>
          <p>Mostrando BuscadorClientes...</p>
          <BuscadorClientes onSeleccionarCliente={handleSeleccionarCliente} />
        </div>
      )}

      {/* Mostrar tarjeta solo si hay cliente seleccionado */}
      {clienteSeleccionado && (
        <div>
          <p>Mostrando ClienteCard...</p>
          <ClienteCard
            cliente={clienteSeleccionado}
            onCambiarCliente={handleCambiarCliente}
          />
        </div>
      )}

      {/* ...resto del formulario de venta... */}
    </div>
  );
};

export default Ventas;