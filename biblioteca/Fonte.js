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
  meuObjt.InformacoesDasAssociacoes = {};
  if (meuObjt.incluir && meuObjt.incluir.length) {
    meuObjt.incluir.forEach(function(i) {
      var chavePrimaria = i.modelo.primaryKeyField;
      var associacoes = _.values(meuObjt.modelo.associations).filter(function(a) {
        return a.target === i.modelo;
      });

      associacoes.forEach(function(associacao) {
        meuObjt.InformacoesDasAssociacoes[associacao.identifier] = {
          identificador: associacao.identifier,
          chavePrimaria: chavePrimaria,
          como: associacao.as
        };
      });
    });
  }
};

Fonte.prototype.usar = function(mediador) {
  var meuObjt = this,
  var acoes = _.clone(meuObjt.acoes);

  acoes.push('todos');
  acoes.forEach(function(acao) {
    if (_.has(mediador, acao)) {
      _.forOwn(mediador[acao], function(definicao, percursos) {
        if (_.isFunction(definicao)) {
          meuObjt[acao][percursos](definicao);
        } else {
          if (_.has(definicao, 'acao')) meuObjt[acao][percursos](definicao.acao);
          if (_.has(definicao, 'antesQue')) meuObjt[acao][percursos].antesQue(definicao.antesQue);
          if (_.has(definicao, 'depoisDe')) meuObjt[acao][percursos].depoisDe(definicao.depoisDe);
        }
      });
    }
  });

  if (_.has(mediador, 'configuracaoExtra') && _.isFunction(mediador.configuracaoExtra)) {
    mediador.configuracaoExtra(this);
  }
};

function autoAssociar(fonte) {
  if (!fonte.modelo.associations) {
    return;
  }
  
  _.forEach(fonte.modelo.associations, function(associacao) {
    // for prefetched data in list and read
    if (!!associacao.as) {
      fonte.incluir.push({ modelo: associacao.target, como: associacao.as });
    } else {
      fonte.incluir.push(associacao.target);
    }

    var subResourceName;
    if (associacao.associationType === 'HasOne') {
      subResourceName =
        associacao.target.options.name.singular.toLowerCase();
      fonte[subResourceName] = hasOneResource(Fonte, fonte, associacao);
    } else if (associacao.associationType === 'HasMany') {
      subResourceName =
        associacao.target.options.name.plural.toLowerCase();
      fonte[subResourceName] = hasManyResource(Fonte, fonte, associacao);
    } else if (associacao.associationType === 'BelongsTo') {
      subResourceName =
        associacao.target.options.name.singular.toLowerCase();
      fonte[subResourceName] = belongsToResource(Fonte, fonte, associacao);
    } else if (associacao.associationType === 'BelongsToMany') {
     subResourceName =
       associacao.target.options.name.plural.toLowerCase();
     fonte[subResourceName] = belongsToManyResource(Fonte, fonte, associacao);
    }
  });
}

module.exports = Fonte;
