'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _underscore = require('underscore');

var _ = _interopRequireWildcard(_underscore);

var _bot = require('./bot');

var bot = _interopRequireWildcard(_bot);

var _actionTypes = require('./constants/actionTypes');

var types = _interopRequireWildcard(_actionTypes);

var _index = require('./actions/index');

var Actions = _interopRequireWildcard(_index);

var _ParseModels = require('./ParseModels');

var ParseModels = _interopRequireWildcard(_ParseModels);

var _ParseUtils = require('./ParseUtils');

var _redux = require('redux');

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _node = require('parse/node');

var _node2 = _interopRequireDefault(_node);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _hashmap = require('hashmap');

var _hashmap2 = _interopRequireDefault(_hashmap);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _fb = require('fb');

var _fb2 = _interopRequireDefault(_fb);

var _reduxThunk = require('redux-thunk');

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var APP_SECRET = process.env.MESSENGER_APP_SECRET ? process.env.MESSENGER_APP_SECRET : _config2.default.get('APP_SECRET');
var PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN ? process.env.MESSENGER_PAGE_ACCESS_TOKEN : _config2.default.get('PAGE_ACCESS_TOKEN');

var PARSE_APP_ID = process.env.PARSE_APP_ID ? process.env.PARSE_APP_ID : _config2.default.get('PARSE_APP_ID');

var PARSE_SERVER_URL = process.env.PARSE_SERVER_URL ? process.env.PARSE_SERVER_URL : _config2.default.get('PARSE_SERVER_URL');

var FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID ? process.env.FACEBOOK_APP_ID : _config2.default.get('FACEBOOK_APP_ID');

var REDIRECT_URI = process.env.REDIRECT_URI ? process.env.REDIRECT_URI : _config2.default.get('REDIRECT_URI');

var BUSINESS_ID = process.env.BUSINESS_ID ? process.env.BUSINESS_ID : _config2.default.get('BUSINESS_ID');

_node2.default.initialize(PARSE_APP_ID);
_node2.default.serverURL = PARSE_SERVER_URL;
_fb2.default.options({
    appId: FACEBOOK_APP_ID,
    appSecret: APP_SECRET,
    redirectUri: REDIRECT_URI
});

bot.rules.set('hola', sendMenuMessage);
bot.rules.set('buenos dias', sendMenuMessage);
bot.rules.set('buenos tardes', sendMenuMessage);
bot.rules.set('pedir a domicilio', sendAddressMenu);
bot.rules.set('cuenta', sendBillMessage);

bot.payloadRules.set('SendAddressMenu', sendAddressMenu);
bot.payloadRules.set('SetAddress', setAddress);
bot.payloadRules.set('SendCategories', sendCategories);
bot.payloadRules.set('SendProducts', sendProducts);
bot.payloadRules.set('AddProduct', addProduct);
bot.payloadRules.set('SendBillMessage', sendBillMessage);

var initialState = {
    geocodedLocation: { lat: -1, lng: -1 },
    addresses: [],
    mapBounds: {},
    mapAddress: '',
    useSubCategories: false,
    products: [],
    pointOfSales: [],
    categories: [],
    paymentMethods: [],
    consumer: {},
    customer: {},
    orders: { ongoing: [], delivered: [] },
    orderToRate: null,
    currentOrder: {
        consumerAddress: {},
        items: []
    },
    locationZoom: 3,
    profileIsOpen: false,
    mapAddressIsOpen: false,
    addressFormIsOpen: false,
    addressListIsOpen: false,
    savingAddress: false,
    creatingOrder: false,
    paymentMethodNotSelected: false,
    cartTotalIsBelowMinimumPrice: false,
    currentCategory: {},
    consumerNotFound: false,
    updatingConsumer: false,
    currentUser: {},
    pendingOrder: false
};

