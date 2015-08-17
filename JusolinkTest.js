var jusolink = require('./');

jusolink.config({
  LinkID :'TESTER_JUSO',
  SecretKey : 'FjaRgAfVUPvSDHTrdd/uw/dt/Cdo3GgSFKyE1+NQ+bc=',
  defaultErrorHandler :  function(Error) {
    console.log('Error Occur : [' + Error.code + '] ' + Error.message);
  }
});

var jusolinkService = jusolink.JusolinkService();

jusolinkService.getUnitCost(
  function(UnitCost){
    console.log('UnitCost is : '  +  UnitCost);
  }, function(error){
    console.log(error);
});

jusolinkService.getBalance(
  function(Balance){
    console.log('Balance is : '  +  Balance);
  }, function(error){
    console.log(error);
});

var Index = '영동대로';       // 검색어
var PageNum = 1;            // 페이지번호
var PerPage = 20;           // 페이지 목록 갯수
var noSuggest = false;      // 수정제시어 기능 끄기
var noDifferential = false; // 차등검색 기능 끄기

jusolinkService.search(Index, PageNum, PerPage, noSuggest, noDifferential,
  function(Response){
    console.log(Response);
  }, function(Error){
    console.log(Error);
});