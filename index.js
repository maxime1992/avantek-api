require('babel-core/register');

var Avantek = require('./src/avantek.js').Avantek;

var avantek = new Avantek('YOUR-IP', 14580, 'YOUR-SID');