var reducer = function reducer() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
    var action = arguments[1];

    console.log('ACTION');
    console.log(action);
    var item = void 0;
    switch (action.type) {
        case types.APP_LOADED:
            console.log('Application is running on port', bot.app.get('port'));
            return _extends({}, state);
        case types.CONSUMER_UPDATED:
            return _extends({}, state);
        case types.CONSUMER_LOADED:
            if (state.consumerNotFound) delete state.consumerNotFound;
            var consumer = (0, _ParseUtils.extractParseAttributes)(action.data.consumer);
            //objectAssign(state.consumerAddress, {consumer})
            (0, _objectAssign2.default)(state, { consumer: consumer, currentUser: action.data.user });
            return _extends({}, state);
        case types.CONSUMER_NOT_FOUND:
            (0, _objectAssign2.default)(state, {
                consumerNotFound: true,
                currentUser: action.data.user
            });
            return _extends({}, state);
        case types.CONSUMER_ADDRESSES_LOADED:
            var addresses = action.data.map(function (a) {
                return (0, _ParseUtils.extractParseAttributes)(a);
            });
            (0, _objectAssign2.default)(state, { addresses: addresses });
            return _extends({}, state);
        case types.CONSUMER_ORDERS_LOADED:
            var orders = action.data;
            var ongoing = orders['ongoing'].map(function (o) {
                return (0, _ParseUtils.extractParseAttributes)(o);
            });
            var delivered = orders['delivered'].map(function (o) {
                return (0, _ParseUtils.extractParseAttributes)(o);
            });
            var orderToRate = delivered[0];
            (0, _objectAssign2.default)(state, {
                orders: { ongoing: ongoing, delivered: delivered },
                orderToRate: orderToRate
            });
            return _extends({}, state);
        case types.CUSTOMER_LOADED:
            var customer = (0, _ParseUtils.extractParseAttributes)(action.data.customer);
            (0, _objectAssign2.default)(state, { customer: customer });
            return _extends({}, state);
        case types.RENDER_MENU:
            /*
            console.log('Store');
            console.log(store.getState())
            console.log('Consumer');
            console.log(consumer);*/
            renderMenuMessage();

            /*request({
             uri: 'https://graph.facebook.com/v2.6/' + '1100195690052041',
             qs: {access_token: PAGE_ACCESS_TOKEN, fields: 'first_name,last_name,locale,timezone,gender'},
             method: 'GET'
             }, renderMenuMessage);*/

            return state;
        case types.RENDER_ADDRESS_MENU:

            renderAddressMenuMessage();

            return state;
        default:
            return state;
    }
};

var store = (0, _redux.createStore)(reducer, (0, _redux.applyMiddleware)(_reduxThunk2.default));

store.subscribe(function () {
    return console.log('\n');
} //store.getState())
);

global.Parse = _node2.default;
global.FB = _fb2.default;

function sendMenuMessage(recipientId) {
    bot.sendTypingOn(recipientId);
    store.dispatch(Actions.loadCustomer(BUSINESS_ID)).then(function () {
        new _node2.default.Query(ParseModels.User).get('y2DqRylTEb').then(function (user) {
            store.dispatch(Actions.loadConsumer(user)).then(function () {
                renderMenuMessage(recipientId);
            });
        }, function (object, error) {
            console.log(error);
            // error is an instance of Parse.Error.
        });
    });
}

function renderMenuMessage(recipientId) {
    var consumer = store.getState().consumer;
    var customer = store.getState().customer;

    //var currentUser = Parse.User.current();

    var image_url = customer.image.url;
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    //text: "Buenos dias, para conocer nuestros menus del dia, por favor escoja una opción:",
                    elements: [{
                        "title": "Hola " + consumer.name + ", Bienvenido a OXXO. ",
                        "subtitle": "Aquí puedes pedir un domicilio, escribe o selecciona alguna de las opciones:",
                        "image_url": image_url,
                        "buttons": [{
                            "type": "postback",
                            "title": "Pedir a domicilio",
                            "payload": "SendAddressMenu"
                        }, {
                            "type": "postback",
                            "title": "Pedir para recoger",
                            "payload": "TakeOut"
                        }, {
                            "type": "postback",
                            "title": "Servicio al cliente",
                            "payload": "CustomerService"
                        }]
                    }]
                }
            }
        }
    };

    bot.sendTypingOff(recipientId);
    bot.callSendAPI(messageData);
}

function sendAddressMenu(recipientId) {
    bot.sendTypingOn(recipientId);
    var consumer = store.getState().consumer;
    if (!_.isEmpty(consumer)) {
        store.dispatch(Actions.loadConsumerAddresses(consumer.rawParseObject)).then(function () {
            renderAddressMenuMessage(recipientId);
        });
    } else {
        store.dispatch(Actions.loadCustomer(BUSINESS_ID)).then(function () {
            new _node2.default.Query(ParseModels.User).get('y2DqRylTEb').then(function (user) {
                store.dispatch(Actions.loadConsumer(user)).then(function () {
                    renderAddressMenuMessage(recipientId);
                });
            }, function (object, error) {
                console.log(error);
                // error is an instance of Parse.Error.
            });
        });
    }
}

