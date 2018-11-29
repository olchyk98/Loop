const {
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLSchema,
	GraphQLID,
	GraphQLString,
	GraphQLInt
} = require('graphql');

const RootQuery = new GraphQLObjectType({
	name: "RootQuery",
	fields: {
		hello: {
			type: GraphQLString,
			resolve: () => "hi!"
		}
	}
});

const RootMutation = new GraphQLObjectType({
	name: "RootMutation",
	fields: {
		mut: {
			type: GraphQLString,
			resolve: () => "asdj!"
		}
	}
});

module.exports = new GraphQLSchema({
	query: RootQuery,
	mutation: RootMutation
});