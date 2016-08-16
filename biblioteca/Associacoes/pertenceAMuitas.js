'use strict';

/*******************************************************************
 * Restificando � de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id pertenceAMuitas.js, criado em 31/05/2016 �s 18:41 por Leo Felippe $
 *
 * Vers�o atual 0.0.1-Beta
 */

var _ = require('lodash');

/* Exporta uma fun��o para realizar o tipo de associa��o Belongs-To-Many. Esse
 * tipo de associa��o conecta um modelo fonte especifico com multiplos modelos
 * alvos. Posteriormente os alvos podem tamb�m ter conex�es com multiplos
 * modelos fonte.
 * 
 * Exportamos aqui mais um tipo de associa��o para algum modelo. Aqui temos a
 * associa��o de pertenceAMuitas ou belongsToMany. Existem v�rios tipos de
 * associa��es em um banco de dados. Cada associa��o denota um tipo de rela��o
 * entre modelos dum banco de dados qualquer.
 *
 * @Parametro {Objeto} [Fonte] Cont�m objeto com atributos e m�todos para uma fonte.
 * @Parametro {Objeto} [fonte] 
 * @Parametro {Objeto} [associacao] 
 ----------------------------------------------------------------------------------------*/
module.exports = function(Fonte, fonte, associacao) {
  // acesso aos est�gios
  var subNomeDaFonte = associacao.target.options.name.plural.toLowerCase();

  // Procurar associa��o inversa
  var associacaoEmparelhada;
  if (associacao.paired) {
    associacaoEmparelhada = _.find(associacao.target.associations, associacao.paired);
  } else {
    associacaoEmparelhada = _.findWhere(associacao.target.associations, {
      paired: associacao
    });
  }

  if (!associacaoEmparelhada) {
    // N�o criar a fonte
    return;
  }

  var fonteAssociada = new Fonte({
    aplicativo: fonte.aplicativo,
    sequelize: fonte.sequelize,
    modelo: associacao.target,
    estagiosFinais: [
      fonte.estagiosFinais.singular + '/' + subNomeDaFonte,
      fonte.estagiosFinais.plural + '/:' + associacaoEmparelhada.foreignIdentifierField  + '/' + subNomeDaFonte + '/:id'
    ],
    acoes: ['ler', 'listar']
  });

  fonteAssociada.opcoesDeAssociacao = fonte.opcoesDeAssociacao;
  fonteAssociada.ler.trazer.antesQue(function(requisicao, resposta, contexto) {
    var emQueLocal = {};
    emQueLocal[associacao.source.primaryKeyField] = requisicao.params[associacaoEmparelhada.foreignIdentifierField];
    delete requisicao.params[associacaoEmparelhada.foreignIdentifierField];

    contexto.incluir = contexto.incluir || [];
    contexto.incluir.push({
      association: associacaoEmparelhada,
      where: emQueLocal
    });
    contexto.continuar();
  });

  fonteAssociada.ler.enviar.antesQue(function(requisicao, resposta, contexto) {
    delete contexto.instancia.dataValues[associacaoEmparelhada.as];
    contexto.continuar();
  });

  fonteAssociada.listar.trazer.antesQue(function(requisicao, resposta, contexto) {
    // Filtra
    var emQueLocal = {};
    emQueLocal[associacao.source.primaryKeyField] = requisicao.params.id;

    contexto.incluir = contexto.incluir || [];
    contexto.incluir.push({
      association: associacaoEmparelhada,
      where: emQueLocal
    });

    contexto.continuar();
  });

  fonteAssociada.listar.enviar.antesQue(function(requisicao, resposta, contexto) {
    contexto.instancia.forEach(function(instancia) {
      if (instancia.dataValues[associacaoEmparelhada.as]) {
        instancia.dataValues[associacaoEmparelhada.as].forEach(function(a) {
          delete a.dataValues[associacaoEmparelhada.combinedName];
        });
      }
    });

    contexto.continuar();
  });

  return fonteAssociada;
};
