'use strict';

/*******************************************************************
 * Restificando � de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id possuiMuitas.js, criado em 31/05/2016 �s 18:40 por Leo Felippe $
 *
 * Vers�o atual 0.0.1-Beta
 */

/* Exporta uma fun��o para realizar o tipo de associa��o One-To-Many. Esse tipo de associa��o conecta
 * um modelo fonte especifico com multiplos modelos alvos.
 * 
 * Exportamos aqui mais um tipo de associa��o para algum modelo. Aqui temos a associa��o de 
 * possuiMuitas ou HasMany. Existem v�rios tipos de associa��es em um banco de dados.
 * Cada associa��o denota um tipo de rela��o entre modelos dum banco de dados qualquer. 
 * E aqui, n�s temos uma associa��o de Um-para-Muitos (One-To-Many). Essa associa��o de 
 * Um-para-Muitos faz a conex�o de uma fonte com multiplos alvos e, al�m disso, estes alvos
 * est�o tamb�m conectados a uma fonte espec�fica. Lembre-se que nesse tipo de rela��o, a
 * chave extrangeira da fonte ficar� no(s) modelo(s) alvos.
 *
 * @Parametro {Objeto} [Fonte] Cont�m objeto com atributos e m�todos para uma fonte.
 * @Parametro {Objeto} [fonte] A fonte de onde iremos criar uma fonte associada a partir de seu alvo.
 * @Parametro {Objeto} [associacao] � uma associa��o que pertence a fonte.
 ----------------------------------------------------------------------------------------*/
module.exports = function(Fonte, fonte, associacao) {
  // acesso aos est�gios
  var subNomeDaFonte = associacao.target.options.name.plural.toLowerCase();
  
  var fonteAssociada = new Fonte({
    aplicativo: fonte.aplicativo,
    sequelize: fonte.sequelize,
    modelo: associacao.target,
    estagiosFinais: [
      fonte.estagiosFinais.plural + '/:' + associacao.identifierField + '/' + subNomeDaFonte,
      fonte.estagiosFinais.plural + '/:' + associacao.identifierField + '/' + subNomeDaFonte + '/:id'
    ],
    acoes: ['ler', 'listar']
  });

  fonteAssociada.opcoesDeAssociacao = fonte.opcoesDeAssociacao;
  fonteAssociada.controladores.ler.incluirAtributos = [ associacao.identifierField ];
  fonteAssociada.controladores.listar.incluirAtributos = [ associacao.identifierField ];

  fonteAssociada.listar.trazer.antesQue(function(requisicao, resposta, contexto) {
    // Filtramos
    contexto.criterio = contexto.criterio || {};
    contexto.criterio[associacao.identifierField] = requisicao.params[associacao.identifierField];
    contexto.continue();
  });

  return fonteAssociada;
};
