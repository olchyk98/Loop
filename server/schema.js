const {
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLSchema,
	GraphQLList,
	GraphQLID,
	GraphQLString,
	GraphQLBoolean,
	GraphQLInt
} = require('graphql');
const {
	GraphQLUpload
} = require('apollo-server');

const fileSystem = require('fs');

const {
	User,
	Post,
	Image,
	Comment
} = require('./models');

const settings = require('./settings');

function validateAccount(_id, authToken) {
	return User.findOne({
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

let getExtension = a => a.match(/[^\\]*\.(\w+)$/)[1],
	str = a => a.toString();

const UserType = new GraphQLObjectType({
	name: "User",
	fields: () => ({
		id: { type: GraphQLID },
		login: { type: GraphQLString },
		password: { type: GraphQLString },
		name: { type: GraphQLString },
		avatar: { type: GraphQLString },
		description: { type: GraphQLString },
		cover: { type: GraphQLString },
		gallery: {
			type: new GraphQLList(ImageType),
			resolve: ({ id }) => Image.find({
				creatorID: id,
				targetType: {
					$ne: "COMMENT_TYPE"
				}
			}).sort({ time: -1 })
		},
		galleryImages: {
			type: GraphQLInt,
			resolve: ({ id }) => Image.countDocuments({
				creatorID: id,
				targetType: {
					$ne: "COMMENT_TYPE"
				}
			})
		},
		posts: {
			type: new GraphQLList(PostType),
			resolve: ({ id }) => Post.find({ creatorID: id }).sort({ time: -1 })
		},
		postsInt: {
			type: GraphQLInt,
			resolve: ({ id }) => Post.countDocuments({ creatorID: id }).sort({ time: -1 })
		},
		waitingFriends: { // USERS that are WAITING for this USER
			type: new GraphQLList(UserType),
			resolve: ({ waitingFriends }) => User.find({
				_id: {
					$in: waitingFriends
				}
			})
		},
		friends: {
			type: new GraphQLList(UserType),
			resolve: ({ id, friends }) => User.find({
				$or: [
					{
						_id: {
							$in: friends
						},
					},
					{

						friends: {
							$in: [id]
						}
					}
				]
			})
		},
		mutualFriends: {
			type: new GraphQLList(UserType),
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) }
			},
			resolve({ id }, { id: _id }) {
				if(str(id) === str(_id)) return [];

				return User.find({
					$and: [
						{
							friends: {
								$in: [id]
							}
						},
						{
							friends: {
								$in: [_id]
							}
						}
					]
					
				});
			}
		},
		mutualFriendsInt: {
			type: GraphQLInt,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) }
			},
			async resolve({ id }, { id: _id }) {
				if(str(id) === str(_id)) return 0;

				let a = await User.countDocuments({
					$and: [
						{
							friends: {
								$in: [id]
							}
						},
						{
							friends: {
								$in: [_id]
							}
						}
					]
				});

				return (Number.isInteger(a)) ? a : 0;
			}
		},
		authTokens: { type: new GraphQLList(GraphQLString) },
		subscribers: {
			type: new GraphQLList(UserType),
			resolve: ({ subscribers }) => User.find({
				_id: {
					$in: subscribers
				}
			})
		},
		lastAuthToken: {
			type: GraphQLString,
			resolve: ({ authTokens }) => (authTokens.slice(-1) && authTokens.slice(-1)[0]) || ""
		}
	})
});

const PostType = new GraphQLObjectType({
	name: "PostType",
	fields: () => ({
		id: { type: GraphQLID },
		creatorID: { type: GraphQLID },
		content: { type: GraphQLString },
		time: { type: GraphQLString },
		likes: { type: new GraphQLList(GraphQLID) },
		likesInt: {
			type: GraphQLInt,
			resolve: ({ likes }) => likes.length
		},
		isLiked: {
			type: GraphQLBoolean,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) }
			},
			resolve: ({ likes }, { id }) => likes.includes(str(id))
		},
		images: {
			type: new GraphQLList(ImageType),
			resolve: ({ id }) => Image.find({ postID: id })
		},
		creator: {
			type: UserType,
			resolve: ({ creatorID }) => User.findById(creatorID)
		},
		comments: {
			type: new GraphQLList(CommentType),
			resolve: ({ id }) => Comment.find({ postID: id })
		},
		commentsInt: {
			type: GraphQLInt,
			resolve: ({ id }) => Comment.countDocuments({ postID: id })
		}
	})
});

