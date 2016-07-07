'use strict';

/*******************************************************************
 * Restificando é de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id base.js, criado em 07/07/2016 às 12:37 por Leo Felippe $
 *
 * Versão atual 0.0.1-Beta
 */

var _ = require('lodash');
var EstagioFinal = require('../EstagioFinal');
var Promessa = require('bluebird');
var erros = require('../Erros');


/* @Objeto Controlador().
 *
 * Nossos controladores estão listados abaixo:
 *
 * fonte.criar     POST /fonte                  (Requisita a criação de um registro para esta fonte)                (Create)
 * fonte.listar    GET /fonte                   (Requisita uma lista de registros desta fonte)                      (List)
 * fonte.ler       GET /fonte/:identificador    (Requisita um unico registro desta fonte passando um identificador) (Read)
 * fonte.atualizar PUT /fonte/:identificador    (Requisita a atualização de um registro desta fonte)                (Update)
 * fonte.deletar   DELETE /fonte/:identificador (Requisita a remoção de um registro desta fonte)                    (Delete)
 *
 ----------------------------------------------------------------------------------------*/
var Controlador = function(args) {
  this.inicializar(args);
};

Controlador.prototype.inicializar = function(opcoes) {
  opcoes = opcoes || {};
  this.estagioFinal = new EstagioFinal(opcoes.estagioFinal);
  this.modelo = opcoes.modelo;
  this.app = opcoes.app;
  this.resource = opcoes.resource;
  this.include = opcoes.include;

  if (opcoes.include.length) {
    var includeAttributes = [], includeModels = [];
    opcoes.include.forEach(function(include) {
      includeModels.push(!!include.modelo ? include.modelo : include);
    });

    _.forEach(this.modelo.associations, function(association) {
      if (_.contains(includeModels, association.target))
        includeAttributes.push(association.identifier);
    });
    this.includeAttributes = includeAttributes;
  }

  this.route();
};

/* @Propriedade {Matriz} [percursos] Contêm os nossos percursos básicos.
 *
 * fonte.controlador.iniciar    (Chamado no inicio)                                                    (Start) 
 * fonte.controlador.autenticar (Utilizado para autenticação)                                          (Auth)
 * fonte.controlador.trazer     (Caso necessário alguma rotina ao requisitar que dados sejam trazidos) (Fetch)
 * fonte.controlador.dados      (Caso seja necessário alguma rotina com os dados da fonte)             (Data)
 * fonte.controlador.escrever   (Caso seja necessário alguma rotina de escrita)                        (Write)
 * fonte.controlador.enviar     (Caso seja necessário alguma rotina de envio)                          (Send)
 * fonte.controlador.completar  (Chamado quando a requisição já estiver completa)                      (Complete)
 */
Controlador.percursos = [
  'iniciar',     // Start 
  'autenticar',  // Auth 
  'trazer',      // Fetch 
  'dados',       // Data 
  'escrever',    // Write 
  'enviar',      // Send 
  'completar'    // Complete 
];

Controlador.hooks = Controlador.percursos.reduce(function(hooks, milestone) {
  ['_before', '', '_after'].forEach(function(modifier) {
    hooks.push(milestone + modifier);
  });

  return hooks;
}, []);

Controlador.prototype.error = function(req, res, err) {
  res.status(err.status);
  res.json({
    message: err.message,
    errors: err.errors
  });
};

Controlador.prototype.send = function(req, res, context) {
  res.json(context.instance);
  return context.continue;
};

Controlador.prototype.route = function() {
  var app = this.app,
      estagioFinal = this.estagioFinal,
      self = this;

  // NOTE: is there a better place to do this mapping?
  if (app.name === 'restify' && self.method === 'delete')
    self.method = 'del';

  app[self.method](estagioFinal.string, function(req, res) {
    self._control(req, res);
  });
};

Controlador.prototype._control = function(req, res) {
  var hookChain = Promessa.resolve(false),
      self = this,
      context = {
        instance: undefined,
        criteria: {},
        attributes: {},
        opcoes: {}
      };

  Controlador.percursos.forEach(function(milestone) {
    if (!self[milestone])
      return;

    [milestone + '_before', milestone, milestone + '_after'].forEach(function(hook) {
      if (!self[hook])
        return;

      hookChain = hookChain.then(function runHook(skip) {
        if (skip) return true;

        var functions = Array.isArray(self[hook]) ? self[hook] : [self[hook]];

        // return the function chain. This means if the function chain resolved
        // to skip then all the remaining hooks on this milestone will also be
        // skipped and we will go to the next milestone
        return functions.reduce(function(prev, current) {
          return prev.then(function runHookFunction(skipNext) {

            // if any asked to skip keep returning true to avoid calling further
            // functions inside this hook
            if (skipNext) return true;

            var decisionPromise = new Promessa(function(resolve) {
              _.assign(context, {
                skip: function() {
                  resolve(context.skip);
                },
                stop: function() {
                  resolve(new errors.RequestCompleted());
                },
                continue: function() {
                  resolve(context.continue);
                },
                error: function(status, message, errorList, cause) {
                  // if the second parameter is undefined then we are being
                  // passed an error to rethrow, otherwise build an EpilogueError
                  if (_.isUndefined(message) || status instanceof errors.EpilogueError) {
                    resolve(status);
                  } else {
                    resolve(new errors.EpilogueError(status, message, errorList, cause));
                  }
                }
              });
            });

            return Promessa.resolve(current.call(self, req, res, context))
              .then(function(result) {
                // if they were returned directly or as a result of a promise
                if (_.includes([context.skip, context.continue, context.stop], result)) {
                  // call it to resolve the decision
                  result();
                }

                return decisionPromise.then(function(decision) {
                  if (decision === context.continue) return false;
                  if (decision === context.skip) return true;

                  // must be an error/context.stop, throw the decision for error handling
                  if (process.domain) {
                    // restify wraps the server in domain and sets error handlers that get in the way of mocha
                    // https://github.com/dchester/epilogue/issues/83
                    return Promessa.reject(decision);
                  }
                  throw decision;
                });
              });
          });
        }, Promessa.resolve(false));
      });
    });

    hookChain = hookChain.then(function() {
      // clear any passed results so the next milestone will run even if a
      // _after said to skip
      return false;
    });
  });

  hookChain
    .catch(errors.RequestCompleted, _.noop)
    .catch(self.modelo.sequelize.ValidationError, function(err) {
      var errorList = _.reduce(err.errors, function(result, error) {
        result.push({ field: error.path, message: error.message });
        return result;
      }, []);

      self.error(req, res, new errors.BadRequestError(err.message, errorList, err));
    })
    .catch(errors.EpilogueError, function(err) {
      self.error(req, res, err);
    })
    .catch(function(err) {
      self.error(req, res, new errors.EpilogueError(500, 'internal error', [err.message], err));
    });
};

Controlador.prototype.milestone = function(name, callback) {
  if (!_.includes(Controlador.hooks, name))
    throw new Error('invalid milestone: ' + name);

  if (!this[name]) {
    this[name] = [];
  } else if (!Array.isArray(this[name])) {
    this[name] = [ this[name] ];
  }

  this[name].push(callback);
};

module.exports = Controlador;
