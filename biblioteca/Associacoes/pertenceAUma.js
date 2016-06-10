'use strict';

/*******************************************************************
 * Restificando � de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id pertenceAUma.js, criado em 31/05/2016 �s 18:41:09 por Leo Felippe $
 *
 * Vers�o atual 0.0.1-Beta
 */

/* Exporta uma fun��o para o tipo de associa��o one-to-one. Nesse tipo de associa��o, os dois modelos
 * estar�o conectados por uma �nica chave extrangeira.
 *
 * Exportamos aqui mais um tipo de associa��o para algum modelo. Aqui temos a associa��o de 
 * pertenceAUma ou BelongsTo. Existem v�rios tipos de associa��es entre modelos em um banco de dados.
 * Cada associa��o denota um tipo de rela��o entre modelos dum banco de dados qualquer. E aqui,
 * temos uma associa��o de um-para-um. Lembre-se que nesse tipo de rela��o, a chave 
 * extrangeira existe no modelo fonte.
 ----------------------------------------------------------------------------------------*/
module.exports = function(Fonte, fonte, associacao) {
  // acesso aos est�gios
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
