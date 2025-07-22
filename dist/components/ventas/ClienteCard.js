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
    global.ClienteCard = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _react) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _react = _interopRequireDefault(_react);
  function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
  const ClienteCard = ({
    cliente,
    onCambiarCliente
  }) => {
    // Validación de cliente
    if (!cliente) {
      console.warn('ClienteCard: No se recibió cliente');
      return null;
    }
    if (!cliente.nombreCompleto || !cliente.telefono || !cliente.direccion) {
      console.error('ClienteCard: Cliente con datos incompletos:', cliente);
      return /*#__PURE__*/_react.default.createElement("div", {
        style: {
          color: 'red',
          padding: '16px'
        }
      }, "Error: Datos del cliente incompletos");
    }
    return /*#__PURE__*/_react.default.createElement("div", {
      style: {
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
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/_react.default.createElement("div", {
      style: {
        fontWeight: 'bold',
        fontSize: '1.2rem',
        color: '#1976d2'
      }
    }, cliente.nombreCompleto), /*#__PURE__*/_react.default.createElement("div", {
      style: {
        color: '#ff9800',
        margin: '8px 0 0 0'
      }
    }, cliente.telefono), /*#__PURE__*/_react.default.createElement("div", {
      style: {
        color: '#333',
        marginTop: 4
      }
    }, cliente.direccion)), /*#__PURE__*/_react.default.createElement("button", {
      onClick: onCambiarCliente,
      style: {
        background: '#ff9800',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 16px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }
    }, "Cambiar cliente"));
  };
  var _default = _exports.default = ClienteCard;
});