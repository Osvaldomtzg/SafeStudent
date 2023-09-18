const helpers = {};

//SWEET ALERTS
const handlebars = require('handlebars');

// Helper personalizado para la igualdad estricta
handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});




// TIMEAGO
const { format, register } = require('timeago.js');

register('es_ES', (number, index, total_sec) => [
    ['justo ahora', 'ahora mismo'],
    ['hace %s segundos', 'en %s segundos'],
    ['hace 1 minuto', 'en 1 minuto'],
    ['hace %s minutos', 'en %s minutos'],
    ['hace 1 hora', 'en 1 hora'],
    ['hace %s horas', 'en %s horas'],
    ['hace 1 dia', 'en 1 dia'],
    ['hace %s dias', 'en %s dias'],
    ['hace 1 semana', 'en 1 semana'],
    ['hace %s semanas', 'en %s semanas'],
    ['1 mes', 'en 1 mes'],
    ['hace %s meses', 'en %s meses'],
    ['hace 1 año', 'en 1 año'],
    ['hace %s años', 'en %s años']
][index]);

helpers.timeago = (timestamp) => {
    return format(timestamp, 'es_ES');
};

//SMS

var querystring = require('querystring');
var https = require('https');

helpers.sendSMS = (tel, text, isApiKey=false) => {

  let login = 'lahr48390@gmail.com';
  passwd = 'rya72dmy';

  let loginKey = isApiKey ? 'apikey' : 'login';
  let passwordKey = isApiKey ? 'apisecret' : 'passwd';

  // Se contruye la cadena del post desde un objeto
  var post_data = querystring.stringify({
      'cmd' : 'sendsms',
      [loginKey]: login,
      [passwordKey]: passwd,
      'dest' : tel,
      'msg' : text
  });

  // Un objeto de opciones sobre donde se envia el post
  var post_options = {
      host: 'www.altiria.net',
      port: '8443',
      path: '/api/http',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data)
      }
  };

  // Se efectua la petición
  var post_req = https.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          //Es necesario procesar la respuesta y los posibles errores
          console.log('Response: ' + chunk);
      });
  });

  // post the data
  post_req.write(post_data);
  post_req.end();

};

//CREAR CARPETAS

const { mkdir } = require('fs/promises');
helpers.createDir = async function createDirectory(path) {
  try {
    await mkdir(path);
    console.log(`Created directory ${path}`);
  } catch (error) {
    console.error(`Got an error trying to create the directory: ${error.message}`);
  }
}

module.exports = helpers;