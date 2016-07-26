'use strict';

/*******************************************************************
 * Restificando é de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id listar.js, criado em 23/07/2016 às 11:14 por Leo Felippe $
 *
 * Versão atual 0.0.2-Beta
 */

var utilitario = require('util');
var Base = require('./base');
var _ = require('lodash');
var erros = require('../Erros');

/* @Objeto Listar().
 *
 * Este é o controlador de deleção. Ele é chamado com o seguinte método GET:
 * fonte.listar    GET /fonte                           (Requisita uma lista de registros desta fonte)                      (List)
 * 
 * @Veja https://github.com/umdez/restificando/blob/master/docs/osControladores.md
 ----------------------------------------------------------------------------------------*/
var Listar = function(args) {
  Listar.super_.call(this, args);
};

utilitario.inherits(Listar, Base);

Listar.prototype.acao = 'listar';
Listar.prototype.metodo = 'get';
Listar.prototype.pluralidade = 'plural';

Listar.prototype._safeishParse = function(valor) {
  try {
    return JSON.parse(valor);
  } catch(err) {
    return valor;
  }
};

var osOperadoresDeTexto = /like|iLike|notLike|notILike/;

/* @Método trazer().
 * 
 * @Parametro {Objeto} [req] A requisição feita ao servidor Express.
 * @Parametro {Objeto} [res] A resposta a requisição ao servidor Express.
 * @Parametro {Objeto} [contexto] Contêm informações deste contexto.
 */
