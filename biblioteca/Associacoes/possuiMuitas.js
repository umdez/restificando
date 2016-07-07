'use strict';

/*******************************************************************
 * Restificando é de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id possuiMuitas.js, criado em 31/05/2016 às 18:40 por Leo Felippe $
 *
 * Versão atual 0.0.1-Beta
 */

/* Exporta uma função para realizar o tipo de associação One-To-Many. Esse tipo de associação conecta
 * um modelo fonte especifico com multiplos modelos alvos.
 * 
 * Exportamos aqui mais um tipo de associação para algum modelo. Aqui temos a associação de 
 * possuiMuitas ou HasMany. Existem vários tipos de associações em um banco de dados.
 * Cada associação denota um tipo de relação entre modelos dum banco de dados qualquer. 
 * E aqui, nós temos uma associação de Um-para-Muitos (One-To-Many). Essa associação de 
 * Um-para-Muitos faz a conexão de uma fonte com multiplos alvos e, além disso, estes alvos
 * estão também conectados a uma fonte específica. Lembre-se que nesse tipo de relação, a
 * chave extrangeira da fonte ficará no(s) modelo(s) alvos.
 *
 * @Parametro {Objeto} [Fonte] Contêm objeto com atributos e métodos para uma fonte.
 * @Parametro {Objeto} [fonte] 
 * @Parametro {Objeto} [associacao] 
 ----------------------------------------------------------------------------------------*/
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
