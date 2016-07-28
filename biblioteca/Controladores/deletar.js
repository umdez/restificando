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

/* @Objeto Deletar().
 *
 * Este é o controlador de deleção. Ele é chamado com o seguinte método DELETE:
 * fonte.deletar  DELETE /fonte/:identificador  (Requisita a remoção de um registro desta fonte) (Delete)
 * 
 * @Veja https://github.com/umdez/restificando/blob/master/docs/osControladores.md
 ----------------------------------------------------------------------------------------*/
var Deletar = function(args) {
  Deletar.super_.call(this, args);
};

utilitario.inherits(Deletar, Base);

Deletar.prototype.acao = 'deletar';
Deletar.prototype.metodo = 'delete';
Deletar.prototype.pluralidade = 'singular';

Deletar.prototype.trazer = ControladorDeLeitura.prototype.trazer;

/* @Método escrever().
 * 
 * @Parametro {Objeto} [req] A requisição feita ao servidor Express.
 * @Parametro {Objeto} [res] A resposta a requisição ao servidor Express.
 * @Parametro {Objeto} [contexto] Contêm informações deste contexto.
 */
Deletar.prototype.escrever = function(req, res, contexto) {
  return contexto.instancia
    .destroy()
    .then(function() {
      contexto.instancia = {};
      return contexto.continuar;
    });
};

module.exports = Deletar;
