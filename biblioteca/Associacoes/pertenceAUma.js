'use strict';

/*******************************************************************
 * Restificando é de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id pertenceAUma.js, criado em 31/05/2016 às 18:41:09 por Leo Felippe $
 *
 * Versão atual 0.0.1-Beta
 */

/* Exporta uma função para o tipo de associação one-to-one. Nesse tipo de associação, os dois modelos
 * estarão conectados por uma única chave extrangeira.
 *
 * Exportamos aqui mais um tipo de associação para algum modelo. Aqui temos a associação de 
 * pertenceAUma ou BelongsTo. Existem vários tipos de associações entre modelos em um banco de dados.
 * Cada associação denota um tipo de relação entre modelos dum banco de dados qualquer. E aqui,
 * temos uma associação de um-para-um. Lembre-se que nesse tipo de relação, a chave 
 * extrangeira existe no modelo fonte.
 ----------------------------------------------------------------------------------------*/
module.exports = function(Fonte, fonte, associacao) {
  // acesso aos estágios
  var subNomeDaFonte = associacao.alvo.opcoes.nome.singular.toLowerCase();

  var fonteAssociada = new Fonte({
    aplicativo: fonte.aplicativo,
    sequelize: fonte.sequelize,
    modelo: associacao.alvo,
    estagiosFinais: [fonte.estagiosFinais.singular + '/' + subNomeDaFonte],
    acoes: ['ler']
  });

  fonteAssociada.opcoesDeAssociacao = fonte.opcoesDeAssociacao;
  fonteAssociada.controladores.ler.incluirAtributos = [ associacao.identificadorDeCampo ];

  fonteAssociada.ler.enviar.antesQue(function(requisicao, resposta, contexto) {
    if (this.fonte.opcoesDeAssociacao.removerChaveEstrangeira) {
      delete contexto.instancia.valoresDosDados[associacao.identificadorDeCampo];
    }
    contexto.continue();
  });

  return fonteAssociada;
};
