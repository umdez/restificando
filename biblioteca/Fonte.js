'use strict';

/*******************************************************************
 * Restificando é de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id Fonte.js, criado em 31/05/2016 às 18:34 por Leo Felippe $
 *
 * Versão atual 0.0.2-Beta
 */
 
/* Histórico do desenvolvimento:
 *
 * @AFAZER: Mudar o nome da variável de aplicativo para express. (questão #1) [10/06/2016] v0.0.1-Beta
 */

var Controladores = require('./Controladores/indice');
var possuiUmaFonte = require('./Associacoes/possuiUma');
//var possuiMuitasFontes = require('./Associacoes/possuiMuitas');
//var pertenceAUmaFonte = require('./Associacoes/pertenceAUma');
//var pertenceAMuitasFontes = require('./Associacoes/pertenceAMuitas');
var _ = require('lodash');

/* @Objeto Fonte().
 *
 * Aqui nós temos o objeto para uma fonte qualquer. Cada fonte possui controladores que estão listados abaixo:
 * 
 * fonte.criar     POST /fonte                          (Requisita a criação de um registro para esta fonte)                (Create)
 * fonte.listar    GET /fonte                           (Requisita uma lista de registros desta fonte)                      (List)
 * fonte.ler       GET /fonte/:identificador            (Requisita um unico registro desta fonte passando um identificador) (Read)
 * fonte.atualizar PUT|POST|PATCH /fonte/:identificador (Requisita a atualização de um registro desta fonte)                (Update)
 * fonte.deletar   DELETE /fonte/:identificador         (Requisita a remoção de um registro desta fonte)                    (Delete)
 *
 * É necessário informar que para cada um destes controladores listados acima também possuirá os percursos, cada 
 * percurso será executado na ordem listada abaixo:
 * 
 * fonte.controlador.iniciar    (Chamado no inicio)                                                    (Start) 
 * fonte.controlador.autenticar (Utilizado para autenticação)                                          (Auth)
 * fonte.controlador.trazer     (Caso necessário alguma rotina ao requisitar que dados sejam trazidos) (Fetch)
 * fonte.controlador.dados      (Caso seja necessário alguma rotina com os dados da fonte)             (Data)
 * fonte.controlador.escrever   (Caso seja necessário alguma rotina de escrita)                        (Write)
 * fonte.controlador.enviar     (Caso seja necessário alguma rotina de envio)                          (Send)
 * fonte.controlador.completar  (Chamado quando a requisição já estiver completa)                      (Complete)
 *
 * @Parametro {Objeto} [opcoes] As configurações da nossa fonte.
 *  - opcoes.acoes (Opcional) As ações aceitas por esta fonte. 
 *  - opcoes.seRealizarPaginacao (Opcional) Caso seja necessário habilitar a paginação para determinada fonte.
 *  - opcoes.seRecarregarInstancias (Opcional) <umdez> O que é isso?
 *  - opcoes.incluir (Opcional) Vamos incluir mais alguns modelos?
 *  - opcoes.excluirAtributos (Opcional) Os atributos não necessários e que devem ser excluidos.
 *  - opcoes.busca.parametro (Opcional) O parametro utilizado para a busca.
 *  - opcoes.sorteio.parametro (Opcional) O parametro utilizado para sorteio.
 *  - opcoes.aplicativo (Obrigatório) O aplicativo Express.
 *  - opcoes.sequelize (Obrigatório) O ORM (Object-relational mapping) Sequelize.
 *  - opcoes.modelo (Obrigatório) Um modelo do Sequelize.
 *  - opcoes.estagiosFinais (Obrigatório) Os estágio de determinada fonte.
 *  - opcoes.metodoDeAtualizacao (Opcional mas recomendado) Qual será o método para atualização?
 *  - opcoes.sePossuiAssociacoes (Opcional) Caso a fonte possua associações com outras fontes.
 ----------------------------------------------------------------------------------------*/
