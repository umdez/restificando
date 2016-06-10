'use strict';

/*******************************************************************
 * Restificando é de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id Fonte.js, criado em 31/05/2016 às 18/34/24 por Leo Felippe $
 *
 * Versão atual 0.0.1-Beta
 */
 
/* Histórico do desenvolvimento:
 *
 * @AFAZER: Mudar o nome da variável de aplicativo para express. (questão #1) [10/06/2016] v0.0.1-Beta
 */

var Controladores = require('./Controladores');
var possuiUmaFonte = require('./Associacoes/possuiUma');
var possuiMuitasFontes = require('./Associacoes/possuiMuitas');
var pertenceAUmaFonte = require('./Associacoes/pertenceAUma');
var pertenceAMuitasFontes = require('./Associacoes/pertenceAMuitas');
var _ = require('lodash');

/* @Objeto Fonte().
 *
 ----------------------------------------------------------------------------------------*/
var Fonte = function(opcoes) {
  
  // Nossas opções padrões
  _.defaults(opcoes, {
    acoes: ['criar', 'ler', 'atualizar', 'deletar', 'listar'],
    paginacao: true,
    recarregarAsInstancias: false,
    incluir: [],
    excluirAtributos: []
  });

  // Nossos parametros de busca e sorteio
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
    return (incluir instanceof opcoes.sequelize.Model) ? { modelo: incluir } : incluir;
  });

  // Caso seja informado algum atributo que será excluido
  if (!!opcoes.excluirAtributos) { 
    this.excluirAtributos = opcoes.excluirAtributos;
  } 
  
  // Filtro dos atributos sem aqueles que serão excluidos
  this.atributos = (!opcoes.excluirAtributos.length) ?
    Object.keys(this.modelo.rawAttributes) :
    Object.keys(this.modelo.rawAttributes).filter(function(atrib) {
      return opcoes.excluirAtributos.indexOf(atrib) === -1;
    });

  // Nossas ações disponíveis
  this.acoes = opcoes.acoes;
  
  // Nossos dois tipos de estágios finais
  this.estagiosFinais = {
    plural: opcoes.estagiosFinais[0], // ex. '/exames'
    singular: opcoes.estagiosFinais[1] || opcoes.estagiosFinais[0]  // ex. '/exames/:id' ou '/exames' 
  };
  
  this.metodoDeAtualizacao = opcoes.metodoDeAtualizacao;
  this.paginacao = opcoes.paginacao;
  this.busca = opcoes.busca;
  this.sorteio = opcoes.sorteio;
  this.recarregarAsInstancias = opcoes.recarregarAsInstancias;

  this.opcoesDeAssociacao = {
    removerChaveEstrangeira: false
  };

  // As relações entre os modelos. Ex. pertenceAUma, possuiUma, possuiMuitas e pertenceAMuitas.
  if (!!opcoes.associacoes) {
    if (_.isObject(opcoes.associacoes)) {
      this.opcoesDeAssociacao = _.extend(this.opcoesDeAssociacao, opcoes.associacoes);
    }
    autoAssociar(this);
  }

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

  var ganchos = Controladores.base.ganchos;
  var meuObjt = this;

  this.acoes.forEach(function(acao) {
    meuObjt[acao] = meuObjt[acao] || {};
    ganchos.forEach(function(gancho) {
      meuObjt[acao][gancho] = function(f) {
        meuObjt.controladores[acao].percursos(gancho, f);
      };

      meuObjt[acao][gancho].antesQue = function(f) {
        meuObjt.controladores[acao].percursos(gancho + '_antesQue', f);
      };

      meuObjt[acao][gancho].depoisDe = function(f) {
        meuObjt.controladores[acao].percursos(gancho + '_depoisDe', f);
      };
    });
  });

  this.tudo = {};

  ganchos.forEach(function(gancho) {
    meuObjt.tudo[gancho] = function(f) {
      meuObjt.acoes.forEach(function(acao) {
        meuObjt.controladores[acao].percursos(gancho, f);
      });
    };

    meuObjt.tudo[gancho].antesQue = function(f) {
      meuObjt.acoes.forEach(function(acao) {
        meuObjt.controladores[acao].percursos(gancho + '_antesQue', f);
      });
    };

    meuObjt.tudo[gancho].depoisDe = function(f) {
      meuObjt.acoes.forEach(function(acao) {
        meuObjt.controladores[acao].percursos(gancho + '_depoisDe', f);
      });
    };

  });

  // Uma copia de provisão dos dados associados para uso posterior 
  meuObjt.associationsInfo = {};
  if (meuObjt.incluir && meuObjt.incluir.length) {
    meuObjt.incluir.forEach(function(i) {
      var primaryKey = i.modelo.primaryKeyField,
          associations = _.values(meuObjt.modelo.associations).filter(function(a) {
            return a.target === i.modelo;
          });

      associations.forEach(function(association) {
        meuObjt.associationsInfo[association.identifier] = {
          identifier: association.identifier,
          primaryKey: primaryKey,
          as: association.as
        };
      });
    });
  }
};
