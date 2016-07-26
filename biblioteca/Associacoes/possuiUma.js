'use strict';

/*******************************************************************
 * Restificando � de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id possuiUma.js, criado em 31/05/2016 �s 18:40 por Leo Felippe $
 *
 * Vers�o atual 0.0.2-Beta
 */

/* Exporta uma fun��o para realizar o tipo de associa��o one-to-one. Nesse tipo de associa��o, os dois modelos
 * estar�o conectados por uma �nica chave extrangeira.
 * 
 * Exportamos aqui mais um tipo de associa��o para algum modelo. Aqui temos a associa��o de 
 * possuiUma ou HasOne. Existem v�rios tipos de associa��es entre modelos em um banco de dados.
 * Cada associa��o denota um tipo de rela��o entre modelos dum banco de dados qualquer. E aqui,
 * temos uma associa��o de um-para-um (One-to-One). Lembre-se que na rela��o possuiUma, a chave 
 * extrangeira existe no modelo alvo.
 *
 * @Parametro {Objeto} [Fonte] Cont�m objeto com atributos e m�todos para uma fonte.
 * @Parametro {Objeto} [fonte] A fonte de onde iremos criar uma fonte associada a partir de seu alvo.
 * @Parametro {Objeto} [associacao] � uma associa��o que pertence a fonte.
 ----------------------------------------------------------------------------------------*/
module.exports = function(Fonte, fonte, associacao) {
  // acesso aos est�gios
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