var Fonte = function(opcoes) {
  
  // Nossas opções padrões
  _.defaults(opcoes, {
    acoes: ['criar', 'listar', 'ler', 'atualizar', 'deletar'],
    seRealizarPaginacao: true,
    seRecarregarInstancias: false, 
    incluir: [],
    excluirAtributos: []
  });

  // Nossos parametros de busca e de sorteio
  _.defaultsDeep(opcoes, {
    busca: {
      parametro: 'busc'
    },
    sorteio: {
      parametro: 'sort'
    }
  });

  // O aplicativo Express
  // @AFAZER: Talvez mudar o nome desta variavel para express? (questão #1)
  this.aplicativo = opcoes.aplicativo;
  
  // ORM Sequelize
  this.sequelize = opcoes.sequelize;
  
  // Modelo do Sequelize
  this.modelo = opcoes.modelo;
  
  // Mais modelos para inclusão
  this.incluir = opcoes.incluir.map(function(incluir) {
    return (incluir instanceof opcoes.sequelize.Model) ? { model: incluir } : incluir;
  });

  // Caso seja informado algum atributo que será excluido
  if (!!opcoes.excluirAtributos) { 
    this.excluirAtributos = opcoes.excluirAtributos;
  } 
  
  // Filtramos os atributos a serem excluidos, caso contrário nós adicionaremos todos os atributos brutos.
  this.atributos = (!opcoes.excluirAtributos.length) ? Object.keys(this.modelo.rawAttributes) : Object.keys(this.modelo.rawAttributes).filter(function(atrib) {
    return opcoes.excluirAtributos.indexOf(atrib) === -1;
  });

  // Nossas ações disponíveis
  this.acoes = opcoes.acoes;
  
  // Nossos dois tipos de estágios finais
  this.estagiosFinais = {
    plural: opcoes.estagiosFinais[0], // ex. '/exames'
    singular: opcoes.estagiosFinais[1] || opcoes.estagiosFinais[0]  // ex. '/exames/:id' ou '/exames' 
  };
  
  // Qual método de atualização? PUT, POST ou PATCH?
  this.metodoDeAtualizacao = opcoes.metodoDeAtualizacao;
  
  // Quer paginação?
  this.seRealizarPaginacao = opcoes.seRealizarPaginacao;
  
  // Parametros de busca e sorteio.
  this.busca = opcoes.busca;
  this.sorteio = opcoes.sorteio;
  
  // <umdez> O que é isso?
  this.seRecarregarInstancias = opcoes.seRecarregarInstancias;

  this.opcoesDeAssociacao = {
    removerChaveEstrangeira: false
  };

  // As relações entre os modelos. Ex. pertenceAUma, possuiUma, possuiMuitas e pertenceAMuitas.
  if (!!opcoes.sePossuiAssociacoes) {
    if (_.isObject(opcoes.sePossuiAssociacoes)) {
      this.opcoesDeAssociacao = _.extend(this.opcoesDeAssociacao, opcoes.sePossuiAssociacoes);
    }
    autoAssociar(this);
  }

  // Aqui cada ação possui um controlador com estágio final.
  this.controladores = {};
  this.acoes.forEach(function(acao) {
    var Controlador = Controladores[acao];
    var estagioFinal = this.estagiosFinais[Controlador.prototype.pluralidade];

    this.controladores[acao] = new Controlador({
      estagioFinal: estagioFinal,
      aplicativo: opcoes.aplicativo,
      modelo: this.modelo,
      incluir: this.incluir,
      fonte: this
    });

  }.bind(this));

  // Ganchos dos percursos. ex. 'iniciar_antesQue', 'iniciar' e também 'iniciar_depoisDe'.
  var ganchos = Controladores.base.ganchos;
  var meuObjt = this;
  
  this.acoes.forEach(function(acao) {
    meuObjt[acao] = meuObjt[acao] || {};
    ganchos.forEach(function(gancho) {
      meuObjt[acao][gancho] = function(f) {
        meuObjt.controladores[acao].percurso(gancho, f);
      };

      // <umdez> Ainda não sei como esta parte funciona, porque os ganchos estão sendo adicionados novamente.
      meuObjt[acao][gancho].antesQue = function(f) {
        meuObjt.controladores[acao].percurso(gancho + '_antesQue', f);
      };

      meuObjt[acao][gancho].depoisDe = function(f) {
        meuObjt.controladores[acao].percurso(gancho + '_depoisDe', f);
      };
    });
  });

  this.tudo = {};

  ganchos.forEach(function(gancho) {
    meuObjt.tudo[gancho] = function(f) {
      meuObjt.acoes.forEach(function(acao) {
        meuObjt.controladores[acao].percurso(gancho, f);
      });
    };

    meuObjt.tudo[gancho].antesQue = function(f) {
      meuObjt.acoes.forEach(function(acao) {
        meuObjt.controladores[acao].percurso(gancho + '_antesQue', f);
      });
    };

    meuObjt.tudo[gancho].depoisDe = function(f) {
      meuObjt.acoes.forEach(function(acao) {
        meuObjt.controladores[acao].percurso(gancho + '_depoisDe', f);
      });
    };

  });

  // Uma copia de provisão dos dados associados para uso posterior 
  meuObjt.informacoesDasAssociacoes = {};
  if (meuObjt.incluir && meuObjt.incluir.length) {
    meuObjt.incluir.forEach(function(i) {
      var chavePrimaria = i.model.primaryKeyField;
      var associacoes = _.values(meuObjt.modelo.associations).filter(function(a) {
        return a.target === i.model;
      });

      associacoes.forEach(function(associacao) {
        meuObjt.informacoesDasAssociacoes[associacao.identifier] = {
          identifier: associacao.identifier,
          primaryKey: chavePrimaria,
          as: associacao.as
        };
      });
    });
  }
};

