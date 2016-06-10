'use strict';

/*******************************************************************
 * Restificando � de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id pertenceAMuitas.js, criado em 31/05/2016 �s 18:41:23 por Leo Felippe $
 *
 * Vers�o atual 0.0.1-Beta
 */

var _ = require('lodash');

module.exports = function(Fonte, fonte, associacao) {
  // acesso aos est�gios
  var subNomeDaFonte = associacao.alvo.opcoes.nome.plural.toLowerCase();

  // Procurar associa��o inversa
  var associacaoEmparelhada;
  if (associacao.emparelhada) {
    associacaoEmparelhada = _.find(associacao.alvo.associacoes, associacao.emparelhada);
  } else {
    associacaoEmparelhada = _.findWhere(associacao.alvo.associacoes, {
      emparelhada: associacao
    });
  }

  if (!associacaoEmparelhada) {
    // N�o criar a fonte
    return;
  }

  var fonteAssociada = new Fonte({
    aplicativo: fonte.aplicativo,
    sequelize: fonte.sequelize,
    modelo: associacao.alvo,
    estagiosFinais: [
      fonte.estagiosFinais.singular + '/' + subNomeDaFonte,
      fonte.estagiosFinais.plural + '/:' + associacaoEmparelhada.campoDeIdentificacaoExtrangeira + '/' + subNomeDaFonte + '/:id'
    ],
    acoes: ['ler', 'listar']
  });

  fonteAssociada.opcoesDeAssociacao = fonte.opcoesDeAssociacao;
  fonteAssociada.ler.trazer.antesQue(function(requisicao, resposta, contexto) {
    var emQueLocal = {};
    emQueLocal[associacao.fonte.campoDeChavePrimaria] = requisicao.params[associacaoEmparelhada.campoDeIdentificacaoExtrangeira];
    delete requisicao.params[associacaoEmparelhada.campoDeIdentificacaoExtrangeira];

    contexto.incluir = contexto.incluir || [];
    contexto.incluir.push({
      associacao: associacaoEmparelhada,
      emQueLocal: emQueLocal
    });
    contexto.continue();
  });

  fonteAssociada.ler.enviar.antesQue(function(requisicao, resposta, contexto) {
    delete contexto.instancia.dataValues[associacaoEmparelhada.as];
    contexto.continue();
  });

  fonteAssociada.list.trazer.antesQue(function(requisicao, resposta, contexto) {
    // Filtra
    var emQueLocal = {};
    emQueLocal[associacao.fonte.campoDeChavePrimaria] = requisicao.params.id;

    contexto.incluir = contexto.incluir || [];
    contexto.incluir.push({
      associacao: associacaoEmparelhada,
      emQueLocal: emQueLocal
    });

    contexto.continue();
  });

  fonteAssociada.listar.enviar.antesQue(function(requisicao, resposta, contexto) {
    contexto.instancia.forEach(function(instance) {
      if (instance.dataValues[associacaoEmparelhada.as]) {
        instance.dataValues[associacaoEmparelhada.as].forEach(function(a) {
          delete a.dataValues[associacaoEmparelhada.combinedName];
        });
      }
    });

    contexto.continue();
  });

  return fonteAssociada;
};
