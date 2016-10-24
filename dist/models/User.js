'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _index = require('../actions/index');

var User = Parse.Object.extend('User', {
    initialize: function initialize(attrs, options) {
        //console.log('new user');
        //console.log();
        //console.log(options);
    },
    signUpWithFacebook: function signUpWithFacebook(data) {
        var recipientId = this.get('recipientId');
        return this.signUp(Object.assign(data, {
            username: recipientId.toString(),
            password: recipientId.toString(),
            facebookId: recipientId
        })).fail(function (error) {
            console.log('Error code: ' + error.message);
        });
    },
    registered: function registered() {
        return new Parse.Query('User').equalTo('facebookId', this.get('recipientId')).first().fail(function (error) {
            console.log('Error code: ' + error.message);
        });
    },
    saveInStore: function saveInStore(store) {
        return store.dispatch((0, _index.setUser)(this.get('recipientId'), this)).fail(function (error) {
            console.log('Error code: ' + error.message);
        });
    }
});

exports.default = User;