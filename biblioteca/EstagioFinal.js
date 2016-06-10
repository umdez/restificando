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
 * Contêm o linha que é o texto do estágio final e seus atributos. Os estágios finais, são 
 * as rotas associadas a um determinado modelo. Por exemplo, imagine o modelo 'usuarios', ele
 * terá os seguintes estágios finais que estão listados abaixo:
 *
 * POST /usuarios (Cria um registro de usuário) (Create)
 * GET /usuarios (Pega uma lista de registros de usuarios) (List)
 * GET /usuarios/:identificador (Pega um unico registro de usuarios passando um identificador) (Read)
 * PUT /usuarios/:identificador (Atualização de um registro de usuários) (Update)
 * DELETE /usuarios/:identificador (Apaga um registro dos usuários) (Delete)
 *
 * @Parametro {Texto} [estagioFinal] Texto contendo atributos de determinado estágio.
 ----------------------------------------------------------------------------------------*/
var EstagioFinal = function(estagioFinal) {
  
  this.linha = estagioFinal;  // Copiamos a linha completa do estágio final.
  
  this.atributos = estagioFinal
    .split('/')
    .filter(function(c) { return ~c.indexOf(':') && ~~c.indexOf(':unused'); })
    .map(function(c) { return c.substring(1); });
};

module.exports = EstagioFinal;
