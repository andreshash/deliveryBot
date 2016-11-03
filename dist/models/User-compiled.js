'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _index=require('../actions/index');var User=Parse.Object.extend('User',{initialize:function initialize(attrs,options){//console.log('new user');
//console.log();
//console.log(options);
},signUpWithFacebook:function signUpWithFacebook(data){var facebookId=this.get('facebookId');return this.signUp(Object.assign(data,{username:facebookId.toString(),password:facebookId.toString()})).fail(function(error){console.log('Error code: '+error.message);});},registered:function registered(){return new Parse.Query('User').equalTo('facebookId',this.get('facebookId')).first().fail(function(error){console.log('Error code: '+error.message);});},saveInStore:function saveInStore(store,recipientId){return store.dispatch((0,_index.setUser)(recipientId,this)).fail(function(error){console.log('Error code: '+error.message);});}});exports.default=User;

//# sourceMappingURL=User-compiled.js.map