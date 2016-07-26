'use strict';

/*******************************************************************
 * Restificando é de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id inicio.js, criado em 31/05/2016 às 18:20 por Leo Felippe $
 *
 * Versão atual 0.0.2-Beta
 */

var Fonte = require('./Fonte');
var EstagioFinal = require('./EstagioFinal');
var Controladores = require('./Controladores/indice');
var Erros = require('./Erros');
var inflection = require('inflection');
var _ = require('lodash');


/* @Objeto restificando().
 *
 * Aqui iniciamos nosso serviço REST.
 *
 * Quais os passos para iniciar o serviço?
 * 1) Iniciar a nossa fonte: restificando.fonte({});
 * 2) Iniciar o nosso serviço: restificando.inicializar({});
 ----------------------------------------------------------------------------------------*/
var restificando = {
  
  /* @Parametro {Objeto} [opcoes] As configurações do nosso serviço restificando.
   *  - opcoes.aplicativo (Obrigatório) O aplicativo Express.
   *  - opcoes.sequelize (Obrigatório) O ORM (Object-relational mapping) Sequelize.
   *  - opcoes.base (Opcional) O endereço base do servidor REST. ex. https://algum-sitio.com.br/
   */
  inicializar: function(opcoes) {
    opcoes = opcoes || {};
    if (!opcoes.aplicativo) {
      throw new Error('Por favor, especifique o aplicativo Express.');
    }
    
    if (!opcoes.sequelize) {
      throw new Error('Por favor, especifique uma instância do Sequelize.');
    }
    
    this.aplicativo = opcoes.aplicativo;
    this.sequelize = (opcoes.sequelize.Sequelize) ? opcoes.sequelize.Sequelize : opcoes.sequelize;
    this.base = opcoes.base || '';
    
    if (opcoes.metodoDeAtualizacao) {
      var metodo = opcoes.metodoDeAtualizacao.toLowerCase();
      if (!metodo.match(/^(put|post|patch)$/)) {
        throw new Error('O método de atualização deve ser um desses: PUT, POST ou PATCH.');
      }

      this.metodoDeAtualizacao = metodo;
    }
  },

  /* @Parametro {Objeto} [opcoes] As configurações da nossa fonte.
   *  - opcoes.acoes (Opcional) As ações aceitas por esta fonte. 
   *  - opcoes.seForRealizarPaginacao (Opcional) Caso seja necessário habilitar a paginação para determinada fonte.
   *  - opcoes.seForRecarregarInstancias (Opcional)
   *  - opcoes.incluir (Opcional) Vamos incluir mais alguns modelos?
   *  - opcoes.excluirAtributos (Opcional) Os atributos não necessários e que devem ser excluidos.
   *  - opcoes.busca.parametro (Opcional) O parametro utilizado para a busca.
   *  - opcoes.sorteio.parametro (Opcional) O parametro utilizado para sorteio.
   *  - opcoes.modelo (Obrigatório) Um modelo do Sequelize.
   *  - opcoes.estagiosFinais (Opcional) Os estágio de determinada fonte.
   *  - opcoes.metodoDeAtualizacao (Opcional mas recomendado) Qual será o método para atualização? PUT, POST ou PATCH?
   *  - opcoes.sePossuiAssociacoes (Opcional) Caso a fonte possua associações com outras fontes.
   */
  fonte: function(opcoes) {
    opcoes = opcoes || {};
    _.defaults(opcoes, {
      incluir: [],
      sePossuiAssociacoes: false
    });

    if (!opcoes.modelo)
      throw new Error('Por favor, especifique um modelo válido.');

    // Caso não seja informado os estágios finais, então nós mesmo iremos setar.
    if (!opcoes.estagiosFinais || !opcoes.estagiosFinais.length) {
      opcoes.estagiosFinais = [];
      var plural = inflection.pluralize(opcoes.modelo.name);
      opcoes.estagiosFinais.push('/' + plural);
      opcoes.estagiosFinais.push('/' + plural + '/:id');
    }

    // Incorporamos o endereço base ao estágio final.
    var estagiosFinais = [];
    opcoes.estagiosFinais.forEach(function(e) {
      var estagioFinal = this.base + e;
      estagiosFinais.push(estagioFinal);
    }.bind(this));
 
    var fonte = new Fonte({
      aplicativo: this.aplicativo                                  // O aplicativo Express.
    , sequelize: this.sequelize                                    // O ORM (Object-relational mapping) Sequelize.
    , modelo: opcoes.modelo                                        // Um modelo do Sequelize.
    , estagiosFinais: estagiosFinais                               // Os estágio de determinada fonte.
    , acoes: opcoes.acoes                                          // As ações aceitas por esta fonte. 
    , incluir: opcoes.incluir                                      // Vamos incluir mais alguns modelos?
    , seForRealizarPaginacao: opcoes.seForRealizarPaginacao        // Caso seja necessário habilitar a paginação para determinada fonte.
    , metodoDeAtualizacao: this.metodoDeAtualizacao                // Qual será o método para atualização? PUT, POST ou PATCH?
    , busca: opcoes.busca                                          // O parametro utilizado para a busca.
    , sorteio: opcoes.sorteio                                      // O parametro utilizado para sorteio.
    , ordenamento: opcoes.ordenamento
    , seForRecarregarInstancias: opcoes.seForRecarregarInstancias  
    , sePossuiAssociacoes: opcoes.sePossuiAssociacoes              // Caso a fonte possua associações com outras fontes.
    , excluirAtributos: opcoes.excluirAtributos                    // Os atributos não necessários e que devem ser excluidos.
    });

    return fonte;
  },

  Fonte: Fonte,
  EstagioFinal: EstagioFinal,
  Controladores: Controladores,
  Erros: Erros
};

module.exports = restificando;