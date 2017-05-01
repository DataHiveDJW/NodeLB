const cluster = require('cluster');
// const mongooseSaver = require('../../controllers/routes.js');

const clusterSwitch = {};

clusterSwitch.init = (server, port) => {
  if (cluster.isMaster) {
    console.log('cluster is master');
    const numWorkers = require('os').cpus().length;
    console.log('Master cluster setting up ' + numWorkers + ' workers...');
    // creates workers for threads based on threads
    for (let i = 0; i < numWorkers; i += 1) {
      cluster.fork();
    }
    // let the user know the id of the thread worker
    cluster.on('online', (worker) => {
      console.log('Worker ' + worker.process.pid + ' is online');
      // mongooseSaver.save(worker.process.pid);
    });

    // when a worker dies executing code, create another
    cluster.on('exit', (worker, code, signal) => {
      console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
      console.log('Starting a new worker');
      cluster.fork();
    });
  } else {
    server.listen(port); // ex ec2-52-53-200-5.us-west-1.compute.amazonaws.com
    console.log('Server running at port ' + port);
  }
};

module.exports = () => {
  return clusterSwitch.init;
};
