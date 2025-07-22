import React, { useState } from 'react';

const clientesEjemplo = [
  { id: 1, nombreCompleto: 'Juan Pérez', telefono: '555-1234', direccion: 'Calle 1' },
  { id: 2, nombreCompleto: 'Ana Gómez', telefono: '555-5678', direccion: 'Calle 2' },
];

const BuscadorClientes = ({ onSeleccionarCliente }) => {
  // Debug: Verificar que la prop se reciba correctamente
  console.log('BuscadorClientes: onSeleccionarCliente recibido:', typeof onSeleccionarCliente);
  
  const [clientes] = useState(clientesEjemplo);
  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '', direccion: '' });

  const seleccionarCliente = (cliente) => {
    // Debug: Verificar función antes de usar
    if (typeof onSeleccionarCliente !== 'function') {
      console.error('ERROR: onSeleccionarCliente no es una función:', onSeleccionarCliente);
      alert('Error: La función onSeleccionarCliente no está definida correctamente');
      return;
    }

    // Validar que el cliente tenga las propiedades necesarias
    if (!cliente || !cliente.nombreCompleto || !cliente.telefono || !cliente.direccion) {
      console.error('Error: Cliente incompleto', cliente);
      alert('Error: Los datos del cliente están incompletos');
      return;
    }
    
    console.log('Cliente válido seleccionado:', cliente);
    
    try {
      onSeleccionarCliente(cliente);
      console.log('onSeleccionarCliente ejecutado exitosamente');
    } catch (error) {
      console.error('Error al ejecutar onSeleccionarCliente:', error);
      alert('Error: No se pudo seleccionar el cliente. Ver consola para detalles.');
    }
  };

  const crearNuevoCliente = (e) => {
    e.preventDefault();
    
    // Validar que todos los campos estén llenos
    if (!form.nombre.trim() || !form.apellido.trim() || !form.telefono.trim() || !form.direccion.trim()) {
      alert('Error: Todos los campos son obligatorios');
      return;
    }
    
    const nuevoCliente = {
      id: Date.now(), // ID único temporal
      nombreCompleto: `${form.nombre.trim()} ${form.apellido.trim()}`,
      telefono: form.telefono.trim(),
      direccion: form.direccion.trim(),
    };
    
    console.log('Creando nuevo cliente:', nuevoCliente);
    seleccionarCliente(nuevoCliente);
    // Limpiar el formulario después de crear el cliente
    setForm({ nombre: '', apellido: '', telefono: '', direccion: '' });
  };

  return (
    <div>
      <h4>Selecciona un cliente existente:</h4>
      <ul>
        {clientes.map((cliente) => (
          <li key={cliente.id}>
            {cliente.nombreCompleto} - {cliente.telefono}
            <button 
              onClick={() => {
                console.log('Seleccionando cliente existente:', cliente);
                seleccionarCliente(cliente);
              }} 
              style={{ marginLeft: 8 }}
            >
              Seleccionar
            </button>
          </li>
        ))}
      </ul>

      <h4>O crea un nuevo cliente:</h4>
      <form onSubmit={crearNuevoCliente} style={{ marginTop: 12 }}>
        <input
          type="text"
          placeholder="Nombre"
          value={form.nombre}
          onChange={e => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Apellido"
          value={form.apellido}
          onChange={e => setForm({ ...form, apellido: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={e => setForm({ ...form, telefono: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Dirección"
          value={form.direccion}
          onChange={e => setForm({ ...form, direccion: e.target.value })}
          required
        />
        <button type="submit" style={{ marginLeft: 8 }}>Crear y seleccionar</button>
      </form>
    </div>
  );
};

export default BuscadorClientes;