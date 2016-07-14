'use strict';

/*******************************************************************
 * Restificando é de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id base.js, criado em 07/07/2016 às 12:37 por Leo Felippe $
 *
 * Versão atual 0.0.2-Beta
 */

var _ = require('lodash');
var EstagioFinal = require('../EstagioFinal');
var Promessa = require('bluebird');
var erros = require('../Erros');


/* @Objeto Controlador().
 *
 * Nossos controladores estão listados abaixo:
 *
 * fonte.criar     POST /fonte                          (Requisita a criação de um registro para esta fonte)                (Create)
 * fonte.listar    GET /fonte                           (Requisita uma lista de registros desta fonte)                      (List)
 * fonte.ler       GET /fonte/:identificador            (Requisita um unico registro desta fonte passando um identificador) (Read)
 * fonte.atualizar PUT|POST|PATCH /fonte/:identificador (Requisita a atualização de um registro desta fonte)                (Update)
 * fonte.deletar   DELETE /fonte/:identificador         (Requisita a remoção de um registro desta fonte)                    (Delete)
 * 
 * @Parametro {Objeto} [args] As configurações do nosso controlador.
 *  - args.estagioFinal (Obrigatório) O estágio final com seus atributos. 
 *  - args.aplicativo (Obrigatório) O aplicativo Express.
 *  - args.modelo (Obrigatório) O modelo da fonte.
 *  - args.incluir (Opcional) Mais modelos inclusos. Para realizar um JOIN.
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

  this.roteador();
};

/* @Propriedade {Matriz} [percursos] Contêm os nossos percursos básicos para cada controlador.
 */
Controlador.percursos = [
  'iniciar',    // fonte.controlador.iniciar    (Start)    (Chamado no inicio da requisição).                            
  'autenticar', // fonte.controlador.autenticar (Auth)     (Utilizado para autenticação e ou autorização da requisição). 
  'trazer',     // fonte.controlador.trazer     (Fetch)    (Traz dados da Database).                                     
  'dados',      // fonte.controlador.dados      (Data)     (Fazer alguma transformação nos dados da Database).            
  'escrever',   // fonte.controlador.escrever   (Write)    (Escrever para a Database).                                    
  'enviar',     // fonte.controlador.enviar     (Send)     (Envia uma resposta para o usuário).                           
  'completar'   // fonte.controlador.completar  (Complete) (Chamado quando a requisição já estiver completa).             
];

/* @Propriedade {Matriz} [ganchos] Retorna ganchos para cada percurso. Por exemplo, para o percurso 'iniciar', teremos:
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
  return contexto.continuar;
};

Controlador.prototype.roteador = function() {
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
    // Se não houver este percurso então retornamos aqui.
    if (!meuObjt[percurso]) {
      return;
    }
    
    [percurso + '_antesQue', percurso, percurso + '_depoisDe'].forEach(function(gancho) {
      // Se não houver este gancho então retornamos aqui.
      if (!meuObjt[gancho]) {
        return;
      }
      
      cadeiaDeGanchos = cadeiaDeGanchos.then(function executarUmGancho(pular) {
        if (pular) return true;

        var funcoes = Array.isArray(meuObjt[gancho]) ? meuObjt[gancho] : [meuObjt[gancho]];

        /* Retorna uma cadeia de funções. Isso significa que se a cadeia de funções deliberar
         * no sentido de pular, então todos os ganchos neste percurso irão também ser pulados
         * e então nós iremos ir para o próximo percurso. */
        return funcoes.reduce(function(anterior, atual) {
          return anterior.then(function funcaoParaExecutarUmGancho(puleParaProxima) {

            // Se qualquer uma pedir para pular então mantenha retornando true 
            // para precaver de chamar mais funções dentro deste gancho.
            if (puleParaProxima) return true;

            var decisaoDaPromessa = new Promessa(function(deliberar) {
              _.assign(contexto, {
                pular: function() {
                  deliberar(contexto.pular);
                },
                parar: function() {
                  deliberar(new erros.RequisicaoCompleta());
                },
                continuar: function() {
                  deliberar(contexto.continuar);
                },
                erro: function(estatos, mensagem, listaDeErros, causa) {
                  // Se o segundo parametro é indefinido então nós vamos passar um erro
                  // para ser lançado denovo (rethrow), caso contrário nós criamos um RestificandoErro
                  if (_.isUndefined(mensagem) || estatos instanceof erros.RestificandoErro) {
                    deliberar(estatos);
                  } else {
                    deliberar(new erros.RestificandoErro(estatos, mensagem, listaDeErros, causa));
                  }
                }
              });
            });

            return Promessa.resolve(atual.call(meuObjt, req, res, contexto))
              .then(function(resultado) {
                // Se caso eles forem retornados diretamente ou como um resultado de uma promessa.
                if (_.includes([contexto.pular, contexto.continuar, contexto.parar], resultado)) {
                  // Chama isso para deliberar a decisão.
                  resultado();
                }

                return decisaoDaPromessa.then(function(decisao) {
                  if (decisao === contexto.continuar) return false;
                  if (decisao === contexto.pular) return true;

                  // Deve ser um erro/contexto.parar, lançamos a decisão para suporte a erro (error handling)
                  if (process.domain) {
                    // restify wraps the server in domain and sets error handlers that get in the way of mocha
                    // https://github.com/dchester/epilogue/issues/83
                    return Promessa.reject(decisao);
                  }
                  throw decisao;
                });
              });
          });
        }, Promessa.resolve(false));
      });
    });

    cadeiaDeGanchos = cadeiaDeGanchos.then(function() {
      // Limpa qualquer resultado passado para que o próximo percurso vá 
      // executar mesmo se um _depoisDe falou para pular.
      return false;
    });
  });

  cadeiaDeGanchos
    .catch(erros.RequisicaoCompleta, _.noop)
    .catch(meuObjt.modelo.sequelize.ValidationError, function(erro) {
      var listaDeErros = _.reduce(erro.erros, function(resultado, erro) {
        // <umdez> Será que isto aqui está certo?
        resultado.push({ field: erro.path, mensagem: erro.mensagem });
        return resultado;
      }, []);

      meuObjt.erro(req, res, new erros.ErroDeRequisicaoRuim(erro.mensagem, listaDeErros, erro));
    })
    .catch(erros.RestificandoErro, function(erro) {
      meuObjt.erro(req, res, erro);
    })
    .catch(function(erro) {
      // Aqui os erros internos do nosso serviço.
      meuObjt.erro(req, res, new erros.RestificandoErro(500, 'erro interno', [erro.mensagem], erro));
    });
};

Controlador.prototype.percurso = function(nome, cd) {
  if (!_.includes(Controlador.ganchos, nome))
    throw new Error('Percurso invalido: ' + nome);

  if (!this[nome]) {
    this[nome] = [];
  } else if (!Array.isArray(this[nome])) {
    this[nome] = [ this[nome] ];
  }

  this[nome].push(cd);
};

module.exports = Controlador;
