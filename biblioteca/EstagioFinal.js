'use strict';

/*******************************************************************
 * Restificando é de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id EstagioFinal.js, criado em 31/05/2016 às 18:24 por Leo Felippe $
 *
 * Versão atual 0.0.2-Beta
 */

/* @Objeto EstagioFinal(). 
 * Contêm o linha que é o texto do estágio final e seus atributos. Os estágios
 * finais, são as rotas associadas a um determinado modelo. Por exemplo, imagine
 * o modelo 'usuarios', ele terá os seguintes estágios finais que estão listados
 * abaixo:
 *
 * POST /usuarios                          (Cria um registro de usuário)                                  (Create)
 * GET /usuarios                           (Pega uma lista de registros de usuarios)                      (List)
 * GET /usuarios/:identificador            (Pega um unico registro de usuarios passando um identificador) (Read)
 * PUT|POST|PATCH /usuarios/:identificador (Atualização de um registro de usuários)                       (Update)
 * DELETE /usuarios/:identificador         (Apaga um registro dos usuários)                               (Delete)
 *
 * @Parametro {Texto} [estagioFinal] Contêm um estágio final e seus atributos.
 ----------------------------------------------------------------------------------------*/
var EstagioFinal = function(estagioFinal) {
  
  // Copiamos o texto completo do estágio final.
  this.texto = estagioFinal;  
  
  // Separamos os atributos deste estágio.
  this.atributos = estagioFinal
    .split('/')
    .filter(function(c) { return ~c.indexOf(':') && ~~c.indexOf(':unused'); })
    .map(function(c) { return c.substring(1); });
};

module.exports = EstagioFinal;
