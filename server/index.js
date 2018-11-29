const { createServer } = require('http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { ApolloServer } = require('apollo-server-express');

const schema = require('./schema');

const app = express();

mongoose.connect('mongodb://oles:0password@ds239029.mlab.com:39029/graphql-loop');
mongoose.connection.once('open', () => console.log("Server was successfully connected to the database."))

app.use(cors());

const apolloServer = new ApolloServer({
	schema
});
const server = createServer(app);

apolloServer.applyMiddleware({ app, path: '/graphql' });
apolloServer.installSubscriptionHandlers(server);

server.listen(4000, () => console.log("Server is listening on port 4000!"));