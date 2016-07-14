'use strict';

/*******************************************************************
 * Restificando é de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id ler.js, criado em 14/07/2016 às 12:17:03 por Leo Felippe $
 *
 * Versão atual 0.0.2-Beta
 */

var utilitario = require('util'),
    Base = require('./base'),
    errors = require('../Erros');

var Ler = function(args) {
  Ler.super_.call(this, args);
};

utilitario.inherits(Ler, Base);

Read.prototype.acao = 'ler';
Read.prototype.metodo = 'get';
Read.prototype.pluralidade = 'singular';

Read.prototype.fetch = function(req, res, context) {
  var model = this.model,
      endpoint = this.endpoint,
      options = context.options || {},
      criteria = context.criteria || {},
      include = this.include,
      includeAttributes = this.includeAttributes || [];

  // only look up attributes we care about
  options.attributes = options.attributes || this.resource.attributes;

  // remove params that are already accounted for in criteria
  Object.keys(criteria).forEach(function(attr) { delete req.params[attr]; });
  endpoint.attributes.forEach(function(attribute) {
    if (attribute in req.params) criteria[attribute] = req.params[attribute];
  });

  if (Object.keys(criteria).length) {
    options.where = criteria;
  }

  if (context.include && context.include.length) {
    include = include.concat(context.include);
  }

  if (include.length) options.include = include;
  if (this.resource.associationOptions.removeForeignKeys) {
    options.attributes = options.attributes.filter(function(attr) {
      return includeAttributes.indexOf(attr) === -1;
    });
  }

  return model
    .find(options)
    .then(function(instance) {
      if (!instance) {
        throw new errors.NotFoundError();
      }

      context.instance = instance;
      return context.continue;
    });
};

module.exports = Read;
