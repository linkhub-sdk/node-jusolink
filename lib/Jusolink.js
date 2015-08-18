var Util = require('util');
var EventEmitter = require('events').EventEmitter;
var linkhub = require('linkhub');
var http = require('https');

module.exports = Jusolink;
Util.inherits(Jusolink,EventEmitter);

function Jusolink(config) {
  EventEmitter.call(this);

  this._config = config;
  this.ServiceID = 'JUSOLINK';
  this.ServiceURL = 'juso.linkhub.co.kr';
  this.Version = '1.0';

  linkhub.initialize({
    LinkID : this._config.LinkID,
    SecretKey : this._config.SecretKey,
    defaultErrorHandler : this._config.defaultErrorHandler
  });

  this._Linkhub_Token = '';
  this._scopes = ['200'];
};

// 잔여포인트 조회
Jusolink.prototype.getBalance = function(success,error) {
  linkhub.getPartnerBalance(this._getToken(),success,error);
};

// 주소검색 단가 확인
Jusolink.prototype.getUnitCost = function(success,error){
  this._executeAction({
    uri : '/Search/UnitCost',
    success : function(response){
      if(success) success(response.unitCost);
    },
    error : error
  });
};

// 주소 검색
Jusolink.prototype.search = function(Index,PageNum,PerPage,noSuggest,noDifferential,success,error){

  var uriString = '';

  if(!Index || 0 === Index.length) {
    this._throwError(-99999999,'검색어가 입력되지 않았습니다.',error);
    return;
  }

  if(PageNum < 0 || !PageNum) PageNum = 1;
  if(PerPage < 0 || !PerPage) PerPage = 20;

  uriString += '/Search?Searches=' + encodeURIComponent(Index);
  uriString += '&PageNum='+PageNum;
  uriString += '&PerPage='+PerPage;

  if(noSuggest) uriString += '&noSuggest=true';
  if(noDifferential) uriString += '&noDifferential=true';

  this._executeAction({
    uri : uriString,
    success : function(response){
      if(success) success(response);
    },
    error : error
  });
};

Jusolink.prototype._getToken = function(err) {

  var newToken = this._Linkhub_Token
  var expired = true;

  if(typeof newToken === 'function') {
    var expiration = new Date(newToken(function(){},err).expiration);
    if(expiration)
      expired = new Date() > expiration;
    else
      expired = false;
  }

  if(expired) {
    newToken = linkhub.newToken(this.ServiceID,null,this._getScopes(),null);
    this._Linkhub_Token = newToken;
  }

  return newToken;
};

Jusolink.prototype._getScopes = function() {
  return this._scopes;
}


Jusolink.prototype._executeAction = function(options) {

  if(!(options.Method)) options.Method = 'GET';

  var headers = {};
  var Token = function(callback) {callback(null);};

  Token = this._getToken();

  var _this = this;

  Token(function(token) {

    if(token) headers['Authorization'] =  'Bearer ' + token.session_token;
    headers['x-api-version'] = _this.Version;

    var requestOpt = {
      host : _this.ServiceURL,
      path : options.uri,
      method : 'GET',
      headers : headers
    }

    var req = _this._makeRequest(
      requestOpt,
      function(response){
        if(options.success) options.success(response);
      },
      (typeof options.error === 'function') ? options.error : _this._config.defaultErrorHandler
    );
    req.end();
  },options.error);
};

Jusolink.prototype._makeRequest = function(options,success,error) {
  var request = http.request(options,
    function(response) {
      var buf = new Buffer(0);

      response.on('data',function(chunk) {
        buf = Buffer.concat([buf,chunk]);
      });

      response.on('end',function(){
        if(this.statusCode == '200'){
          success(JSON.parse(buf));
        }
        else if(error) {
          error(JSON.parse(buf));
        }
      });
    }
  );

  request.on('error',function(err){
    if(err.code != 'ECONNRESET')
      console.error(err);
  });
  return request;
};

Jusolink.prototype._throwError = function(Code,Message,err) {
  if(err)
    err({code : Code , message : Message});
  else if (typeof this._config.defaultErrorHandler === 'function')
    this._config.defaultErrorHandler({code:Code,message:Message});
}