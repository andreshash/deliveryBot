'use strict';var _config=require('config');var _config2=_interopRequireDefault(_config);var _node=require('parse/node');var _node2=_interopRequireDefault(_node);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}var PARSE_APP_ID=process.env.PARSE_APP_ID?process.env.PARSE_APP_ID:_config2.default.get('PARSE_APP_ID');var PARSE_SERVER_URL=process.env.PARSE_SERVER_URL?process.env.PARSE_SERVER_URL:_config2.default.get('PARSE_SERVER_URL');_node2.default.initialize(PARSE_APP_ID);_node2.default.serverURL=PARSE_SERVER_URL;global.Parse=_node2.default;module.exports={Parse:_node2.default};