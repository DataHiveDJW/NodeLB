const threads = require('./clusterSwitch');
const rp = require('./loadBalancer');
const redis = require('./originServer');
const ws = require('./wsproxy');
const wspool = require('./wsproxypool');

const lb = {};

const lib = {
  threads,
  rp,
  redis,
  ws,
  wspool,
};

lb.deploy = (featureLib, options, cb) => {
  return lib[featureLib](options, cb);
};

module.exports = lb;
