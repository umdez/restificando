'use strict';

/*******************************************************************
 * Restificando é de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id EstagioFinal.js, criado em 31/05/2016 às 18:24:14 por Leo Felippe $
 *
 * Versão atual 0.0.1-Beta
 */

/* @Objeto EstagioFinal(). 
 * Contêm o texto do estágio final e seus atributos. 
 *
 * @Parametro {Texto} [estagioFinal] Texto contendo atributos de determinado estágio.
 ----------------------------------------------------------------------------------------*/
var EstagioFinal = function(estagioFinal) {
  this.linha = estagioFinal;
  this.atributos = estagioFinal
    .split('/')
    .filter(function(c) { return ~c.indexOf(':') && ~~c.indexOf(':unused'); })
    .map(function(c) { return c.substring(1); });
};

module.exports = EstagioFinal;