const ImageType = new GraphQLObjectType({
	name: "ImageType",
	fields: () => ({
		id: { type: GraphQLID },
		creatorID: { type: GraphQLID },
		postID: { type: GraphQLString },
		url: { type: GraphQLString },
		time: { type: GraphQLString },
		targetType: { type: GraphQLString },
		likes: { type: new GraphQLList(GraphQLID) },
		isLiked: {
			type: GraphQLBoolean,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) }
			},
			resolve: ({ likes }, { id }) => likes.includes(id)
		},
		likesInt: {
			type: GraphQLInt,
			resolve: ({ likes }) => likes.length
		},
		comments: {
			type: new GraphQLList(CommentType),
			resolve: ({ id }) => Comment.find({ postID: id })
		},
		commentsInt: {
			type: GraphQLInt,
			resolve: ({ id }) => Comment.countDocuments({ postID: id })
		},
		creator: {
			type: UserType,
			resolve: ({ creatorID }) => User.findById(creatorID)
		}
	})
});

const CommentType = new GraphQLObjectType({
	name: "CommentType",
	fields: () => ({
		id: { type: GraphQLID },
		creatorID: { type: GraphQLID },
		postID: { type: GraphQLID },
		content: { type: GraphQLString },
		time: { type: GraphQLString },
		likes: { type: new GraphQLList(GraphQLID) },
		likesInt: {
			type: GraphQLInt,
			resolve: ({ likes }) => likes.length
		},
		isLiked: {
			type: GraphQLBoolean,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) }
			},
			resolve: ({ likes }, { id }) => likes.includes(id)
		},
		comments: {
			type: new GraphQLList(CommentType),
			resolve: ({ id }) => Commnet.find({ postID: id })
		},
		creator: {
			type: UserType,
			resolve: ({ creatorID }) => User.findById(creatorID)
		},
		image: {
			type: ImageType,
			async resolve({ id }) {
				let a = await Image.findOne({ postID: id });

				return a || null;
			}
		}
	})
});

