/**
 * A simple Solr wrapper for AngularJS apps
 * @version v0.0.2 - 2013-11-28
 * @link https://github.com/front/solstice
 * @author Élio Cró <elio@front.no>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

(function (ng) {
  'use strict';

  var solr = ng.module('solstice', []);

  /* Solr search service */
  solr.provider('Solstice', function () {
    var defEndpoint = '';
    return {
      setEndpoint: function (url) {
        defEndpoint = url;
      },
      $get: function ($http, $q) {
        function Solstice(endpoint) {
          var self = this;
          this.aborter = $q.defer();

          this.search = function(options) {
            var url = endpoint + '/select/',
              defaults = {
                wt: 'json',
                'json.wrf': 'JSON_CALLBACK'
              };

            ng.extend(defaults, options);

              var $Abort = $q.defer(),
               request = $http.jsonp(url, {
                params: defaults,
                timeout: $Abort
              }),
              promise = request.then(function(response){
                return (response);
              });

              promise.catch(function(response){
                return (response);
              });

              promise.abort= function(){
                console.log('Aborted');
                $Abort.resolve();
              };

              promise.finally(function(){
                promise.abort = angular.noop;
                $Abort = request = promise = null;
              });

              return (promise)


          };
          this.withEndpoint = function (url) {
            return new Solstice(url);
          };
        }
        return new Solstice(defEndpoint);
      }
    };
  });

  /* Solr search directive */
  solr.directive('solrSearch', function() {
    return {
      restrict: 'AE',
      transclude: true,
      replace: false,
      template: '<div ng-transclude></div>',
      scope: {
        q: '@query',
        start: '@',
        rows: '@',
        sort: '@',
        fl: '@fields',
        indexUrl: '@'
      },
      controller: function ($scope, $rootScope, Solstice) {
        var searchServ = !$scope.indexUrl ? Solstice :
          Solstice.withEndpoint($scope.indexUrl);

        var options = {
          q: $scope.q || '*:*',
          start: $scope.start || 0,
          rows: $scope.rows || 10
        };
        if($scope.sort) {
          options.sort = $scope.sort;
        }
        if($scope.fl) {
          options.fl = $scope.fl;
        }

        searchServ.search(options)
        .then(function (data) {
          var res = data.data.response;
          var transScope = $scope.$$nextSibling;
          transScope.solr = $rootScope.solr || {};
          transScope.solr.results = res.docs;
          transScope.solr.count = res.numFound;
        });
      }
    };
  });

})(window.angular);
