# Reverse Proxy Setup

Include our library using:

const lb = require(‘loadBalancer’);

## Options  —

Options is a collection of the addresses to the target servers, consisting of their hostnames and ports.
In order to create the reverse proxy object, it will need this input upon deployment.

## Example:

const options = [];
for (let i = 2; i < process.argv.length; i += 2) {
 options.push({
   hostname: process.argv[i],
   port: process.argv[i + 1],
 });
}

## lb.deploy ( string, array( options ) — 

First parameter: is a configuration argument for the reverse proxy server which in this case must be: ’rp’
Second parameter: will be the options collection created previously created in your ‘rp.js’ file

lb.deploy triggers the creation of the reverse proxy object.
‘Rp’ is the only valid string input for the first parameter to trigger your reverse proxy setup.

lb.deploy has three specific strings that can be used in this library.
To see the other use cases for lb.deploy in this library -- click here.

## Example:
const rp = lb.deploy(‘rp’, options);

rp.addOptions ( options ) —

If further target server options are added, you can use rp.addOptions to update your existing options collection. 
This method will not overwrite your previous collection.

## Example:

const newOptions = [
 { hostname: '127.0.0.1', port: '3000' },
 { hostname: '127.0.65.120', port: '4000' }
]

## rp.addOptions(newOptions);

## rp.setRoutes ( nestedArray ) —

nestedArray is stored in the reverse proxy server as an object of what routes in your application you would like cached upon first request.

Convention implies that you will declare this nestedArray as ‘routes’.
Each subarray of routes takes two strings: ‘method’ & ‘url’:

const routes = [['method', 'URL'], ['method', 'URL']];

Method (string): are usual type of requests (e.g. ‘GET’, ‘POST’, ‘DELETE’, ‘PUT’);
URL (string): will be the portion of your specific route (e.g. ‘/users’, ‘/puppies’);

rp.setRoutes can be called multiple times and will concat the new routes to the routes cache

## Example:

const routes = [['GET', '/puppies'], ['POST', '/login']];

## rp.init ( req , res ) —

**This method sends/ends the response to the client**

This method initializes the reverse proxy.
The reverse proxy server will cache static files (.HTML, .CSS., .JS) & routes from rp.setRoutes method.

This method does the following:
Checks cache for existence of incoming ‘req’
Accepts ‘req’ and pipes it to child servers if it does not exist in cache
Receives ‘res’ back from child servers, appends cookie headers to response, and then pipes/ends response back to browser

## Example:

const server = http.createServer((bReq, bRes) => {
 rp.init(bReq, bRes);
}).listen(1337);
console.log('Server running at 127.0.0.1:1337');

## rp.healthCheck ( interval[optional] ) —

Accepts an interval parameter in ms (milliseconds)

rp.healthCheck sends pings from the reverse proxy to all target servers with a test requests to review target server health. 
Uses internal boolean logic to toggle target servers as active or inactive based on results of pings.

If the interval parameter is NULL, rp.healthCheck can be called by user discretion.
If interval has a value, rp.healthCheck will run on that given interval value (e.g. every 5 minutes).

rp.healthCheck is an integral method in this library ensuring requests make it to target servers that can process them.

## Example:

// interval = 10000 milliseconds
rp.healthCheck(10000);

// interval is null
rp.healthCheck();


## rp.clearCache ( interval[optional] ) —

Accepts an interval parameter in ms (milliseconds).

rp.clearCache clears the internal cache of the reverse proxy server.

If the interval parameter is NULL, rp.clearCache can be called by user discretion.
If interval has a value, rp.clearCache will run on that given interval value (e.g. every 5 minutes).

rp.clearCache is an integral method in this library to aid in preventing the cache from becoming so full of data that it begins to bog down the performance proxy server. 

It is recommended to utilize this method in some capacity in your application.


## Example:

// interval = 10000 milliseconds
rp.clearCache(10000);

// interval is null
rp.clearCache();


# Redis Sessions Setup

const options = {
  host: '127.0.0.1', // —> string hostname or IP address
  port: 6379,        // —> integer port number
};

## const lb = require(‘loadBalancer’);
## const rs = lb.deploy(‘redis’, options); 

A Redis server must be setup as a prerequisite to utilizing the Redis Sessions object (see instructions for setting up Redis server). The deploy method requires the Redis server address in the options argument (host/ip and port) and creates/returns the ‘rs’ (Redis sessions) object.


## rs.authenticate(req, res, cookieKey, uniqueId, cb) // Authentication: 
Encrypts and saves session cookie in Redis
Sets cookie in header (DOES NOT END RESPONSE)

Req (object): client request object
Res (object): client response object
cookieKey (string): name of cookie as seen in browser
uniqueId (string): uniqueId per cookieKey (e.g. username)
Cb (function): callback function executed after redis save - includes reds error and reply messages (e.g. (err, reply) => {. . .)

## rs.verifySession(req, cookieKey, cb) // VerifySession: 
Parses cookies in request header
Validates session cookies against central redis store
Returns true or false based on cookie validity

Req: client request object
cookieKey: name of cookie as seen in browser (targets this cookie name exclusively when validating)
Cb: callback function with result argument true or false  (e.g. (sessionVerified) => {. . .)

## Threads Setup
Since node is a single-threaded application natively, we provide the option to use all the threads on your Target Servers using the cluster module in Node.  In this way, the servers will be able to sustain a much higher load than when node is running by itself.

To make this more relative, say your Target Server is able to handle 100 requests before it breaks.  On a Node server running with 4 threads, it will be able to handle about 200 requests before the server breaks.  Because of its significant impact in balancing-load, we made this an option in our library.  The threads will balance requests from the reverse proxy server through the cluster module’s round-robin algorithm (on all platforms except Windows.  See more details at https://nodejs.org/api/cluster.html#cluster_how_it_works). 

A simple set up to getting threads started

## const threads = lb.deploy(‘threads’);
## threads('www.example.org', 3000);
## threads(host, port)

host: string containing the host url
port: number indicating at what port will the thread respond to (e.g. localhost:3000)