function renderAddressMenuMessage(recipientId) {
    var addresses = store.getState().addresses;

    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            "text": "A cual dirección vas hacer tu pedido?", //puedes escoger entre tus direcciones almacenadas o registrar una nueva
            "quick_replies": [{
                "content_type": "text",
                "title": "Casa",
                "payload": "SetAddress-Home"
            }, {
                "content_type": "text",
                "title": "Oficina",
                "payload": "SetAddress-Office"
            }, {
                "content_type": "text",
                "title": "Nueva dirección",
                "payload": "NewAddress"
            }]
        }
    };

    bot.sendTypingOff(recipientId);
    bot.callSendAPI(messageData);
}

function setAddress(recipientId, args) {
    console.log('set address for purchase: ' + args);
    bot.sendTypingOn(recipientId);
    renderAddressConfirmation(recipientId);
}

function renderAddressConfirmation(recipientId) {
    bot.sendTypingOff(recipientId);
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            "text": "Perfecto, ya guardé tu dirección para próximos pedidos"
        }
    };
    bot.callSendAPI(messageData);

    sendCategories(recipientId, 0);
}

function sendCategories(recipientId, catIdx) {
    bot.sendTypingOn(recipientId);
    catIdx = parseInt(catIdx);

    if (catIdx == 0) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Nuestros productos",
                            "subtitle": "A continuación te presentamos las categorías de productos disponibles."
                        }]
                    }
                }
            }
        };
        bot.callSendAPI(messageData);
    }

    _node2.default.Cloud.run('getProducts', { businessId: BUSINESS_ID }).then(function (result) {
        var elements = splitCategories(result.categories, catIdx);
        var idx = Object.keys(result.categories).length;
        var buttons = [];
        var catIni = (catIdx + 1) * bot.limit;
        var catFin = idx > catIni + bot.limit ? catIni + bot.limit : idx;

        console.log('length: ' + idx);
        console.log('catIni: ' + catIni);
        console.log('catFin: ' + catFin);
        console.log('limit: ' + (catIdx + 1) * bot.limit);

        if (idx > (catIdx + 1) * bot.limit) {
            buttons.push({
                type: "postback",
                title: "Categorias " + (catIni + 1) + "-" + catFin,
                payload: "SendCategories-" + (catIdx + 1)
            });

            elements.push({
                title: "Más categorias ",
                subtitle: "Categorias disponibles",
                buttons: buttons
            });
        }

        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: elements
                    }
                }
            }
        };

        bot.sendTypingOff(recipientId);
        bot.callSendAPI(messageData);
    }, function (error) {});
}

function splitCategories(categories, catIdx) {
    var idx = 0;
    var elements = [];

    categories.forEach(function (item) {
        //console.log(item.get('name'));
        if (item && item.get('name')) {
            //console.log(elements.length);
            if (idx >= catIdx * bot.limit && idx < (catIdx + 1) * bot.limit) {
                var image = item.get('image');
                var image_url = "http://pro.parse.inoutdelivery.com/parse/files/hSMaiK7EXqDqRVYyY2fjIp4lBweiZnjpEmhH4LpJ/2671158f9c1cb43cac1423101b6e451b_image.txt";
                if (image) {
                    image_url = image.url();
                }
                elements.push({
                    title: item.get('name'),
                    //subtitle: item.get('name'),
                    //item_url: "http://www.mycolombianrecipes.com/fruit-cocktail-salpicon-de-frutas",
                    image_url: image_url,
                    buttons: [{
                        type: "postback",
                        title: item.get('name'),
                        payload: "SendProducts-" + item.id + "-" + catIdx
                    }]
                });
            }
            idx = idx + 1;
        }
    });
    return elements;
}

function sendProducts(recipientId, category, proIdx) {
    bot.sendTypingOn(recipientId);
    proIdx = parseInt(proIdx);

    _node2.default.Cloud.run('getProducts', { businessId: BUSINESS_ID, category: category }).then(function (result) {

        var elements = splitProducts(result.products, proIdx);
        var idx = Object.keys(result.products).length;
        var buttons = [];
        var catIni = (proIdx + 1) * bot.limit;
        var catFin = idx > catIni + bot.limit ? catIni + bot.limit : idx;

        console.log('length: ' + idx);
        console.log('catIni: ' + catIni);
        console.log('catFin: ' + catFin);
        console.log('limit: ' + (proIdx + 1) * bot.limit);

        if (idx > (proIdx + 1) * bot.limit) {
            buttons.push({
                type: "postback",
                title: "Más productos " + (catIni + 1) + "-" + catFin,
                payload: "SendProducts-" + category + "-" + (proIdx + 1)
            });

            elements.push({
                title: "Más categorias ",
                subtitle: "Categorias disponibles",
                buttons: buttons
            });
        }

        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: elements
                    }
                }
            }
        };

        bot.sendTypingOff(recipientId);
        bot.callSendAPI(messageData);
    }, function (error) {});
}

