'use strict';

/*******************************************************************
 * Restificando é de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id Erros.js, criado em 31/05/2016 às 17:47:03 por Leo Felippe $
 *
 * Versão atual 0.0.1-Beta
 */

var Utilitario = require('util');

/* @Objeto RestificandoErro().
 *
 * Responsável por oferecer uma organização básica das respostas de erro ou de
 * sucesso que são possíveis neste serviço.
 * @Veja https://gist.github.com/justmoon/15511f92e5216fa2624b
 *
 * Posteriormente nós iremos extender objetos de erro com as caracteristicas
 * básicas deste objeto. As extenções atuais são listadas abaixo:
 *
 * - [ERRO 500] Erro base que pode acontecer no nosso próprio serviço.
 * - [ERRO 400] Erro de Requisição Ruim ou Bad Request Error.
 * - [ERRO 403] Erro de Proibição ou Forbidden Error.
 * - [ERRO 404] Erro de Não Encontrado ou Not Found Error.
 *
 * @Parametro {Número} [estatos] Valor númerico que está associado a um determinado erro.
 * @Parametro {Texto}  [mensagem] Valor da mensagem associada a determinado erro.
 * @Parametro {Matriz} [erros] Um conjunto de erros.
 * @Parametro {Texto}  [causa] Valor da mensagem da causa associada a determinado erro.
 ----------------------------------------------------------------------------------------*/
var RestificandoErro = function(estatos, mensagem, erros, causa) {
  Error.captureStackTrace(this, this.constructor);
  this.nome = 'RestificandoErro';
  this.mensagem = mensagem || 'RestificandoErro';
  this.erros = erros || [];
  this.estatos = estatos || 500;
  this.causa = causa;
};
Utilitario.inherits(RestificandoErro, Error);

var ErroDeRequisicaoRuim = function(mensagem, erros, causa) {
  RestificandoErro.call(this, 400, mensagem || 'Requisição Ruim', erros, causa);
  this.nome = 'ErroDeRequisicaoRuim';
};
Utilitario.inherits(ErroDeRequisicaoRuim, RestificandoErro);

var ErroDeProibicao = function(mensagem, erros, causa) {
  RestificandoErro.call(this, 403, mensagem || 'Proibido', erros, causa);
  this.nome = 'ErroDeProibicao';
};
Utilitario.inherits(ErroDeProibicao, RestificandoErro);

var ErroDeNaoEncontrado = function(mensagem, erros, causa) {
  RestificandoErro.call(this, 404, mensagem || 'Não encontrado', erros, causa);
  this.nome = 'ErroDeNaoEncontrado';
};
Utilitario.inherits(ErroDeNaoEncontrado, RestificandoErro);

var RequisicaoCompleta = function() {
  Error.call(this);
  this.nome = 'RequisicaoCompleta';
};
Utilitario.inherits(RequisicaoCompleta, Error);

module.exports = {
  ErroDeRequisicaoRuim: ErroDeRequisicaoRuim,
  ErroDeProibicao: ErroDeProibicao,
  ErroDeNaoEncontrado: ErroDeNaoEncontrado,
  RestificandoErro: RestificandoErro,
  RequisicaoCompleta: RequisicaoCompleta
};
