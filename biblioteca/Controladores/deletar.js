'use strict';

/*******************************************************************
 * Restificando é de (C) propriedade da Devowly Sistemas 2015-2016 *
 *                 https://github.com/devowly                      *
 *******************************************************************
 * 
 * $Id deletar.js, criado em 14/07/2016 às 16:45:03 por Leo Felippe $
 *
 * Versão atual 0.0.2-Beta
 */

var util = require('util'),
    Base = require('./base'),
    ReadController = require('./read');

var Delete = function(args) {
  Delete.super_.call(this, args);
};

util.inherits(Delete, Base);

Delete.prototype.action = 'delete';
Delete.prototype.method = 'delete';
Delete.prototype.plurality = 'singular';

Delete.prototype.fetch = ReadController.prototype.fetch;

Delete.prototype.write = function(req, res, context) {
  return context.instance
    .destroy()
    .then(function() {
      context.instance = {};
      return context.continue;
    });
};

module.exports = Delete;
