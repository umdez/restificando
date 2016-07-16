'use strict';

/*******************************************************************
 * Restificando é de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id deletar.js, criado em 14/07/2016 às 16:45:03 por Leo Felippe $
 *
 * Versão atual 0.0.2-Beta
 */

var utilitario = require('util');
var Base = require('./base');
var ControladorDeLeitura = require('./ler');

var Deletar = function(args) {
  Deletar.super_.call(this, args);
};

utilitario.inherits(Deletar, Base);

Deletar.prototype.acao = 'deletar';
Deletar.prototype.metodo = 'delete';
Deletar.prototype.plurality = 'singular';

Deletar.prototype.trazer = ControladorDeLeitura.prototype.trazer;

Deletar.prototype.escrever = function(req, res, contexto) {
  return contexto.instancia
    .destroy()
    .then(function() {
      contexto.instancia = {};
      return contexto.continuar;
    });
};

module.exports = Deletar;
