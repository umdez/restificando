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
 * @Objeto {args} As configurações do nosso controlador.
 *  - args.estagioFinal (Obrigatório) O estágio final com seus atributos. 
 *  - args.aplicativo (Obrigatório) O aplicativo Express.
 *  - args.modelo (Obrigatório) O modelo da fonte.
 *  - args.incluir (Opcional) Mais modelos inclusos.
 *  - args.fonte (Obrigatório) A fonte.
 ----------------------------------------------------------------------------------------*/
var Controlador = function(args) {
  this.inicializar(args);
};

Controlador.prototype.inicializar = function(opcoes) {
  opcoes = opcoes || {};
  this.estagioFinal = new EstagioFinal(opcoes.estagioFinal);
  this.modelo = opcoes.modelo;
  this.aplicativo = opcoes.aplicativo;
  this.fonte = opcoes.fonte;
  this.incluir = opcoes.incluir;

  if (opcoes.incluir.length) {
    var incluirEstesAtributos = [];
    var incluirEstesModelos = [];
    opcoes.incluir.forEach(function(incluir) {
      incluirEstesModelos.push(!!incluir.modelo ? incluir.modelo : incluir);
    });

    _.forEach(this.modelo.associations, function(associacao) {
      if (_.contains(incluirEstesModelos, associacao.target))
        incluirEstesAtributos.push(associacao.identifier);
    });
    this.incluirEstesAtributos = incluirEstesAtributos;
  }

  this.rota();
};

/* @Propriedade {Matriz} [percursos] Contêm os nossos percursos básicos.
 *
 * fonte.controlador.iniciar    (Chamado no inicio da requisição)                            (Start) 
 * fonte.controlador.autenticar (Utilizado para autenticação e ou autorização da requisição) (Auth)
 * fonte.controlador.trazer     (Traz dados da Database)                                     (Fetch)
 * fonte.controlador.dados      (Fazer alguma transformação nos dados da Database)           (Data)
 * fonte.controlador.escrever   (Escrever para a Database)                                   (Write)
 * fonte.controlador.enviar     (Envia uma resposta para o usuário)                          (Send)
 * fonte.controlador.completar  (Chamado quando a requisição já estiver completa)            (Complete)
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

/* Retorna ganchos para cada percurso. Por exemplo, para o percurso 'iniciar', teremos:
 * 'iniciar_antesQue', 'iniciar' e também 'iniciar_depoisDe'. 
 */
Controlador.ganchos = Controlador.percursos.reduce(function(ganchos, percurso) {
  ['_antesQue', '', '_depoisDe'].forEach(function(modificador) {
    ganchos.push(percurso + modificador);
  });

  return ganchos;
}, []);

Controlador.prototype.erro = function(req, res, erro) {
  res.status(erro.estatos);
  res.json({
    mensagem: erro.mensagem,
    erros: erro.erros
  });
};

Controlador.prototype.enviar = function(req, res, contexto) {
  res.json(contexto.instancia);
  return contexto.continue;
};

Controlador.prototype.rota = function() {
  var aplicativo = this.aplicativo;
  var estagioFinal = this.estagioFinal;
  var meuObjt = this;
  
  aplicativo[meuObjt.metodo](estagioFinal.texto, function(req, res) {
    meuObjt._controle(req, res);
  });
};

Controlador.prototype._controle = function(req, res) {
  var cadeiaDeGanchos = Promessa.resolve(false);
  var meuObjt = this;
  var contexto = {
    instancia: undefined,
    criterio: {},
    atributos: {},
    opcoes: {}
  };

  Controlador.percursos.forEach(function(percurso) {
    // Se já houver este percurso então retornamos aqui.
    if (!meuObjt[percurso]) {
      return;
    }
    
    [percurso + '_antesQue', percurso, percurso + '_depoisDe'].forEach(function(gancho) {
      // Se já houver este gancho então retornamos aqui.
      if (!meuObjt[gancho]) {
        return;
      }
      
      cadeiaDeGanchos = cadeiaDeGanchos.then(function executarUmGancho(skip) {
        if (skip) return true;

        var functions = Array.isArray(meuObjt[gancho]) ? meuObjt[gancho] : [meuObjt[gancho]];

        // return the function chain. This means if the function chain resolved
        // to skip then all the remaining hooks on this percurso will also be
        // skipped and we will go to the next percurso
        return functions.reduce(function(prev, current) {
          return prev.then(function runHookFunction(skipNext) {

            // if any asked to skip keep returning true to avoid calling further
            // functions inside this gancho
            if (skipNext) return true;

            var decisionPromise = new Promessa(function(resolve) {
              _.assign(contexto, {
                skip: function() {
                  resolve(contexto.skip);
                },
                stop: function() {
                  resolve(new erros.RequestCompleted());
                },
                continue: function() {
                  resolve(contexto.continue);
                },
                error: function(status, message, listaDeErros, cause) {
                  // if the second parameter is undefined then we are being
                  // passed an error to rethrow, otherwise build an EpilogueError
                  if (_.isUndefined(message) || status instanceof erros.EpilogueError) {
                    resolve(status);
                  } else {
                    resolve(new erros.EpilogueError(status, message, listaDeErros, cause));
                  }
                }
              });
            });

            return Promessa.resolve(current.call(meuObjt, req, res, contexto))
              .then(function(result) {
                // if they were returned directly or as a result of a promise
                if (_.includes([contexto.skip, contexto.continue, contexto.stop], result)) {
                  // call it to resolve the decision
                  result();
                }

                return decisionPromise.then(function(decision) {
                  if (decision === contexto.continue) return false;
                  if (decision === contexto.skip) return true;

                  // must be an error/contexto.stop, throw the decision for error handling
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

    cadeiaDeGanchos = cadeiaDeGanchos.then(function() {
      // clear any passed results so the next percurso will run even if a
      // _after said to skip
      return false;
    });
  });

  cadeiaDeGanchos
    .catch(erros.RequisicaoCompleta, _.noop)
    .catch(meuObjt.modelo.sequelize.ValidationError, function(erro) {
      var listaDeErros = _.reduce(erro.errors, function(resultado, erro) {
        resultado.push({ field: erro.path, message: erro.message });
        return resultado;
      }, []);

      meuObjt.erro(req, res, new erros.ErroDeRequisicaoRuim(erro.message, listaDeErros, erro));
    })
    .catch(erros.RestificandoErro, function(erro) {
      meuObjt.erro(req, res, erro);
    })
    .catch(function(erro) {
      // Aqui os erros internos do nosso serviço.
      meuObjt.erro(req, res, new erros.RestificandoErro(500, 'erro interno', [erro.mensagem], erro));
    });
};

Controlador.prototype.percurso = function(name, callback) {
  if (!_.includes(Controlador.ganchos, name))
    throw new Error('invalid percurso: ' + name);

  if (!this[name]) {
    this[name] = [];
  } else if (!Array.isArray(this[name])) {
    this[name] = [ this[name] ];
  }

  this[name].push(callback);
};

module.exports = Controlador;
