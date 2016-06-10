'use strict';

/*******************************************************************
 * Restificando é de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id pertenceAMuitas.js, criado em 31/05/2016 às 18:41:23 por Leo Felippe $
 *
 * Versão atual 0.0.1-Beta
 */

var _ = require('lodash');

/* Exporta uma função para o tipo de associação Belongs-To-Many. Esse tipo de associação 
 * conecta um modelo fonte especifico com multiplos modelos alvos. Posteriormente os alvos
 * podem também ter conexões com multiplos modelos fonte.
 * 
 * Exportamos aqui mais um tipo de associação para algum modelo. Aqui temos a associação de 
 * pertenceAMuitas ou belongsToMany. Existem vários tipos de associações em um banco de dados.
 * Cada associação denota um tipo de relação entre modelos dum banco de dados qualquer. 
 ----------------------------------------------------------------------------------------*/
module.exports = function(Fonte, fonte, associacao) {
  // acesso aos estágios
  var subNomeDaFonte = associacao.alvo.opcoes.nome.plural.toLowerCase();

  // Procurar associação inversa
  var associacaoEmparelhada;
  if (associacao.emparelhada) {
    associacaoEmparelhada = _.find(associacao.alvo.associacoes, associacao.emparelhada);
  } else {
    associacaoEmparelhada = _.findWhere(associacao.alvo.associacoes, {
      emparelhada: associacao
    });
  }

  if (!associacaoEmparelhada) {
    // Não criar a fonte
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