const RootQuery = new GraphQLObjectType({
	name: "RootQuery",
	fields: {
		users: {
			type: new GraphQLList(UserType),
			resolve: () => User.find({})
		},
		user: {
			type: UserType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				authToken: { type: new GraphQLNonNull(GraphQLString) },
				targetID: { type: GraphQLString }
			},
			async resolve(_, { id, authToken, targetID }) {
				let a = await validateAccount(id, authToken);
				if(!a) return null;

				return (targetID) ? User.findById(targetID) : a;
			}
		},
		loginExists: {
			type: GraphQLBoolean,
			args: {
				login: { type: new GraphQLNonNull(GraphQLString) }
			},
			resolve: async (_, { login }) => !(await User.findOne({ login }))
		},
		posts: {
			type: new GraphQLList(PostType),
			resolve: () => Post.find({})
		},
		image: {
			type: ImageType,
			args: {
				targetID: { type: new GraphQLNonNull(GraphQLID) }
			},
			resolve: (_, { targetID }) => Image.findById(targetID)
		},
		images: {
			type: new GraphQLList(ImageType),
			resolve: () => Image.find({}).sort({ time: -1 })
		},
		getFeed: {
			type: new GraphQLList(PostType),
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				authToken: { type: new GraphQLNonNull(GraphQLString) }
			},
			async resolve(_, { id, authToken }) {
				let a = await validateAccount(id, authToken);
				if(!a) return null;

				return Post.find({
					$or: [
						{
							creatorID: {
								$in: a.subscribers
							}
						},
						{ creatorID: id }
					]
				}).sort({ time: -1 });
			}
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
					let a = await User.findOne({ login });
					if(a) return null;
				}

				let token = generateNoise();

				// receive image
				if(avatar) {					
					let { filename, stream } = await avatar;
					var avatarPath = `${ settings.files.avatars }/${ generateNoise(128) }.${ getExtension(filename) }`

					stream.pipe(fileSystem.createWriteStream('.' + settings));
				}

				let user = await (new User({
					login, password, name,
					avatar: avatarPath || settings.default.avatar,
					description: "",
					waitingFriends: [],
					friends: [],
					cover: settings.default.cover,
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
		},
		publishPost: {
			type: PostType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				authToken: { type: new GraphQLNonNull(GraphQLString) },
				content: { type: GraphQLString },
				images: { type: new GraphQLList(new GraphQLNonNull(GraphQLUpload)) }
			},
			async resolve(_, { id, authToken, content, images }) {
				if(!content && (!images || !images.length)) return null;
				let a = await validateAccount(id, authToken);
				if(!a) return null;

				// Publish
				let post = await (
					new Post({
						creatorID: id,
						content,
						time: new Date,
						likes: []
					})
				).save();

				if(images && images.length) {
					post.images = [];

					await (new Promise(resolve => {
						images.forEach(async (io, index, arr) => {
							let { stream, filename } = await io;

							let link = `${ settings.files.images }/${ generateNoise(128) }.${ getExtension(filename) }`;
							stream.pipe(fileSystem.createWriteStream('.' + link));

							let b = await (
								new Image({
									creatorID: id,
									postID: post._id,
									url: link,
									time: new Date,
									likes: [],
									targetType: "POST_TYPE"
								})
							).save();
							post.images.push(b);
							if(index === arr.length - 1) resolve(true);
						});
					}));
				}

				return post;
			}
		},
		commentItem: {
			type: CommentType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				authToken: { type: new GraphQLNonNull(GraphQLString) },
				targetID: { type: new GraphQLNonNull(GraphQLID) },
				content: { type: GraphQLString },
				image: { type: GraphQLUpload }
			},
			async resolve(_, { id, authToken, targetID, content, image }) {
				// Global validation
				if(!content && !image) return null;
				let a = await validateAccount(id, authToken);
				if(!a) return null;

				// Target validation
				let inTarget = false;
				{
					let b = [
						"Post",
						"Comment",
						"Image"
					];

					for(let io of b) {
						let c = eval(io);
						// if(!c) continue;
						let d = await c.findById(targetID);

						if(d) {
							inTarget = true;
							break;
						}
					}
				}
				if(!inTarget) return null;

				// Publish comment
				const comment = await (
					new Comment({
						creatorID: id,
						postID: targetID,
						content,
						time: new Date,
						likes: []
					})
				).save();

				// Receive image
				if(image) {
					let { stream, filename } = await image;

					let link = `${ settings.files.images }/${ generateNoise(128) }.${ getExtension(filename) }`;
					stream.pipe(fileSystem.createWriteStream('.' + link));

					await (new Image({
						creatorID: id,
						postID: comment._id,
						url: link,
						time: new Date,
						likes: [],
						targetType: "COMMENT_TYPE"
					})).save();
				}

				return comment;
			}
		},
		likePost: {
			type: PostType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				authToken: { type: new GraphQLNonNull(GraphQLString) },
				targetID: { type: new GraphQLNonNull(GraphQLID) }
			},
			async resolve(_, { id, authToken, targetID }) {
				let a = await validateAccount(id, authToken);
				if(!a || !targetID) return null;

				let b = await Post.findById(targetID);
				if(!b) return null;

				let c = !b.likes.includes(id);

				await b.updateOne({
					[ (c) ? '$addToSet': '$pull' ]: {
						likes: id
					}
				});

				if(c) {
					b.likes.push(id)
				} else {
					b.likes.splice(b.likes.findIndex(io => str(io) === str(id)), 1);
				}

				return b;
			}
		},
		likeComment: {
			type: CommentType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				authToken: { type: new GraphQLNonNull(GraphQLString) },
				targetID: { type: new GraphQLNonNull(GraphQLID) }
			},
			async resolve(_, { id, authToken, targetID }) {
				let a = await validateAccount(id, authToken);
				if(!a || !targetID) return null;

				let b = await Comment.findById(targetID);
				if(!b) return null;

				let c = !b.likes.includes(id);

				await b.updateOne({
					[ (c) ? '$addToSet': '$pull' ]: {
						likes: id
					}
				});

				if(c) {
					b.likes.push(id);
				} else {
					b.likes.splice(b.likes.findIndex(io => str(io) === str(id)), 1);
				}

				return b;
			}
		},
		likeImage: {
			type: ImageType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				authToken: { type: new GraphQLNonNull(GraphQLString) },
				targetID: { type: new GraphQLNonNull(GraphQLID) }
			},
			async resolve(_, { id, authToken, targetID }) {
				let a = await validateAccount(id, authToken);
				if(!a) return null;

				let b = await Image.findById(targetID);
				if(!b) return null;

				let c = !b.likes.includes(id);

				await b.updateOne({
					[ (c) ? '$addToSet': '$pull' ]: {
						likes: id
					}
				});

				if(c) {
					b.likes.push(id);
				} else {
					b.likes.splice(b.likes.findIndex(io => str(io) === str(id)), 1);
				}

				return b;
			}
		},
		setUserAvatar: {
			type: UserType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				authToken: { type: new GraphQLNonNull(GraphQLString) },
				avatar: { type: new GraphQLNonNull(GraphQLUpload) }
			},
			async resolve(_, { id, authToken, avatar }) {
				// Receive image
				let { stream, filename } = await avatar;

				let link = `${ settings.files.images }/${ generateNoise(128) }.${ getExtension(filename) }`;
				stream.pipe(fileSystem.createWriteStream('.' + link));

				// Submit
				return User.findOneAndUpdate({
					_id: id,
					authTokens: {
						$in: [authToken]
					}
				}, {
					avatar: link
				}, (_, a) => a);
			}
		},
		setUserCover: {
			type: UserType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				authToken: { type: new GraphQLNonNull(GraphQLString) },
				cover: { type: new GraphQLNonNull(GraphQLUpload) }
			},
			async resolve(_, { id, authToken, cover }) {
				// Receive image
				let { stream, filename } = await cover;

				let link = `${ settings.files.images }/${ generateNoise(128) }.${ getExtension(filename) }`;
				stream.pipe(fileSystem.createWriteStream('.' + link));

				// Submit
				return User.findOneAndUpdate({
					_id: id,
					authTokens: {
						$in: [authToken]
					}
				}, {
					cover: link
				}, (_, a) => a);
			}
		},
		uploadImage: {
			type: ImageType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				authToken: { type: new GraphQLNonNull(GraphQLString) },
				avatar: { type: new GraphQLNonNull(GraphQLUpload) }
			},
			async resolve(_, { id, authToken, avatar }) {
				let a = await validateAccount(id, authToken);
				if(!a) return null;

				let { stream, filename } = await avatar;
				let link = `${ settings.files.images }/${ generateNoise(128) }.${ getExtension(filename) }`;
				stream.pipe(fileSystem.createWriteStream('.' + link));

				let b = (
					new Image({
						creatorID: a._id,
						postID: null,
						url: link,
						time: new Date,
						likes: [],
						targetType: "VOID_TYPE"
					})
				).save();

				return b;
			}
		},
		sendFriendRequest: {
			type: UserType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				authToken: { type: new GraphQLNonNull(GraphQLString) },
				targetID: { type: new GraphQLNonNull(GraphQLID) }
			},
			async resolve(_, { id, authToken, targetID }) {
				let a = await validateAccount(id, authToken);
				if(!a) return null;

				let b = await User.findById(targetID);
				if(!b) return null;

				if(a.friends.includes(str(targetID)) || b.friends.includes(str(id))) return null;

				await b.updateOne({
					$addToSet: {
						waitingFriends: str(id)
					}
				});

				if(!b.waitingFriends.includes(id)) {
					b.waitingFriends.push(str(id));
				}

				return b;
			}
		},
		acceptFriendRequest: {
			type: UserType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				authToken: { type: new GraphQLNonNull(GraphQLString) },
				targetID: { type: new GraphQLNonNull(GraphQLID) }
			},
			async resolve(_, { id, authToken, targetID }) {
				let a = await validateAccount(id, authToken);
				if(!a || !a.waitingFriends.includes(str(targetID))) return;

				await a.updateOne({
					$pull: {
						waitingFriends: str(targetID)
					},
					$addToSet: {
						friends: str(targetID)
					}
				});

				let b = a.waitingFriends;
				b.splice(b.findIndex(io => str(io) === str(targetID)), 1);
				if(!b.includes(str(targetID))) {
					b.push(str(targetID));
				}

				return a;
			}
		}
	}
});

module.exports = new GraphQLSchema({
	query: RootQuery,
	mutation: RootMutation
});