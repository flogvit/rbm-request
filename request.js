/**
 * Created by flogvit on 2015-06-29.
 *
 * @copyright Cellar Labs AS, 2015, www.cellarlabs.com, all rights reserved
 * @file
 * @license MIT
 * @author Vegard Hanssen <Vegard.Hanssen@cellarlabs.com>
 * @module rbm-request
 *
 */

var _ = require('underscore');

/**
 *
 * @class
 * @classdesc
 */
function Request(obj) {
  if (!(_.isObject(obj))) {
    obj = {};
  }

  this.command = _.has(obj, 'command') ? obj.command : '';
  this.params = _.has(obj, 'params') ? obj.params : {};
  this.populate = _.has(obj, 'populate') ? obj.populate : [];
  this.reqid = _.has(obj, 'reqid') ? obj.reqid : 0;
  this.extra = _.has(obj, 'extra') ? obj.extra : {};
  if (_.has(obj, 'error'))
    this.error = obj.error;
  if (_.has(obj, 'rid'))
    this.rid = obj.rid;
  if (_.has(obj, 'sid'))
    this.sid = obj.sid;
  if (_.has(obj, 'uid'))
    this.uid = obj.uid;
  if (_.has(obj, 'hops'))
    this.hops = obj.hops;
  if (_.has(obj, 'now'))
    this.now = obj.now;
  else
    this.now = Date.now();
}

Request.prototype.withCommand =
    Request.prototype.setCommand = function (command) {
      this.command = command;
      return this;
    }


Request.prototype.withParams =
    Request.prototype.setParams = function (params) {
      this.params = params;
      return this;
    }

Request.prototype.withParam =
    Request.prototype.setParam = function (key, value) {
      this.params[key] = value;
      return this;
    }

Request.prototype.getParams = function () {
  return this.params;
}

Request.prototype.has = function (key) {
  return key in this.params
}

Request.prototype.get = function (key, defaultValue) {
  return this.has(key) ? this.params[key] : defaultValue !== null ? defaultValue : null;
}

Request.prototype.set = function (key, value) {
  this.params[key] = value;
  return this;
}

Request.prototype.getString = function(key) {
  return ''+this.get(key);
}

Request.prototype.getNumber = function (key) {
  return Number(this.get(key));
}

Request.prototype.getArray = function(key) {
  return _.isArray(this.get(key)) ? this.get(key) : [this.get(key)];
}

Request.prototype.getBoolean = function(key) {
  return this.get(key) ? true : false;
}

Request.prototype.hasExtra = function (key) {
  return key in this.extra;
}
Request.prototype.getExtra = function (key) {
  return this.hasExtra(key) ? this.extra[key] : null;
}

Request.prototype.withExtra =
    Request.prototype.setExtra = function (key, value) {
      this.extra[key] = value;
      return this;
    }

Request.prototype.copyExtra = function (req) {
  this.extra = JSON.parse(JSON.stringify(req.extra));
}

Request.prototype.withService = function(serviceid) {
  this.rid = serviceid;
  return this;
}

Request.prototype.isError = function () {
  return 'error' in this;
}

Request.prototype.getError = function () {
  return this.error;
}

Request.prototype.needResponse = function () {
  return ('reqid' in this) && this.reqid>0;
}

Request.prototype.createResponse = function (obj) {
  var req = new Request();
  if ('sid' in this) {
    req.rid = this.sid;
  }
  req.reqid = this.reqid;
  if (req.reqid===0) {
    if ('uid' in this)
      req.uid = this.uid;
    else if (this.hasExtra('uid'))
      req.toUser(this.getExtra('uid'));
  }
  req.params = obj;
  req.command = this.command;
  req.extra = this.extra;
  if ('error' in this)
    req.error = this.error;
  return req;
}

Request.prototype.toUser = function(uid, persistent) {
  this.uid = { 
    uid: uid,
    persistent: persistent!==null ? persistent : false
  };
  return this;
}

Request.prototype.addPopulate = function (req, returns) {
  if (!('populate' in this))
    this.populate = [];
  this.populate.push({
    request: req.dataCore(),
    returns: returns
  });
  return this;
}

Request.prototype.createError = function (code, text) {
  var req = new Request();
  req.error = code;
  if (text)
    req.errorText = text;
  req.command = this.command;
  req.reqid = this.reqid;
  req.extra = this.extra;
  if (req.reqid===0) {
    if ('uid' in this)
      req.uid = this.uid;
    else if (this.hasExtra('uid'))
      req.toUser(this.getExtra('uid'));
  }
  if ('rid' in this)
    req.rid = this.rid;
  else if ('sid' in this)
    req.rid = this.sid;
  return req;
}

Request.prototype.acknowledge = function (obj) {
  var req = new Request();
  req.reqid = this.reqid;
  req.extra = this.extra;
  if (req.reqid===0) {
    if ('uid' in this)
      req.uid = this.uid;
    else if (this.hasExtra('uid'))
      req.toUser(this.getExtra('uid'));
  }

  if ('sid' in this) {
    req.rid = this.sid;
  }
  if (obj) {
    req.params = obj;
  }
  return req;
}

Request.prototype.addHop = function(sid) {
  if (!('hops' in this))
    this.hops = [];
  this.hops.push(sid);
}

Request.prototype.hasHop = function(sid) {
  if (!('hops' in this)) return false;
  return this.hops.indexOf(sid)>=0;
}

Request.prototype.dataCore = function () {
  var res = {
    command: this.command,
    now: this.now
  }
  if (!_.isEmpty(this.params))
    res.params = this.params;
  if (!_.isEmpty(this.extra))
    res.extra = this.extra;
  if (this.reqid > 0) {
    res.reqid = this.reqid;
  }
  if ('sid' in this)
    res.sid = this.sid;
  if ('rid' in this)
    res.rid = this.rid;
  if ('populate' in this && !_.isEmpty(this.populate))
    res.populate = this.populate;
  if ('error' in this)
    res.error = this.error;
  if ('uid' in this)
    res.uid = this.uid;
  if ('hops' in this)
    res.hops = this.hops;
  return res;
}

Request.prototype.data = function () {
  return jsonToData(this.dataCore());
}

Request.prototype.dataClean = function () {
  var res = {
    command: this.command,
    params: this.params,
    now: this.now
  }
  if (this.reqid > 0) {
    res.reqid = this.reqid;
  }
  if ('error' in this)
    res.error = this.error;

  return jsonToData(res);
}

Request.prototype.clone = function() {
  return new Request(JSON.parse(JSON.stringify(this)));
}

/**
 * dataToJSON
 *
 * @param {object} data
 * @return {object} json
 *
 * Will take a string/object and try to return a json object of it
 */
var dataToJSON = function (data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return {};
  }

};

/**
 * jsonToData
 *
 * @param {object} json
 * @return {string} string
 */
var jsonToData = function (json) {
  return JSON.stringify(json);
};

module.exports = Request;
