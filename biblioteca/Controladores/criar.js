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

var _ = require('lodash'),
    utilitario = require('util'),
    Base = require('./base');

var Criar = function(args) {
  Criar.super_.call(this, args);
};

utilitario.inherits(Criar, Base);

Criar.prototype.acao = 'criar';
Criar.prototype.metodo = 'post';
Criar.prototype.pluralidade = 'plural';

Criar.prototype.escrever = function(req, res, contexto) {
  contexto.atributos = _.extend(contexto.atributos, req.body);
  var meuObjt = this;

  // Verifica dados associados
  if (this.incluir && this.incluir.length) {
    _.values(meuObjt.fonte.informacoesDasAssociacoes).forEach(function(associacao) {
      if (contexto.atributos.hasOwnProperty(associacao.como)) {
        var atrib = contexto.atributos[associacao.como];

        if (_.isObject(atrib) && atrib.hasOwnProperty(associacao.chavePrimaria)) {
          contexto.atributos[associacao.identificador] = atrib[associacao.chavePrimaria];
          delete contexto.atributos[associacao.como];
        }
      }
    });
  }

  return this.modelo
    .create(contexto.atributos)
    .then(function(instancia) {
      if (meuObjt.fonte) {
        var estagioFinal = meuObjt.fonte.estagiosFinais.singular;
        var localizacao = estagioFinal.replace(/:(\w+)/g, function(match, $1) {
          return instancia[$1];
        });

        res.header('Location', localizacao);
      }

      if (meuObjt.fonte.seRecarregarInstancias === true) {
        var opcoesDeRecarga = {};
        if (Array.isArray(meuObjt.incluir) && meuObjt.incluir.length) {
          //opcoesDeRecarga.incluir = meuObjt.incluir;
        }
        if (!!meuObjt.fonte.excluirAtributos) {
          //opcoesDeRecarga.atributos = { exclude: meuObjt.fonte.excluirAtributos };
        }
        //return instancia.reload(opcoesDeRecarga);
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
