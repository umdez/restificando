'use strict';

/*******************************************************************
 * Restificando é de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id ler.js, criado em 14/07/2016 às 12:17:03 por Leo Felippe $
 *
 * Versão atual 0.0.2-Beta
 */

var utilitario = require('util');
var Base = require('./base');
var erros = require('../Erros');

/* @Objeto Ler().
 *
 * Este é o controlador de leitura. Ele é chamado com o seguinte método GET:
 * fonte.ler       GET /fonte/:identificador            (Requisita um unico registro desta fonte passando um identificador) (Read)
 * 
 * @Veja https://github.com/umdez/restificando/blob/master/docs/osControladores.md
 ----------------------------------------------------------------------------------------*/
var Ler = function(args) {
  Ler.super_.call(this, args);
};

utilitario.inherits(Ler, Base);

Ler.prototype.acao = 'ler';
Ler.prototype.metodo = 'get';
Ler.prototype.pluralidade = 'singular';

/* @Método trazer().
 * 
 * @Parametro {Objeto} [req] A requisição feita ao servidor Express.
 * @Parametro {Objeto} [res] A resposta a requisição ao servidor Express.
 * @Parametro {Objeto} [contexto] Contêm informações deste contexto.
 */
Ler.prototype.trazer = function(req, res, contexto) {
  var modelo = this.modelo;
  var estagioFinal = this.estagioFinal;
  var opcoes = contexto.opcoes || {};
  var criterio = contexto.criterio || {};
  var incluir = this.incluir;
  var incluirEstesAtributos = this.incluirEstesAtributos || [];

  // Somente olhar os atributos que nós importam.
  opcoes.attributes = opcoes.atributos = opcoes.atributos || this.fonte.atributos;

  // Remove os parametros que estão já inclusos nos criterios.
  Object.keys(criterio).forEach(function(atrib) { delete req.params[atrib]; });
  
  // Selecionamos aqueles atributos do estágio final e os adicionamos nos criterios.
  estagioFinal.atributos.forEach(function(atributo) {
    if (atributo in req.params) criterio[atributo] = req.params[atributo];
  });

  if (Object.keys(criterio).length) {
    opcoes.where = criterio;
  }

  if (contexto.incluir && contexto.incluir.length) {
    incluir = incluir.concat(contexto.incluir);
  }

  if (incluir.length) { 
    opcoes.include = opcoes.incluir = incluir;
  }
  
  if (this.fonte.opcoesDeAssociacao.removerChaveEstrangeira) {
    opcoes.attributes = opcoes.atributos = opcoes.atributos.filter(function(atrib) {
      return incluirEstesAtributos.indexOf(atrib) === -1;
    });
  }
  
  return modelo.find(opcoes).then(function(instancia) {
    if (!instancia) {
      throw new erros.ErroDeNaoEncontrado();
    }

    contexto.instancia = instancia;
    return contexto.continuar;
  });
};

module.exports = Ler;
