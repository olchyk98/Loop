const { createServer } = require('http');
const express = require('express');
const mongoose = require('mongoose');
const session = require('cookie-session');
const { ApolloServer } = require('apollo-server-express');

const schema = require('./schema');

const app = express();

mongoose.connect('mongodb://oles:0password@ds113935.mlab.com:13935/dev-tunaconnect', {
	useNewUrlParser: true
});
mongoose.connection.once('open', () => console.log("Server was successfully connected to the database."))

app.use(new session({
	age: 7 * 24 * 60 * 60 * 1000,
	name: 'session',
	keys: [
		'h7BAPXng74VSY6fdEv7M',
		'VSY6fdEv7Mh7BAPXng74',
		'LMdCxBC4HNp6dhb4EK8Y',
		'bwtXAutLbPUjQ4PNfn48',
		'V8LsggghKY9Tr7a9pN9t'
	]
}))
app.use('/files', express.static('./files'));

const apolloServer = new ApolloServer({
	schema
});
const server = createServer(app);

apolloServer.applyMiddleware({
	app,
	path: '/graphql',
	engine: false,
	context: ({ req }) => ({ req }),
	cors: {
		origin: 'http://localhost:3000',
		credentials: true
	}
});
apolloServer.installSubscriptionHandlers(server);

server.listen(4000, () => console.log("Server is listening on port 4000!"));