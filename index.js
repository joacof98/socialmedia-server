//AS contiene express, otra forma de iniciar sv
const {ApolloServer} = require('apollo-server');
const mongoose = require('mongoose');
const {MONGOURI} = require('./config.js');

const PORT = process.env.PORT || 4000;

const resolvers = require('./queries/resolvers');
const typeDefs = require('./queries/typeDefs');

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: ({req}) => ({req}) //Toma el req body de peticiones y lo manda al contexto 
});

mongoose.connect(MONGOURI, {useNewUrlParser: true})
	.then(() => {
		console.log("connected to DB");
		server.listen({port: PORT});
	})
	.then(res => {
		console.log('Server running...');
	})
	.catch(err => {
		console.error(err);
	});
