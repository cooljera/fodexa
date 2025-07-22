(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "react"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("react"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.React);
    global.BuscadorClientes = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _react) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _react = _interopRequireWildcard(_react);
  function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
  const clientesEjemplo = [{
    id: 1,
    nombreCompleto: 'Juan Pérez',
    telefono: '555-1234',
    direccion: 'Calle 1'
  }, {
    id: 2,
    nombreCompleto: 'Ana Gómez',
    telefono: '555-5678',
    direccion: 'Calle 2'
  }];
  const BuscadorClientes = ({
    onSeleccionarCliente
  }) => {
    // Debug: Verificar que la prop se reciba correctamente
    console.log('BuscadorClientes: onSeleccionarCliente recibido:', typeof onSeleccionarCliente);
    const [clientes] = (0, _react.useState)(clientesEjemplo);
    const [form, setForm] = (0, _react.useState)({
      nombre: '',
      apellido: '',
      telefono: '',
      direccion: ''
    });
    const seleccionarCliente = cliente => {
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
    const crearNuevoCliente = e => {
      e.preventDefault();

      // Validar que todos los campos estén llenos
      if (!form.nombre.trim() || !form.apellido.trim() || !form.telefono.trim() || !form.direccion.trim()) {
        alert('Error: Todos los campos son obligatorios');
        return;
      }
      const nuevoCliente = {
        id: Date.now(),
        // ID único temporal
        nombreCompleto: `${form.nombre.trim()} ${form.apellido.trim()}`,
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim()
      };
      console.log('Creando nuevo cliente:', nuevoCliente);
      seleccionarCliente(nuevoCliente);
      // Limpiar el formulario después de crear el cliente
      setForm({
        nombre: '',
        apellido: '',
        telefono: '',
        direccion: ''
      });
    };
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h4", null, "Selecciona un cliente existente:"), /*#__PURE__*/_react.default.createElement("ul", null, clientes.map(cliente => /*#__PURE__*/_react.default.createElement("li", {
      key: cliente.id
    }, cliente.nombreCompleto, " - ", cliente.telefono, /*#__PURE__*/_react.default.createElement("button", {
      onClick: () => {
        console.log('Seleccionando cliente existente:', cliente);
        seleccionarCliente(cliente);
      },
      style: {
        marginLeft: 8
      }
    }, "Seleccionar")))), /*#__PURE__*/_react.default.createElement("h4", null, "O crea un nuevo cliente:"), /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: crearNuevoCliente,
      style: {
        marginTop: 12
      }
    }, /*#__PURE__*/_react.default.createElement("input", {
      type: "text",
      placeholder: "Nombre",
      value: form.nombre,
      onChange: e => setForm({
        ...form,
        nombre: e.target.value
      }),
      required: true
    }), /*#__PURE__*/_react.default.createElement("input", {
      type: "text",
      placeholder: "Apellido",
      value: form.apellido,
      onChange: e => setForm({
        ...form,
        apellido: e.target.value
      }),
      required: true
    }), /*#__PURE__*/_react.default.createElement("input", {
      type: "text",
      placeholder: "Tel\xE9fono",
      value: form.telefono,
      onChange: e => setForm({
        ...form,
        telefono: e.target.value
      }),
      required: true
    }), /*#__PURE__*/_react.default.createElement("input", {
      type: "text",
      placeholder: "Direcci\xF3n",
      value: form.direccion,
      onChange: e => setForm({
        ...form,
        direccion: e.target.value
      }),
      required: true
    }), /*#__PURE__*/_react.default.createElement("button", {
      type: "submit",
      style: {
        marginLeft: 8
      }
    }, "Crear y seleccionar")));
  };
  var _default = _exports.default = BuscadorClientes;
});