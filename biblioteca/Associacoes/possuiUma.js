'use strict';

/*******************************************************************
 * Restificando é de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id possuiUma.js, criado em 31/05/2016 às 18:40 por Leo Felippe $
 *
 * Versão atual 0.0.2-Beta
 */

/* Exporta uma função para realizar o tipo de associação one-to-one. Nesse tipo de associação, os dois modelos
 * estarão conectados por uma única chave extrangeira.
 * 
 * Exportamos aqui mais um tipo de associação para algum modelo. Aqui temos a associação de 
 * possuiUma ou HasOne. Existem vários tipos de associações entre modelos em um banco de dados.
 * Cada associação denota um tipo de relação entre modelos dum banco de dados qualquer. E aqui,
 * temos uma associação de um-para-um (One-to-One). Lembre-se que na relação possuiUma, a chave 
 * extrangeira existe no modelo alvo.
 *
 * @Parametro {Objeto} [Fonte] Contêm objeto com atributos e métodos para uma fonte.
 * @Parametro {Objeto} [fonte] A fonte de onde iremos criar uma fonte associada a partir de seu alvo.
 * @Parametro {Objeto} [associacao] É uma associação que pertence a fonte.
 ----------------------------------------------------------------------------------------*/
module.exports = function(Fonte, fonte, associacao) {
  // acesso aos estágios
  var nomeDaSubFonte = associacao.target.options.name.singular.toLowerCase();

  var fonteAssociada = new Fonte({
    aplicativo: fonte.aplicativo,
    sequelize: fonte.sequelize,
    modelo: associacao.target,
    estagiosFinais: [fonte.estagiosFinais.plural + '/:' + associacao.identifierField + '/' + nomeDaSubFonte],
    acoes: ['ler']
  });

  fonteAssociada.opcoesDeAssociacao = fonte.opcoesDeAssociacao;
  fonteAssociada.controladores.ler.incluirEstesAtributos = [ associacao.identifierField ];
  return fonteAssociada;
};
