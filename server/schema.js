const {
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLSchema,
	GraphQLList,
	GraphQLID,
	GraphQLString,
	GraphQLInt
} = require('graphql');
const {
	GraphQLUpload
} = require('apollo-server');

const fileSystem = require('fs');

const { User } = require('./models');
const settings = require('./settings');

function validateAccount(_id, authToken) {
	return User.find({
		_id,
		authTokens: {
			$in: [authToken]
		}
	});
}

function generateNoise(l = 256) {
	let a = "",
		b = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'; // lib

	for(let ma = 0; ma < l; ma++) {
		a += b[Math.floor(Math.random() * b.length)];
	}

	return a;
}

let getExtension = a => a.match(/[^\\]*\.(\w+)$/)[1];

const UserType = new GraphQLObjectType({
	name: "User",
	fields: () => ({
		id: { type: GraphQLID },
		login: { type: GraphQLString },
		password: { type: GraphQLString },
		name: { type: GraphQLString },
		avatar: { type: GraphQLString },
		description: { type: GraphQLString },
		waitingFriends: { type: new GraphQLList(GraphQLID) }, // USERS that are WAITING for this USER
		friends: { type: new GraphQLList(GraphQLID) },
		authTokens: { type: new GraphQLList(GraphQLString) },
		lastAuthToken: {
			type: GraphQLString,
			resolve: ({ authTokens }) => (authTokens.slice(-1) && authTokens.slice(-1)[0]) || ""
		}
	})
});

const RootQuery = new GraphQLObjectType({
	name: "RootQuery",
	fields: {
		users: {
			type: new GraphQLList(UserType),
			resolve: () => User.find({})
		}
	}
});

const RootMutation = new GraphQLObjectType({
	name: "RootMutation",
	fields: {
		registerUser: {
			type: UserType,
			args: {
				login: { type: new GraphQLNonNull(GraphQLString) },
				password: { type: new GraphQLNonNull(GraphQLString) },
				name: { type: new GraphQLNonNull(GraphQLString) },
				avatar: { type: new GraphQLNonNull(GraphQLUpload) }
			},
			async resolve(_, { login, password, name, avatar }) {
				{
					let a = User.find({ login });
					if(a) return null;
				}

				let token = generateNoise();

				// receive image
				if(avatar) {					
					let { filename, stream } = await avatar;
					var avatarPath = `/${ settings.files.avatars }/${ generateNoise(128) }.${ getExtension(filename) }`;
					console.log(avatarPath);

					stream.pipe(fileSystem.createWriteStream('.' + settings));
				}

				let user = await (new User({
					login, password, name,
					avatar: avatarPath || "",
					description: "",
					waitingFriends: [],
					friends: [],
					authTokens: [token]
				})).save();

				return user;
			}
		},
		loginUser: {
			type: UserType,
			args: {
				login: { type: new GraphQLNonNull(GraphQLString) },
				password: { type: new GraphQLNonNull(GraphQLString) }
			},
			resolve(_, { login, password }) {
				return User.findOneAndUpdate({ login, password }, {
					$push: {
						authTokens: generateNoise() 
					}
				}, (__, a) => a);
			}
		}
	}
});

module.exports = new GraphQLSchema({
	query: RootQuery,
	mutation: RootMutation
});