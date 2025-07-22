(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "react", "./ClienteCard", "./BuscadorClientes"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("react"), require("./ClienteCard"), require("./BuscadorClientes"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.React, global.ClienteCard, global.BuscadorClientes);
    global.Ventas = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _react, _ClienteCard, _BuscadorClientes) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _react = _interopRequireWildcard(_react);
  _ClienteCard = _interopRequireDefault(_ClienteCard);
  _BuscadorClientes = _interopRequireDefault(_BuscadorClientes);
  function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
  function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
  const Ventas = () => {
    const [clienteSeleccionado, setClienteSeleccionado] = (0, _react.useState)(null);

    // Función para seleccionar un cliente desde el buscador o formulario
    const handleSeleccionarCliente = cliente => {
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
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h2", null, "Sistema de Ventas"), /*#__PURE__*/_react.default.createElement("p", null, "Debug: clienteSeleccionado = ", clienteSeleccionado ? 'SÍ' : 'NO'), !clienteSeleccionado && /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, "Mostrando BuscadorClientes..."), /*#__PURE__*/_react.default.createElement(_BuscadorClientes.default, {
      onSeleccionarCliente: handleSeleccionarCliente
    })), clienteSeleccionado && /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, "Mostrando ClienteCard..."), /*#__PURE__*/_react.default.createElement(_ClienteCard.default, {
      cliente: clienteSeleccionado,
      onCambiarCliente: handleCambiarCliente
    })));
  };
  var _default = _exports.default = Ventas;
});