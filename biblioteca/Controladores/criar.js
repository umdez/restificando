'use strict';

/*******************************************************************
 * Restificando é de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id criar.js, criado em 21/07/2016 às 16:34 por Leo Felippe $
 *
 * Versão atual 0.0.2-Beta
 */

var _ = require('lodash');
var utilitario = require('util');
var Base = require('./base');

/* @Objeto Criar().
 *
 * Este é o controlador de criação. Ele é chamado com o seguinte método POST:
 * fonte.criar     POST /fonte                          (Requisita a criação de um registro para esta fonte)                (Create)
 * 
 * @Veja https://github.com/umdez/restificando/blob/master/docs/osControladores.md
 ----------------------------------------------------------------------------------------*/
var Criar = function(args) {
  Criar.super_.call(this, args);
};

utilitario.inherits(Criar, Base);

Criar.prototype.acao = 'criar';
Criar.prototype.metodo = 'post';
Criar.prototype.pluralidade = 'plural';

/* @Método escrever().
 * 
 * @Parametro {Objeto} [req] A requisição feita ao servidor Express.
 * @Parametro {Objeto} [res] A resposta a requisição ao servidor Express.
 * @Parametro {Objeto} [contexto] Contêm informações deste contexto.
 */
Criar.prototype.escrever = function(req, res, contexto) {
  contexto.atributos = _.extend(contexto.atributos, req.body);
  var meuObjt = this;

  // Verifica dados associados
  if (this.incluir && this.incluir.length) {
    _.values(meuObjt.fonte.informacoesDasAssociacoes).forEach(function(associacao) {
      if (contexto.atributos.hasOwnProperty(associacao.as)) {
        var atrib = contexto.atributos[associacao.as];

        if (_.isObject(atrib) && atrib.hasOwnProperty(associacao.primaryKey)) {
          contexto.atributos[associacao.identifier] = atrib[associacao.primaryKey];
          delete contexto.atributos[associacao.as];
        }
      }
    });
  }

  return this.modelo
    .create(contexto.atributos)
    .then(function(instancia) {
      if (meuObjt.fonte) {
        var estagioFinal = meuObjt.fonte.estagiosFinais.singular;
        var localizacao = estagioFinal.replace(/:(\w+)/g, function(encontrado, $1) {
          return instancia[$1];
        });
        res.set('Location': localizacao);
      }

      if (meuObjt.fonte.seForRecarregarInstancias === true) {
        var opcoesDeRecarga = {};
        if (Array.isArray(meuObjt.incluir) && meuObjt.incluir.length) {
          opcoesDeRecarga.include = meuObjt.incluir;
        }
        if (!!meuObjt.fonte.excluirAtributos) {
          opcoesDeRecarga.attributes = { exclude: meuObjt.fonte.excluirAtributos };
        }
        return instancia.reload(opcoesDeRecarga);
      }

      return instancia;
    }).then(function(instancia) {
      if (!!meuObjt.fonte.excluirAtributos) {
        meuObjt.fonte.excluirAtributos.forEach(function(atrib) {
          delete instancia.dataValues[atrib];
        });
      }

      res.status(201);
      contexto.instancia = instancia;
      return contexto.continuar;
    });
};

module.exports = Criar;
