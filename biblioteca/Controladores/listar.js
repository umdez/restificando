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

var Listar = function(args) {
  Listar.super_.call(this, args);
};

utilitario.inherits(Listar, Base);

Listar.prototype.acao = 'listar';
Listar.prototype.metodo = 'get';
Listar.prototype.pluralidade = 'plural';

Listar.prototype._safeishParse = function(value) {
  try {
    return JSON.parse(value);
  } catch(err) {
    return value;
  }
};

var osOperadoresDeTexto = /like|iLike|notLike|notILike/;
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
  if (!this.fonte.seRealizarPaginacao) {  // <umdez> Talvez mudar o nome para seForRealizarPaginacao
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
  var oParametroDeOrdenamento = (this.fonte.ordenamento ? this.fonte.ordenamento.parametro || 'ord' : 'ord');
  if ((_.has(req.query, oParametroDeSorteio) || _.has(this.fonte.sort, 'default')) && !_.has(req.query, oParametroDeOrdenamento)) {
    var order = [];
    var columnNames = [];
    var sortQuery = req.query[oParametroDeSorteio] || this.fonte.sort.default || '';
    var sortColumns = sortQuery.split(',');
    sortColumns.forEach(function(sortColumn) {
      if (sortColumn.indexOf('-') === 0) {
        var actualName = sortColumn;
        actualName = sortColumn.substring(1);
        order.push([actualName, 'DESC']);
        columnNames.push(actualName);
      } else {
        columnNames.push(sortColumn);
        order.push([sortColumn, 'ASC']);
      } 
    });
    var allowedColumns = this.fonte.sort.attributes || Object.keys(modelo.rawAttributes);
    var disallowedColumns = _.difference(columnNames, allowedColumns);
    if (disallowedColumns.length) {
      throw new erros.ErroDeRequisicaoRuim('Sorting not allowed on given attributes', disallowedColumns);
    }

    if (order.length) {
      opcoes.order = order;
    }  
  } else if ((_.has(req.query, oParametroDeSorteio) || _.has(this.fonte.sort, 'default')) && _.has(req.query, oParametroDeOrdenamento)) {
    // Se houver o parametro order nós vamos fazer o sorteio aqui.
    var order = [];
    var columnNames = [];
    var sortQuery = req.query[oParametroDeSorteio] || this.fonte.sort.default || '';
    var orderQuery = req.query[oParametroDeOrdenamento];
    var sortColumns = sortQuery.split(',');
    sortColumns.forEach(function(sortColumn) {
      var actualName = sortColumn;
      if (sortColumn.indexOf('-') === 0) {
        actualName = sortColumn.substring(1);
      }
      if (orderQuery === 'DESC' || orderQuery === '1') {
        order.push([actualName, 'DESC']);
        columnNames.push(actualName);
      } else if (orderQuery === 'ASC' || orderQuery === '-1') {
        columnNames.push(sortColumn);
        order.push([sortColumn, 'ASC']);
      } else {
         throw new erros.ErroDeRequisicaoRuim('Ordem de sorteio incorreto.');
      }
    });
    var allowedColumns = this.fonte.sort.attributes || Object.keys(modelo.rawAttributes);
    var disallowedColumns = _.difference(columnNames, allowedColumns);
    if (disallowedColumns.length) {
      throw new erros.ErroDeRequisicaoRuim('Sorting not allowed on given attributes', disallowedColumns);
    }

    if (order.length) {
      opcoes.order = order;
    }
  }

  // all other query parameters are passed to search
  var extraSearchCriteria = _.reduce(req.query, function(result, value, key) {
    if (_.has(modelo.rawAttributes, key)) result[key] = meuObjt._safeishParse(value);
    return result;
  }, {});

  if (Object.keys(extraSearchCriteria).length)
    criterio = _.assign(criterio, extraSearchCriteria);

  // do the actual lookup
  if (Object.keys(criterio).length)
    opcoes.where = criterio;

  return modelo
    .findAndCountAll(opcoes)
    .then(function(result) {
      contexto.instance = result.rows;
      var start = offset;
      var end = start + result.rows.length - 1;
      end = end === -1 ? 0 : end;

      if (meuObjt.fonte.associationOptions.removeForeignKeys) {
        _.each(contexto.instance, function(instance) {
          _.each(incluirEstesAtributos, function(attr) {
            delete instance[attr];
            delete instance.dataValues[attr];
          });
        });
      }

      if (!!meuObjt.fonte.seRealizarPaginacao)
        res.header('Content-Range', 'items ' + [[start, end].join('-'), result.count].join('/'));
        
        // Informamos o total de registros desta listagem.
        // A paginação necessita disso.
        res.set({'X-total': result.count});
  
      return contexto.continuar;
    });
};

module.exports = Listar;
