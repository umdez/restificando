'use strict';

/*******************************************************************
 * Restificando é de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id possuiMuitas.js, criado em 31/05/2016 às 18/40/55 por Leo Felippe $
 *
 * Versão atual 0.0.1-Beta
 */

module.exports = function(Fonte, fonte, associacao) {
  // acesso aos estágios
  var subNomeDaFonte = associacao.alvo.opcoes.nome.plural.toLowerCase();
  
  var fonteAssociada = new Fonte({
    aplicativo: fonte.aplicativo,
    sequelize: fonte.sequelize,
    modelo: associacao.alvo,
    estagiosFinais: [
      fonte.estagiosFinais.plural + '/:' + associacao.identificadorDeCampo + '/' + subNomeDaFonte,
      fonte.estagiosFinais.plural + '/:' + associacao.identificadorDeCampo + '/' + subNomeDaFonte + '/:id'
    ],
    acoes: ['ler', 'listar']
  });

  fonteAssociada.opcoesDeAssociacao = fonte.opcoesDeAssociacao;
  fonteAssociada.controladores.ler.incluirAtributos = [ associacao.identificadorDeCampo ];
  fonteAssociada.controladores.listar.incluirAtributos = [ associacao.identificadorDeCampo ];

  fonteAssociada.listar.trazer.antesQue(function(requisicao, resposta, contexto) {
    // Filtro
    contexto.criterio = contexto.criterio || {};
    contexto.criterio[associacao.identificadorDeCampo] = requisicao.params[associacao.identificadorDeCampo];
    contexto.continue();
  });

  return fonteAssociada;
};
