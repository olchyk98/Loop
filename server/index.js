const { createServer } = require('http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { ApolloServer } = require('apollo-server-express');

const schema = require('./schema');

const app = express();

mongoose.connect('mongodb://oles:0password@ds113935.mlab.com:13935/dev-tunaconnect', {
	useNewUrlParser: true
});
mongoose.connection.once('open', () => console.log("Server was successfully connected to the database."))

app.use(cors());
app.use('/files', express.static('./files'));

const apolloServer = new ApolloServer({
	schema
});
const server = createServer(app);

apolloServer.applyMiddleware({ app, path: '/graphql' });
apolloServer.installSubscriptionHandlers(server);

server.listen(4000, () => console.log("Server is listening on port 4000!"));