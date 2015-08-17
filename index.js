var Jusolink = require('./lib/Jusolink');
var linkhub = require('linkhub');
var configuration = {LinkID : '',SecretKey : '',IsTest : false};

exports.config = function(config) {
	configuration = config;
}

exports.JusolinkService = function() {
  if(!this._JusolinkService) {
    this._JusolinkService = new Jusolink(configuration);
  }
  return this._JusolinkService;
}
