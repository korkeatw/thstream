#Twitter Thai Stream V1.0.0

This application show sample set of twitter messages in Thai language.


##Development tools

- Node.js
- Socket.io

##Configurations

###Twitter API
You have to edit `consumer_key`, `consumer_secret`, `access_token` and `access_token_secret` in **server.js** file. About line 10, you can replace xxx with your own key and token.

```
var tw = new twit({
      consumer_key : 'xxxxx' 
    , consumer_secret : 'xxxxx'
    , access_token : 'xxxxx'
    , access_token_secret : 'xxxxx'
})
```

All of key and token you will obtain when create your own Twitter application in [Twitter developers](https://dev.twitter.com) 

###Host & Port
Specific application host and port, edit `self.ipaddress` and `self.port`


##Running

You have to install dependencies modules with following commands
```
cd $PATH/$TO/thstream
npm install
```
And then, running the application
```
node server.js
```

In web browser, try this url `http://localhost:3000`


##Demo
I deployed this application on [OpenShift](http://openshift.com) link of the application now [**here**](http://thstream-khasathan.rhcloud.com)


##License
MIT