Fonte.prototype.usar = function(mediador) {
  var meuObjt = this;
  var acoes = _.clone(meuObjt.acoes);

  acoes.push('todos');
  acoes.forEach(function(acao) {
    if (_.has(mediador, acao)) {
      _.forOwn(mediador[acao], function(definicao, percurso) {
        if (_.isFunction(definicao)) {
          meuObjt[acao][percurso](definicao);
        } else {
          if (_.has(definicao, 'acao')) meuObjt[acao][percurso](definicao.acao);
          if (_.has(definicao, 'antesQue')) meuObjt[acao][percurso].antesQue(definicao.antesQue);
          if (_.has(definicao, 'depoisDe')) meuObjt[acao][percurso].depoisDe(definicao.depoisDe);
        }
      });
    }
  });

  if (_.has(mediador, 'configuracaoExtra') && _.isFunction(mediador.configuracaoExtra)) {
    mediador.configuracaoExtra(this);
  }
};

/* @Função autoAssociar(). 
 *
 * Carrega as fontes alvo associadas com esta fonte.
 *
 * @Parametro {Objeto} [fonte] Uma fonte.
 */
function autoAssociar(fonte) {
  // Se não possuir associações então retorna.
  if (!fonte.modelo.associations) {
    return;
  }
  
  _.forEach(fonte.modelo.associations, function(associacao) {
    // Para os dados já tragos (prefetched) em listar e em ler.
    if (!!associacao.as) {
      fonte.incluir.push({ model: associacao.target, as: associacao.as });
    } else {
      fonte.incluir.push(associacao.target);
    }

    var nomeDaSubFonte;
    if (associacao.associationType === 'HasOne') {
      nomeDaSubFonte = associacao.target.options.name.singular.toLowerCase();
      fonte[nomeDaSubFonte] = possuiUmaFonte(Fonte, fonte, associacao);
    } else if (associacao.associationType === 'HasMany') {
      nomeDaSubFonte = associacao.target.options.name.plural.toLowerCase();
      // fonte[nomeDaSubFonte] = hasManyResource(Fonte, fonte, associacao);
    } else if (associacao.associationType === 'BelongsTo') {
      nomeDaSubFonte = associacao.target.options.name.singular.toLowerCase();
      // fonte[nomeDaSubFonte] = belongsToResource(Fonte, fonte, associacao);
    } else if (associacao.associationType === 'BelongsToMany') {
     nomeDaSubFonte = associacao.target.options.name.plural.toLowerCase();
      // fonte[nomeDaSubFonte] = belongsToManyResource(Fonte, fonte, associacao);
    }
  });
}

module.exports = Fonte;