Listar.prototype.trazer = function(req, res, contexto) {
  var meuObjt = this;
  var modelo = this.modelo;
  var opcoes = contexto.opcoes || {};
  var criterio = contexto.criterio || {};
  var incluir = this.incluir;
  var incluirEstesAtributos = this.incluirEstesAtributos;
  var Sequelize = this.fonte.sequelize;
  var defaultCount = 100;
  var count = +contexto.count || +req.query.count || defaultCount;
  var offset = +contexto.offset || +req.query.offset || 0;

  // Somente olhar os atributos que nós importam.
  opcoes.attributes = opcoes.atributos = opcoes.atributos || this.fonte.atributos;
  
  // account for offset and count
  offset += contexto.page * count || req.query.page * count || 0;
  if (count > 1000) count = 1000;
  if (count < 0) count = defaultCount;

  opcoes.offset = offset;
  opcoes.limit = count;
  if (!this.fonte.seForRealizarPaginacao) {  
    delete opcoes.limit;
  }
  
  if (contexto.incluir && contexto.incluir.length) {
    incluir = incluir.concat(contexto.incluir);
  }
  if (incluir.length) {
    opcoes.include = opcoes.incluir = incluir;
  }

  var oParametroDeBusca = this.fonte.busca.parametro;
  if (_.has(req.query, oParametroDeBusca)) {
    var busca = [];
    var oOperadorDeBusca = this.fonte.busca.operador || '$like';
    var osAtributosDeBusca = this.fonte.busca.atributos;
    
    osAtributosDeBusca = (osAtributosDeBusca && osAtributosDeBusca.length ? osAtributosDeBusca : Object.keys(modelo.rawAttributes));
    osAtributosDeBusca.forEach(function(atrib) {
      if(osOperadoresDeTexto.test(oOperadorDeBusca)){
        var oTipoDoAtrib = modelo.rawAttributes[atrib].type;
        if (!(oTipoDoAtrib instanceof Sequelize.STRING) && !(oTipoDoAtrib instanceof Sequelize.TEXT)) {
          // NOTA: O Sequelize adicionou validação basica nos tipos, então nós não podemos
          //       continuar com essas comparações as cegas (blind comparisons). A caracteristica
          //       poderá ser debatida e talvez isso pode ser modificado num futuro próximo.
          return;
        }
      }

      var item = {};
      var query = {};
      var oTextoDaBusca;
      if (!~oOperadorDeBusca.toLowerCase().indexOf('like')) {
        oTextoDaBusca = req.query[oParametroDeBusca];
      } else {
        oTextoDaBusca = '%' + req.query[oParametroDeBusca] + '%';
      }
      query[oOperadorDeBusca] = oTextoDaBusca;
      item[atrib] = query;
      busca.push(item);
    });

    if (Object.keys(criterio).length) {
      criterio = Sequelize.and(criterio, Sequelize.or.apply(null, busca));
    } else {
      criterio = Sequelize.or.apply(null, busca);
    }
  }

  var oParametroDeSorteio = this.fonte.sorteio.parametro;
  var oParametroDeOrdenamento = null;
  console.log('--------------->' + this.fonte.ordenamento);
  
  if (_.has(req.query, oParametroDeSorteio) || _.has(this.fonte.sorteio, 'padrao')) {
    var ordem = [];
    var osNomesDeColunas = [];
    var sortQuery = req.query[oParametroDeSorteio] || this.fonte.sorteio.padrao || '';
    var orderQuery = req.query[oParametroDeOrdenamento] || null;
    
    var sortColumns = sortQuery.split(',');
    sortColumns.forEach(function(sortColumn) {
      if (orderQuery) {
        if (orderQuery === 'desc' || orderQuery === 'DESC' || orderQuery === '1') {
          ordem.push([sortColumn, 'DESC']);
          osNomesDeColunas.push(sortColumn);
        } else if (orderQuery === 'asc' || orderQuery === 'ASC' || orderQuery === '-1') {
          osNomesDeColunas.push(sortColumn);
          ordem.push([sortColumn, 'ASC']);
        } else {
          throw new erros.ErroDeRequisicaoRuim('Ordem de sorteio informada não é valida.');
        }
      } else {
        if (sortColumn.indexOf('-') === 0) {
          var actualName = sortColumn;
          actualName = sortColumn.substring(1);
          ordem.push([actualName, 'DESC']);
          osNomesDeColunas.push(actualName);
        } else {
          osNomesDeColunas.push(sortColumn);
          ordem.push([sortColumn, 'ASC']);
        } 
      }
    });
    var asColunasPermitidas = this.fonte.sorteio.atributos || Object.keys(modelo.rawAttributes);
    var asColunasNaoPermitidas = _.difference(osNomesDeColunas, asColunasPermitidas);
    if (asColunasNaoPermitidas.length) {
      throw new erros.ErroDeRequisicaoRuim('O sorteio não é permitido para estes atributos ', asColunasNaoPermitidas);
    }

    if (ordem.length) {
      opcoes.order = opcoes.ordem = ordem;
    }
  }

  // Todos os outros parametros do query são passados para a pesquisa
  var osCriteriosExtrasDePesquisa = _.reduce(req.query, function(resultado, valor, chave) {
    if (_.has(modelo.rawAttributes, chave)) resultado[chave] = meuObjt._safeishParse(valor);
    return resultado;
  }, {});

  if (Object.keys(osCriteriosExtrasDePesquisa).length)
    criterio = _.assign(criterio, osCriteriosExtrasDePesquisa);

  // Realizar um lookup real
  if (Object.keys(criterio).length) {
    opcoes.where = criterio;
  }
  
  return modelo
    .findAndCountAll(opcoes)
    .then(function(resultado) {
      contexto.instancia = resultado.rows;
      var start = offset;
      var end = start + resultado.rows.length - 1;
      end = end === -1 ? 0 : end;

      if (meuObjt.fonte.opcoesDeAssociacao.removerChaveEstrangeira) {
        _.each(contexto.instancia, function(instancia) {
          _.each(incluirEstesAtributos, function(atrib) {
            delete instancia[atrib];
            delete instancia.dataValues[atrib];
          });
        });
      }

      if (!!meuObjt.fonte.seForRealizarPaginacao)
        res.header('Content-Range', 'items ' + [[start, end].join('-'), resultado.count].join('/'));
        
        // Informamos o total de registros desta listagem.
        // A paginação necessita disso.
        res.set({'X-total': resultado.count});
  
      return contexto.continuar;
    });
};

module.exports = Listar;
