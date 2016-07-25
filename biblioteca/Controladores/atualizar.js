'use strict';

/*******************************************************************
 * Restificando é de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id atualizar.js, criado em 23/07/2016 às 10:59 por Leo Felippe $
 *
 * Versão atual 0.0.2-Beta
 */

var _ = require('lodash');
var utilitario = require('util');
var Base = require('./base');
var ControladorDeLeitura = require('./ler');

/* @Objeto Atualizar().
 *
 * Este é o controlador de atualização. Ele é chamado com o seguinte método PUT|POST|PATCH:
 * fonte.atualizar PUT|POST|PATCH /fonte/:identificador (Requisita a atualização de um registro desta fonte)                (Update)
 * 
 * @Veja https://github.com/umdez/restificando/blob/master/docs/osControladores.md
 ----------------------------------------------------------------------------------------*/
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

/* @Método escrever().
 * 
 * @Parametro {Objeto} [req] A requisição feita ao servidor Express.
 * @Parametro {Objeto} [res] A resposta a requisição ao servidor Express.
 * @Parametro {Objeto} [contexto] Contêm informações deste contexto.
 */
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
  var seForRecarregarDepois = meuObjt.fonte.seForRecarregarInstancias &&
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