function splitProducts(products, proIdx) {
    var idx = 0;
    var elements = [];

    products.forEach(function (item) {
        if (item && item.get('name')) {
            if (idx >= proIdx * bot.limit && idx < (proIdx + 1) * bot.limit) {
                var image = item.get('image');
                var image_url = "http://pro.parse.inoutdelivery.com/parse/files/hSMaiK7EXqDqRVYyY2fjIp4lBweiZnjpEmhH4LpJ/2671158f9c1cb43cac1423101b6e451b_image.txt";
                if (image) {
                    image_url = image.url();
                }
                elements.push({
                    title: item.get('name') + ": $" + item.get('priceDefault'),
                    subtitle: item.get('description'),
                    //item_url: "http://www.mycolombianrecipes.com/fruit-cocktail-salpicon-de-frutas",
                    image_url: image_url,
                    buttons: [{
                        type: "postback",
                        title: "Agregar",
                        payload: "AddProduct-" + item.id
                    }]
                });
            }
            idx = idx + 1;
        }
    });
    return elements;
}

function addProduct(recipientId, id) {
    console.log("Add product: " + id);
    console.log("Order.count: " + order.count());
    if (!order.get(id)) {
        order.set(id, 1);
    } else {
        order.set(id, order.get(id) + 1);
    }
}

function sendBillMessage(recipientId) {
    // Generate a random receipt ID as the API requires a unique ID
    bot.sendTypingOn(recipientId);

    var receiptId = "order" + Math.floor(Math.random() * 1000);
    var elements = [];
    var element = {};
    var total = 0;
    var orderLimit = order.count();
    var ind = 0;
    var image;
    var image_url;

    console.log(order);

    order.forEach(function (value, key) {
        var Product = _node2.default.Object.extend("Product");
        var product = new _node2.default.Query(Product);
        console.log(key);

        product.get(key, {
            success: function success(item) {
                image = item.get('image');
                image_url = "http://pro.parse.inoutdelivery.com/parse/files/hSMaiK7EXqDqRVYyY2fjIp4lBweiZnjpEmhH4LpJ/2671158f9c1cb43cac1423101b6e451b_image.txt";
                if (image) {
                    image_url = image.url();
                }

                element = {};
                element['title'] = item.get('name');
                element['subtitle'] = item.get('description');
                element['quantity'] = order.get(key);
                element['price'] = parseInt(item.get('priceDefault'));
                element['currency'] = "COP";
                element['image_url'] = image_url;

                elements.push(element);
                total += element['quantity'] * element['price'];

                ind++;

                if (ind == orderLimit) {

                    (0, _request2.default)({
                        uri: 'https://graph.facebook.com/v2.6/' + recipientId,
                        qs: { access_token: PAGE_ACCESS_TOKEN, fields: 'first_name,last_name,locale,timezone,gender' },
                        method: 'GET'

                    }, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var userData = JSON.parse(body);
                            console.log(userData);

                            var messageData = {
                                recipient: {
                                    id: recipientId
                                },
                                message: {
                                    attachment: {
                                        type: "template",
                                        payload: {
                                            template_type: "receipt",
                                            recipient_name: userData.first_name + " " + userData.last_name,
                                            order_number: receiptId,
                                            currency: "COP",
                                            payment_method: "Visa 1234",
                                            timestamp: Math.trunc(Date.now() / 1000).toString(),
                                            elements: elements,
                                            address: {
                                                street_1: "Carrera x con calle x",
                                                street_2: "",
                                                city: "Bucaramanga",
                                                postal_code: "680001",
                                                state: "SA",
                                                country: "CO"
                                            },
                                            summary: {
                                                subtotal: total,
                                                shipping_cost: 2000.00,
                                                total_tax: total * 0.16,
                                                total_cost: total * 1.16 + 2000.00
                                            }
                                            //adjustments: [{
                                            //  name: "New Customer Discount",
                                            //  amount: -1000
                                            //}, {
                                            //    name: "$1000 Off Coupon",
                                            //    amount: -1000
                                            //}]
                                        }
                                    }
                                }
                            };
                            order = new _hashmap2.default();
                            console.log("callSendAPI(messageData)");
                            bot.sendTypingOff(recipientId);
                            bot.callSendAPI(messageData);
                        }
                    });
                }
            },
            error: function error(_error) {
                alert("Error: " + _error.code + " " + _error.message);
            }
        });
    });
}

