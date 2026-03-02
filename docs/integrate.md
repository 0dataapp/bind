# Integrate

## Make apps

App development is much simpler with

- no backend infrastructure
- no hosting other people's data
- no per-user costs
- no account systems

Just read and write data with the remoteStorage.js library and your web apps get:

- Automatic syncronization
- Offline-first data
- Authentication
- Personal data stores
- Interoperable bridges


## Host

Hosting Bind is optional, but you might like to offer accounts for anyone who doesn't already have one. It's simple to host and can run anywhere that supports Node.js and persistant storage.

They can still connect their own sources so that you take no custody over their data, while still allowing people from other servers to bring their accounts to your web app.


## Other integrations

remoteStorage gives your Git repository a simple REST API that requires no special platform registration. Just use your OAuth token to make GET or PUT requests from any browser or server and changes will sync to all apps that use the data.
