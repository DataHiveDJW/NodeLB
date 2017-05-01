const redis = require('redis');
const crypto = require('crypto');

const originServer = {};

originServer.checkSession = (sessionId, cb) => {
  originServer.client.get(sessionId, (err, reply) => {
    if (err) return cb(err);
    return cb(null, reply);
  });
};

originServer.setSession = (sessionId, cookieKey, cb) => {
  originServer.client.set(sessionId, cookieKey, (err, reply) => {
    if (err) return cb(err);
    return cb(null, reply);
  });
};

originServer.init = (options) => {
  originServer.client = redis.createClient(options.port, options.host);
  originServer.client.on('connect', () => {
    console.log('redis connected');
  });
  return originServer;
};

const cookieParse = (cookies, target = null) => {
  if (!cookies) return null;
  const cookieObj = {};
  let arr = cookies.split(';');
  arr = arr.map((value) => { return value.trim(' '); });
  // console.log(arr);
  let cookieSplit;
  for (let i = 0; i < arr.length; i += 1) {
    cookieSplit = arr[i].split('=');
    if (target === null) {
      cookieObj[cookieSplit[0]] = cookieSplit[1];
    } else if (cookieSplit[0] === target) return cookieSplit[1];
  }
  return target === null ? cookieObj : null;
};

originServer.verifySession = (req, cookieKey, cb) => {
  // console.log(cookieParse(req.headers.cookie));
  const key = cookieParse(req.headers.cookie, cookieKey);
  if (key) {
    originServer.checkSession(key, (err, reply) => {
      if (reply === cookieKey) return cb(true);
      return cb(false);
    });
  } else return cb(false);
};

const hash = (string) => {
  const generatedHash = crypto.createHash('sha256')
    .update(string, 'utf8')
    .digest('hex');
  return generatedHash;
};

originServer.authenticate = (req, res, cookieKey, uniqueId, cb) => {
  const key = hash(uniqueId);
  originServer.setSession(key, cookieKey, (err, reply) => {
    // console.log(req.headers);
    res.writeHead(200, {
      'Set-Cookie': cookieKey.concat('=').concat(key),
      'Content-Type': 'application/JSON',
    });
    cb(err, reply);
  });
};

module.exports = originServer.init;



// Main objects/methods for docs:


// Initialization:
// -----------
// const originServer = require('./../serverLb/library/originServer');
// const options = {
//   host: '127.0.0.1',
//   port: 6379,
// };
// const rs = originServer(options);
// -----------



// Methods:
// ----------- 
// rs.authenticate(req, res, cookieKey, uniqueId, cb)
// rs.verifySession(req, cookieKey, cb)
// ----------- 



