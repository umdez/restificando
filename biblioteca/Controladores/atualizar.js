'use strict';

var _ = require('lodash'),
    utilitario = require('util'),
    Base = require('./base'),
    ControladorDeLeitura = require('./ler');

var Atualizar = function(args) {
  if (args.fonte.metodoDeAtualizacao) {
    this.metodo = args.fonte.metodoDeAtualizacao;
  }
  Atualizar.super_.call(this, args);
};

utilitario.inherits(Atualizar, Base);

Atualizar.prototype.acao = 'atualizar';
Atualizar.prototype.metodo = 'put';
Atualizar.prototype.pluralidade = 'singular';

Atualizar.prototype.trazer = ControladorDeLeitura.prototype.trazer;

Atualizar.prototype.escrever = function(req, res, contexto) {
  var instancia = contexto.instancia;
  contexto.atributos = _.extend(contexto.atributos, req.body);

  this.estagioFinal.atributos.forEach(function(atrib) {
    if (req.params.hasOwnProperty(atrib))
      contexto.atributos[atrib] = req.params[atrib];
  });

  var meuObjt = this;

  // Verifica dados associados
  if (this.incluir && this.incluir.length) {
    _.values(meuObjt.fonte.informacoesDasAssociacoes).forEach(function(associacao) {
      if (contexto.atributos.hasOwnProperty(associacao.as)) {
        var atrib = contexto.atributos[associacao.as];

        if (_.isObject(atrib) && atrib.hasOwnProperty(associacao.primaryKey)) {
          contexto.atributos[associacao.identifier] = atrib[associacao.primaryKey];
        } else if(contexto.atributos.hasOwnProperty(associacao.as) && atrib === null) {
          contexto.atributos[associacao.identifier] = null;
        }
      }
    });
  }

  instancia.setAttributes(contexto.atributos);

  // Verifica se é necessário recarregar
  var seForRecarregarDepois = meuObjt.fonte.seRecarregarInstancias &&
    Object.keys(meuObjt.fonte.informacoesDasAssociacoes).some(function(atrib) {
      return instancia._changed.hasOwnProperty(atrib);
    });

  return instancia
    .save()
    .then(function(instancia) {
      if (seForRecarregarDepois) {
        return instancia.reload({ include: meuObjt.incluir });
      } else {
        return instancia;
      }
    })
    .then(function(instancia) {
      if (meuObjt.fonte.opcoesDeAssociacao.removerChaveEstrangeira) {
        _.values(meuObjt.fonte.informacoesDasAssociacoes).forEach(function(info) {
          delete instancia.dataValues[info.identifier];
        });
      }

      contexto.instancia = instancia;
      return contexto.continuar;
    });
};

module.exports = Atualizar;