store.dispatch({ type: types.APP_LOADED });

/*
console.log('Exist FB.init: '+( typeof FB.init === 'function') );
console.log(FB.getLoginUrl({ scope: 'user_about_me' }));

 Parse.FacebookUtils.init({ // this line replaces FB.init({
 appId      : FACEBOOK_APP_ID, // Facebook App ID
 cookie     : true,  // enable cookies to allow Parse to access the session
 xfbml      : true,  // initialize Facebook social plugins on the page
 version    : 'v2.4' // point to the latest Facebook Graph API version
 });
 */

var order = new _hashmap2.default();

function renderMenuMessageWithFacebook(error, response, body) {
    /*
     new Parse.Query(ParseModels.Consumer).equalTo('user', user).first().then(consumer => {
     if (consumer) {
     request({
     uri: 'https://graph.facebook.com/v2.6/' + recipientId,
     qs: {access_token: PAGE_ACCESS_TOKEN, fields: 'first_name,last_name,locale,timezone,gender'},
     method: 'GET'
     }, renderMenuMessageWithFacebook);
     }
     }).fail(error => {
     console.log(error);
     })
     */

    if (!error && response.statusCode == 200) {
        var pathname = response.request.uri.pathname;
        var recipientId = pathname.split('/').pop();
        var userData = JSON.parse(body);
        var commerce = new _node2.default.Query(ParseModels.Customer);

        //user.equalTo('authData', {"facebook":        {"access_token":"EAAPK2ME0gLkBAE6HMBKLP2RfquPvCIyaXNuItGYRdBpJNArGCZC9UzITl9ZBB7EKnmuukylXS93yhHOZAUiHjPwGyNBmnb11VPB7kf0Km9o2Gm2hFSJhDmjpZA1bfZCITRQ45OCMVAIWSR3jHIjkg3cze6tSvZBQjKdGkalGA1V7E0npkZAcMPn51z2yLAPJVRzRpbTqNCTtNPIhxpBr7H2","expiration_date":"2016-10-02T15:16:42.000Z","id":"10210218101474882"}})

        commerce.contains('businessId', BUSINESS_ID);

        commerce.find().then(function (results) {
            var currentUser = _node2.default.User.current();
            var image_url = results[0].get('image').url();

            console.log('data');
            console.log(userData);
            console.log(recipientId);
            console.log(results);
            console.log(image_url);

            /*
             first_name: 'John',
             last_name: 'Garavito Suárez',
             locale: 'en_US',
             timezone: -5,
             gender: 'male' }
            * */

            var messageData = {
                recipient: {
                    id: recipientId
                },
                message: {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "generic",
                            //text: "Buenos dias, para conocer nuestros menus del dia, por favor escoja una opción:",
                            elements: [{
                                "title": "Hola " + userData.first_name + ", Bienvenido a OXXO. ",
                                "subtitle": "Aquí puedes pedir un domicilio, escribe o selecciona alguna de las opciones:",
                                "image_url": image_url,
                                "buttons": [{
                                    "type": "postback",
                                    "title": "Pedir a domicilio",
                                    "payload": "ListCategories-0"
                                }, {
                                    "type": "postback",
                                    "title": "Pedir para recoger",
                                    "payload": "ListCategories-0"
                                }, {
                                    "type": "postback",
                                    "title": "Servicio al cliente",
                                    "payload": "ListCategories-0"
                                }]
                            }]
                        }
                    }
                }
            };

            bot.sendTypingOff(recipientId);
            bot.callSendAPI(messageData);
        }, function (error) {
            console.log("Lookup failed");
        });
    } else {
        console.error(response.error);
    }
}

function renderAddressMenuMessageOld(recipientId) {
    var addresses = store.getState().addresses;

    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "text": "A cual dirección vas hacer tu pedido, puedes escoger entre tus direcciones almacenadas o registrar una nueva",
                    "buttons": [{
                        "type": "postback",
                        "title": "Address 1",
                        "payload": "USER_DEFINED_PAYLOAD"
                    }, {
                        "type": "postback",
                        "title": "Address 2",
                        "payload": "USER_DEFINED_PAYLOAD"
                    }]
                }
            }
        }
    };

    bot.sendTypingOff(recipientId);
    bot.callSendAPI(messageData);
}

//# sourceMappingURL=app-compiled.js.map