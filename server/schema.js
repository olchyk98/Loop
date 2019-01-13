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
	GraphQLUpload,
	PubSub,
	withFilter
} = require('apollo-server');

const pubsub = new PubSub();

const fileSystem = require('fs');

const {
	User,
	Post,
	Image,
	Comment,
	Conversation,
	Message,
	Note
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
		waitingFriendsInt: {
			type: GraphQLInt,
			resolve: ({ waitingFriends }) => waitingFriends.length
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
		friendsInt: {
			type: GraphQLInt,
			async resolve({ id, friends }) {
				let a = await User.countDocuments({
					friends: {
						$in: [id]
					}
				});

				return a + friends.length;
			}
		},
		mutualFriends: {
			type: new GraphQLList(UserType),
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
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
				id: { type: new GraphQLNonNull(GraphQLID) },
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

				return a || 0;
			}
		},
		authTokens: { type: new GraphQLList(GraphQLString) },
		subscribedTo: {
			type: new GraphQLList(UserType),
			resolve: ({ subscribedTo }) => User.find({
				_id: {
					$in: subscribedTo
				}
			})
		},
		isSubscribed: {
			type: GraphQLBoolean,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
			async resolve({ id: _id }, { id }) {
				let a = await User.findById(id);
				return a.subscribedTo.includes(str(_id));
			}
		},
		isFriend: {
			type: GraphQLBoolean,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
			async resolve({ id: _id }, { id }) {
				let a = await User.findOne({
					_id: {
						$in: [_id, id]
					},
					friends: {
						$in: [_id, id]
					}
				});

				return !!a;
			}
		},
		isWaitingFriend: { // user is waiting
			type: GraphQLBoolean,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
			async resolve({ id: _id }, { id }) {
				let a = await User.countDocuments({
					_id: id,
					waitingFriends: {
						$in: [_id]
					}
				});

				return a || 0;
			}
		},
		isTrialFriend: { // we're waiting
			type: GraphQLBoolean,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
			resolve: ({ waitingFriends }, { id }) => waitingFriends.includes(str(id))
		},
		lastAuthToken: {
			type: GraphQLString,
			resolve: ({ authTokens }) => (authTokens.slice(-1) && authTokens.slice(-1)[0]) || ""
		},
		conversations: {
			type: new GraphQLList(ConversationType),
			resolve: ({ id }) => Conversation.find({
				contributors: {
					$in: [id]
				}
			})
		},
		notes: {
			type: new GraphQLList(NoteType),
			resolve: ({ id }) => Note.find({
				$or: [
					{
						creatorID: str(id)
					},
					{
						contributors: {
							$in: [str(id)]
						}
					}
				]
			}).sort({ time: -1 })
		},
		jointNotesInt: {
			type: GraphQLInt,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
			resolve: ({ id }, { id: anID }) => Note.countDocuments({
				contributors: {
					$in: [str(id), str(anID)]
				}
			})
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
				id: { type: new GraphQLNonNull(GraphQLID) },
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
				id: { type: new GraphQLNonNull(GraphQLID) },
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
				id: { type: new GraphQLNonNull(GraphQLID) },
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

const ConversationType = new GraphQLObjectType({
	name: "Conversation",
	fields: () => ({
		id: { type: GraphQLID },
		name: {
			type: GraphQLString,
			args: {
				id: { type: GraphQLID }
			},
			async resolve({ name, contributors }, { id }) {
				if(name || contributors.length > 2) return name || "Group";

				let a = await User.findById(
					(id) ? (
						contributors.filter(io => str(io) !== str(id))[0]
					) : (
						contributors[0]
					)
				);

				return a && a.name;
				
			}
		},
		color: { type: GraphQLString },
		contributors: {
			type: new GraphQLList(UserType),
			resolve: ({ contributors }) => User.find({
				_id: {
					$in: contributors
				}
			})
		},
		contributorsInt: {
			type: GraphQLInt,
			resolve: ({ contributors }) => contributors.length
		},
		avatar: {
			type: GraphQLString,
			args: {
				id: { type: GraphQLID }
			},
			async resolve({ avatar, contributors }, { id }) {
				if(!avatar) {
					let a = await User.findById(
						(id) ? (
							contributors.filter(io => str(io) !== str(id))[0]
						) : (
							contributors[0]
						)
					);

					return a && a.avatar;
				} else {
					return avatar;
				}
			}
		},
		lastMessage: {
			type: MessageType,
			resolve: async ({ id }) => {
				let a = await Message.find({
					conversationID: id,
					type: {
						$ne: "SYSTEM_MESSAGE"
					}
				}).sort({ time: -1 }).limit(1);
				return a[0];
			}
		},
		messages: {
			type: new GraphQLList(MessageType),
			resolve: ({ id }) => Message.find({ conversationID: id })
		},
		inviteSuggestions: {
			type: new GraphQLList(UserType),
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
			async resolve({ contributors }, { id }, { req }) {
				if(!contributors.includes(id)) return null;
				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				let b = await User.find({
					friends: {
						$in: [str(id)]
					}
				}).select("_id");

				let c = await User.find({ // and?
					_id: {
						$in: [ // all friends
							...a.friends,
							...(b.map(io => io._id))
						],
						$nin: contributors
					}
				});

				return c;
			}
		},
		isSeen: {
			type: GraphQLBoolean,
			args: {
				id: { type: GraphQLID }
			},
			async resolve({ id }, { id: userID }) {
				let a = (await Message.find({
					conversationID: id,
					type: {
						$ne: "SYSTEM_MESSAGE"
					},
					creatorID: {
						$ne: str(userID || -1)
					}
				}).sort({ time: -1 }).limit(1))[0];

				return (a) ? a.isSeen : true;
			}
		}
	})
});

const MessageType = new GraphQLObjectType({
	name: "Message",
	fields: () => ({
		id: { type: GraphQLID },
		content: { type: GraphQLString },
		type: { type: GraphQLString },
		time: { type: GraphQLString },
		creatorID: { type: GraphQLID },
		conversationID: { type: GraphQLID },
		isSeen: { type: GraphQLBoolean },
		images: {
			type: new GraphQLList(ImageType),
			resolve: ({ images }) => Image.find({
				_id: {
					$in: images
				}
			})
		},
		creator: {
			type: UserType,
			resolve: ({ creatorID }) => User.findById(creatorID)
		}
	})
});

const NoteType = new GraphQLObjectType({
	name: "NoteType",
	fields: () => ({
		id: { type: new GraphQLNonNull(GraphQLID) },
		creatorID: { type: new GraphQLNonNull(GraphQLID) },
		creator: {
			type: UserType,
			resolve: ({ creatorID: a }) => User.findById(id)
		},
		contributors: {
			type: new GraphQLList(UserType),
			args: {
				except: { type: GraphQLID },
				limit: { type: GraphQLInt }
			},
			resolve({ contributors, creatorID }, { limit, except }) {
				let a = {
					$in: [...contributors, str(creatorID)]
				}
				if(except) a.$ne = except;

				return User.find({
					_id: a
				}).limit(limit || 0)
			}
		},
		title: { type: GraphQLString },
		content: {
			type: GraphQLString,
			args: {
				limit: { type: GraphQLInt }
			},
			resolve({ contentHTML }, { limit }) {
				let a = contentHTML.replace(/<\/?[^>]+(>|$)/g, "".split(" "));
				if(a.length > limit) {
					a.length = limit;
					return a;
				} else {
					return a;
				}
			}
		},
		time: { type: GraphQLString },
		currWords: {
			type: GraphQLInt,
			resolve: ({ contentHTML }) => contentHTML.replace(/<\/?[^>]+(>|$)/g, "").split(" ").length
		},
		estWords: { type: GraphQLInt },
		contentHTML: { type: GraphQLString },
		clientHost: {
			type: GraphQLBoolean,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
			resolve: ({ creatorID }, { id }) => str(creatorID) === str(id)
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
				targetID: { type: GraphQLID }
			},
			async resolve(_, { id, targetID }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				return (targetID) ? User.findById(targetID) : a;
			}
		},
		loginExists: {
			type: GraphQLBoolean,
			args: {
				login: { type: new GraphQLNonNull(GraphQLString) },
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
				targetID: { type: new GraphQLNonNull(GraphQLID) },
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
			},
			async resolve(_, { id }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				return Post.find({
					$or: [
						{
							creatorID: {
								$in: a.subscribedTo
							}
						},
						{ creatorID: id }
					]
				}).sort({ time: -1 });
			}
		},
		searchFriends: {
			type: new GraphQLList(UserType),
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				match: { type: new GraphQLNonNull(GraphQLString) },
				section: { type: new GraphQLNonNull(GraphQLString) },
			},
			async resolve(_, { id, match, section }, { req }) {
				// Validate requester
				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				let b = new RegExp(match, "i"), // Create match regex
					c = { // section -> field // convert section to userschema field
						"FRIENDS": "friends",
						"REQUESTS": "waitingFriends"
					}[section];
 
				let d = await User.find({ // select more friends
					[c]: {
						$in: [str(id)]
					}
				}).select("_id");

				a[c] = [ // set all friends into the one array
					...a[c],
					...d
				]

				// Submit response
				return User.find({
					_id: {
						$in: a[c]
					},
					$or: [
						{ name: b },
						{ description: b }
					]
				});
			}
		},
		conversation: {
			type: ConversationType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				targetID: { type: new GraphQLNonNull(GraphQLID) },
				seeConversation: { type: GraphQLBoolean }
			},
			async resolve(_, { id, targetID, seeConversation }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				let b = await Conversation.findOne({
					_id: targetID,
					contributors: {
						$in: [str(id)]
					}
				});

				if(seeConversation) {
	 				await Message.updateMany({
						conversationID: targetID,
						isSeen: false,
						creatorID: {
							$ne: str(id)
						}
					}, {
						isSeen: true
					});
				}

				return b;
			}
		},
		searchInConversationInviteSuggestions: {
			type: new GraphQLList(UserType),
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				conversationID: { type: new GraphQLNonNull(GraphQLID) },
				query: { type: new GraphQLNonNull(GraphQLString) },
			},
			async resolve(_, { id, conversationID, query }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				let b = await Conversation.findOne({
					_id: conversationID,
					contributors: {
						$in: [str(id)]
					}
				});
				if(!b) return null;

				let c = await User.find({
					friends: {
						$in: [str(id)]
					}
				}).select("_id");

				return User.find({
					name: new RegExp(query, "i"),
					_id: {
						$in: [
							...a.friends,
							...(c.map(io => io._id))
						],
						$nin: b.contributors
					}
				});
			}
		},
		searchConversations: {
			type: new GraphQLList(ConversationType),
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				query: { type: new GraphQLNonNull(GraphQLString) },
			},
			async resolve(_, { id, query }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				let b = await Conversation.find({
					contributors: {
						$in: [str(id)]
					},
					name: new RegExp(query, "i")
				});

				return b;
			}
		},
		note: {
			type: NoteType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				targetID: { type: new GraphQLNonNull(GraphQLID) },
			},
			async resolve(_, { id, targetID }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				return Note.findOne({
					_id: targetID,
					$or: [
						{
							creatorID: str(id)
						},
						{
							contributors: {
								$in: [str(id)]
							}
						}
					]
				});
			}
		},
		getNoteInviteSuggestions: {
			type: new GraphQLList(UserType),
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				noteID: { type: new GraphQLNonNull(GraphQLID) },
			},
			async resolve(_, { id, noteID }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				let b = await Note.findOne({
					_id: noteID,
					$or: [
						{
							contributors: {
								$in: [str(id)]
							}
						},
						{
							creatorID: str(id)
						}
					]
				});
				if(!b) return null;

				let c = await User.find({
					friends: {
						$in: [str(id)]
					}
				});
				c = [ // friends
					...c,
					...a.friends
				]
				return User.find({
					_id: {
						$in: c,
						$nin: b.contributors
					}
				});
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
				avatar: { type: new GraphQLNonNull(GraphQLUpload) },
			},
			async resolve(_, { login, password, name, avatar }, {  req }) {
				{
					let a = await User.findOne({ login });
					if(a) return null;
				}

				let token = generateNoise();

				// receive image
				if(avatar) {					
					let { filename, stream } = await avatar;
					var avatarPath = `${ settings.files.avatars }/${ generateNoise(128) },.${ getExtension(filename) },`

					stream.pipe(fileSystem.createWriteStream('.' + avatarPath));
				}

				req.session.authToken = token;
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
				password: { type: new GraphQLNonNull(GraphQLString) },
			},
			resolve(_, { login, password }, { req }) {
				let a = generateNoise(); // authToken
				req.session.authToken = a;

				return User.findOneAndUpdate({ login, password }, {
					$push: {
						authTokens: a
					}
				}, (__, a) => a);
			}
		},
		publishPost: {
			type: PostType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				content: { type: GraphQLString },
				images: { type: new GraphQLList(new GraphQLNonNull(GraphQLUpload)) },
			},
			async resolve(_, { id, content, images }, { req }) {
				if(!content && (!images || !images.length)) return null;
				let a = await validateAccount(id, req.session.authToken);
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

							let link = `${ settings.files.images }/${ generateNoise(128) },.${ getExtension(filename) },`;
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
				targetID: { type: new GraphQLNonNull(GraphQLID) },
				content: { type: GraphQLString },
				image: { type: GraphQLUpload }
			},
			async resolve(_, { id, targetID, content, image }, { req }) {
				// Global validation
				if(!content && !image) return null;
				let a = await validateAccount(id, req.session.authToken);
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

					let link = `${ settings.files.images }/${ generateNoise(128) },.${ getExtension(filename) },`;
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
				targetID: { type: new GraphQLNonNull(GraphQLID) },
			},
			async resolve(_, { id, targetID }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
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
				targetID: { type: new GraphQLNonNull(GraphQLID) },
			},
			async resolve(_, { id, targetID }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
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
				targetID: { type: new GraphQLNonNull(GraphQLID) },
			},
			async resolve(_, { id, targetID }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
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
				avatar: { type: new GraphQLNonNull(GraphQLUpload) },
			},
			async resolve(_, { id, avatar }, { req }) {
				// Receive image
				let { stream, filename } = await avatar;

				let link = `${ settings.files.images }/${ generateNoise(128) },.${ getExtension(filename) },`;
				stream.pipe(fileSystem.createWriteStream('.' + link));

				// Submit
				return User.findOneAndUpdate({
					_id: id,
					authTokens: {
						$in: [req.session.authToken]
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
				cover: { type: new GraphQLNonNull(GraphQLUpload) },
			},
			async resolve(_, { id, cover }, { req }) {
				// Receive image
				let { stream, filename } = await cover;

				let link = `${ settings.files.images }/${ generateNoise(128) },.${ getExtension(filename) },`;
				stream.pipe(fileSystem.createWriteStream('.' + link));

				// Submit
				return User.findOneAndUpdate({
					_id: id,
					authTokens: {
						$in: [req.session.authToken]
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
				avatar: { type: new GraphQLNonNull(GraphQLUpload) },
			},
			async resolve(_, { id, avatar }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				let { stream, filename } = await avatar;
				let link = `${ settings.files.images }/${ generateNoise(128) },.${ getExtension(filename) },`;
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
		processFriendRequest: {
			// send request, cancel request, accept request, remove from friends
			type: UserType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				targetID: { type: new GraphQLNonNull(GraphQLID) },
			},
			async resolve(_, { id, targetID }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				let b = await User.findById(targetID);
				if(!b) return null;

				if( // Send request
					(
						!a.friends.includes(str(targetID)) &&
						!a.waitingFriends.includes(str(targetID))
					) && (
						!b.friends.includes(str(id)) &&
						!b.waitingFriends.includes(str(id))
					)
				) {
					await b.updateOne({
						$addToSet: {
							waitingFriends: str(id)
						}
					});

					b.waitingFriends.push(str(id));
				} else if( // Cancel request
					(
						!a.friends.includes(str(targetID)) &&
						!a.waitingFriends.includes(str(targetID))
					) && (
						!b.friends.includes(str(id)) &&
						b.waitingFriends.includes(str(id))
					)
				) {
					await b.updateOne({
						$pull: {
							waitingFriends: str(id)
						}
					});

					b.waitingFriends.splice(b.waitingFriends.findIndex(io => str(io) === str(targetID)), 1);
				} else if( // Accept friend
					(
						!a.friends.includes(str(targetID)) &&
						a.waitingFriends.includes(str(targetID))
					) && (
						!b.friends.includes(str(id)) &&
						!b.waitingFriends.includes(str(id))
					)
				) {
					await a.updateOne({
						$pull: {
							waitingFriends: str(targetID)
						},
						$addToSet: {
							friends: str(targetID)
						}
					});

					b.waitingFriends.splice(b.waitingFriends.findIndex(io => str(io) === str(targetID)), 1);
					b.friends.push(str(targetID));
				} else if( // Remove friend
					(
						!a.waitingFriends.includes(str(targetID)) &&
						!b.waitingFriends.includes(str(id))
					) && (
						a.friends.includes(str(targetID)) ||
						b.friends.includes(str(id))
					)
				) {
					await a.updateOne({
						$pull: {
							friends: str(targetID)
						}
					});

					await b.updateOne({
						$pull: {
							friends: str(id)
						}
					});
				}

				return b;

			}
		},
		subscribeUser: {
			type: UserType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				targetID: { type: new GraphQLNonNull(GraphQLID) }, 
			},
			async resolve(_, { id, targetID }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				let b = await User.findById(targetID);
				if(!b) return null;

				let c = a.subscribedTo;
				let d = c.includes(str(targetID));

				await a.updateOne({
					[ (!d) ? "$addToSet" : "$pull" ]: {
						subscribedTo: str(targetID)
					}
				});

				if(!d) c.push(str(targetID));
				else c.splice(c.findIndex(io => str(io) === str(targetID)), 1);

				return b;
			}
		},
		declareFriendRequestStatus: {
			type: UserType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				targetID: { type: new GraphQLNonNull(GraphQLID) },
				status: { type: new GraphQLNonNull(GraphQLString) },
			},
			async resolve(_, { id, targetID, status }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
				switch(status) {
					case 'ACCEPT_ACTION':
						await a.updateOne({
							$pull: {
								waitingFriends: targetID
							},
							$addToSet: {
								friends: targetID
							}
						});
					break;
					case 'DECLINE_ACTION':
						await a.updateOne({
							$pull: {
								waitingFriends: targetID
							}
						});
					break;
					case 'REMOVE_ACTION':
						await a.updateOne({
							$pull: {
								friends: str(targetID)
							}
						});

						await User.findOneAndUpdate({
							_id: targetID
						}, {
							$pull: {
								friends: str(id)
							}
						});
					break;
					default:break;
				}
				return a;
			}
		},
		updateProfileDescription: {
			type: UserType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				content: { type: new GraphQLNonNull(GraphQLString) },
			},
			resolve: (_, { id, content }, { req }) => User.findOneAndUpdate({
				_id: id,
				authTokens: {
					$in: [req.session.authToken]
				}
			}, {
				description: content
			})
		},
		settingProfile: {
			type: UserType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				name: { type: GraphQLString },
				login: { type: GraphQLString },
				password: { type: GraphQLString }
			},
			resolve(_, { id, name, login, password }, { req }) {
				let a = {};

				if(name) a.name = name;
				if(login) a.login = login;
				if(password) a.password = password;
				if(!Object.values(a).length) return null;
				
				return User.findOneAndUpdate({
					_id: id,
					authTokens: {
						$in: [req.session.authToken]
					}
				}, a, (_, a) => a);
			}
		},
		createConversation: {
			type: ConversationType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				targetID: { type: new GraphQLNonNull(GraphQLID) },
			},
			async resolve(_, { id, targetID }, { req }) {
				// Validate init contributors
				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				let b = await User.findById(targetID);
				if(!b) return null;

				// Validate if the conversation exists
				let c = await Conversation.findOne({
					$or: [ // XXX
						{
							contributors: [
								str(id),
								str(targetID)
							]
						},
						{
							contributors: [
								str(targetID),
								str(id)
							]
						}
					]
				});

				if(c) return c;

				// Create a new conversation
				let d = await (
					new Conversation({
						name: "",
						avatar: "",
						contributors: [
							str(id),
							str(targetID)
						],
						creatorID: str(id),
						color: "white"
					})
				).save();

				// Send the new conversation's data
				return d;
			}
		},
		sendMessage: {
			type: MessageType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				content: { type: GraphQLUpload }, // takes any type of data (string, object)
				type: { type: new GraphQLNonNull(GraphQLString) },
				conversationID: { type: new GraphQLNonNull(GraphQLID) },
			},
			async resolve(_, { id, content, type, conversationID }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				let b = await Conversation.findOne({
					contributors: {
						$in: [str(id)]
					},
					_id: conversationID
				});
				if(!b) return null;

				let images = [];
				if(type === "FILE_TYPE") { // Download file and return url as value
					let { filename, stream } = await content;
					content = `${ settings.files.files }/${ generateNoise(128) },.${ getExtension(filename) },`

					stream.pipe(fileSystem.createWriteStream('.' + content));
				} else if(type === "IMAGES_TYPE") {
					images = Array.from(content);
					content = "";
				}

				let c = await (
					new Message({
						time: new Date,
						content,
						type,
						creatorID: str(id),
						conversationID,
						isSeen: false,
						images
					})
				).save();

				pubsub.publish('conversationMessageSent', {
					conversationID,
					message: c
				});

				pubsub.publish('conversationUpdated', {
					conversation: b
				});

				return c;
			}
		},
		addUserToConversation: {
			type: UserType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				conversationID: { type: new GraphQLNonNull(GraphQLID) },
				targetID: { type: new GraphQLNonNull(GraphQLID) },
			},
			async resolve(_, { id, conversationID, targetID }, { req }) {
				// validate user (+)
				// validate if conversation exists (+)
				// validate if user is in conversation
				// validate if target exists (+)
				// validate if target is friend for user (+)
				// add target to the conversation |addToSet!| (+)
				// send system message in conversation (+)

				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				let b = await Conversation.findById(conversationID);
				if(!b) return null;

				let c = await User.findById(targetID);
				if(
					!c ||
					(
						!c.friends.includes(str(id)) &&
						!a.friends.includes(str(targetID))
					)
				) return null;

				await b.updateOne({
					$addToSet: {
						contributors: str(targetID)
					}
				});

				let d = await (
					new Message({
						time: new Date,
						content: `${ a.name } invited ${ c.name } to the conversation`,
						type: "SYSTEM_MESSAGE",
						creatorID: "-1",
						conversationID: str(b._id),
						isSeen: true,
						images: []
					})
				).save();

				pubsub.publish('conversationMessageSent', {
					conversationID,
					message: d
				});

				return c;
			}
		},
		settingConversation: {
			type: ConversationType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				conversationID: { type: new GraphQLNonNull(GraphQLID) },
				avatar: { type: new GraphQLNonNull(GraphQLUpload) },
				name: { type: new GraphQLNonNull(GraphQLString) },
				color: { type: new GraphQLNonNull(GraphQLString) },
			},
			async resolve(_, { id, conversationID, avatar, name, color }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				let b = {};

				if(avatar) {
					let { filename, stream } = await avatar;
					b.avatar = `${ settings.files.avatars }/${ generateNoise(128) },.${ getExtension(filename) },`

					stream.pipe(fileSystem.createWriteStream('.' + b.avatar));
				}
				if(name) b.name = name;
				if(color) b.color = color;

				let c = await Conversation.findOneAndUpdate({
					_id: conversationID,
					contributors: {
						$in: [id]
					}
				}, b, (__, a) => a);

				let d = await (
					new Message({
						time: new Date,
						content: `${ a.name } updated conversation`,
						type: "SYSTEM_MESSAGE",
						creatorID: "-1",
						conversationID: str(c._id),
						isSeen: true,
						images: []
					})
				).save();

				pubsub.publish('conversationMessageSent', {
					conversationID,
					message: d
				});

				pubsub.publish('conversationSettingsUpdated', {
					conversation: c
				});

				pubsub.publish('conversationUpdated', {
					conversation: c
				});

				return c;
			}
		},
		kickDialogContributor: {
			type: UserType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				conversationID: { type: new GraphQLNonNull(GraphQLID) },
				targetID: { type: new GraphQLNonNull(GraphQLID) },
			},
			async resolve(_, { id, conversationID, targetID }, { req }) {
				// validate user (+)
				// validate conversation and if user and target in the conversation (+)
				// kick target (+)
				// send back user data (+)

				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				let b = await Conversation.findOneAndUpdate({
					_id: conversationID,
					contributors: {
						$in: [str(id), str(targetID)]
					}
				}, {
					$pull: {
						contributors: str(targetID)
					}
				}, (_, b) => b);
				if(!b) return null;

				let c = await User.findById(targetID);

				let d = await (
					new Message({
						time: new Date,
						content: `${ a.name } kicked ${ c.name } from the conversation`,
						type: "SYSTEM_MESSAGE",
						creatorID: "-1",
						conversationID: str(b._id),
						isSeen: true,
						images: []
					})
				).save();

				pubsub.publish('conversationMessageSent', {
					conversationID,
					message: d
				});

				pubsub.publish('conversationUpdated', {
					conversation: b
				});

				return c;
			}
		},
		leaveConversation: {
			type: ConversationType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				conversationID: { type: new GraphQLNonNull(GraphQLID) },
			},
			async resolve(_, { id, conversationID }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				let b = await Conversation.findOneAndUpdate({
					_id: conversationID
				}, {
					$pull: {
						contributors: str(id)
					}
				}, (_, a) => a);
				if(!b) return null;

				let c = await (
					new Message({
						time: new Date,
						content: `${ a.name } leaved the conversation.`,
						type: "SYSTEM_MESSAGE",
						creatorID: "-1",
						conversationID: str(b._id),
						isSeen: true,
						images: []
					})
				).save();

				pubsub.publish('conversationMessageSent', {
					conversationID,
					message: c
				});

				pubsub.publish('conversationUpdated', {
					conversation: b
				});

				return b;
			}
		},
		createNote: {
			type: NoteType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				title: { type: new GraphQLNonNull(GraphQLString) },
				words: { type: new GraphQLNonNull(GraphQLInt) },
			},
			async resolve(_, { id, title, words }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				let b = await (
					new Note({
						creatorID: str(id),
						contributors: [],
						title,
						estWords: words,
						time: new Date,
						contentHTML: ""
					})
				).save();

				return b;
			}
		},
		saveNote: {
			type: NoteType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				targetID: { type: new GraphQLNonNull(GraphQLID) },
				content: { type: new GraphQLNonNull(GraphQLString) },
			},
			async resolve(_, { id, targetID, content }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				let b = await Note.findOneAndUpdate({
					_id: targetID,
					$or: [
						{
							creatorID: str(id)
						},
						{
							contributors: {
								$in: [str(id)]
							}
						}
					]
				}, {
					contentHTML: content
				}, (_, a) => a);

				pubsub.publish('noteContentUpdated', {
					posterID: id,
					note: b
				});

				return b;
			}
		},
		settingNote: {
			type: NoteType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				targetID: { type: new GraphQLNonNull(GraphQLID) },
				title: { type: GraphQLString },
				esWords: { type: GraphQLInt }
			},
			async resolve(_, { id, targetID, title, esWords }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				let b = {};
				if(title) b.title = title;

				return Note.findOneAndUpdate({
					_id: targetID,
					$or: [
						{
							creatorID: str(id)
						},
						{
							contributors: {
								$in: [str(id)]
							}
						}
					]
				}, {
					...b,
					estWords: esWords
				}, (_, a) => a);
			}
		},
		addNoteContributor: {
			type: NoteType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				noteID: { type: new GraphQLNonNull(GraphQLID) },
				targetID: { type: new GraphQLNonNull(GraphQLID) },
			},
			async resolve(_, { id, noteID, targetID }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				return Note.findOneAndUpdate({
					_id: noteID,
					$or: [
						{
							contributors: {
								$in: [str(id)]
							}
						},
						{
							creatorID: str(id)
						}
					]
				}, {
					$addToSet: {
						contributors: str(targetID)
					}
				}, (_, a) => a);
			}
		},
		kickNoteContributor: {
			type: NoteType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				noteID: { type: new GraphQLNonNull(GraphQLID) },
				targetID: { type: new GraphQLNonNull(GraphQLID) },
			},
			async resolve(_, { id, noteID, targetID }, { req }) {
				let a = await validateAccount(id, req.session.authToken);
				if(!a) return null;

				return Note.findOneAndUpdate({
					_id: noteID,
					$or: [
						{
							contributors: {
								$in: [str(id)]
							}
						},
						{
							creatorID: str(id)
						}
					]
				}, {
					$pull: {
						contributors: str(targetID)
					}
				}, (_, a) => a);
			}
		}
	}
});

const RootSubscription = new GraphQLObjectType({
	name: "RootSubscription",
	fields: {
		hookConversationMessage: {
			type: MessageType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				conversationID: { type: new GraphQLNonNull(GraphQLID) },
			},
			subscribe: withFilter(
				() => pubsub.asyncIterator('conversationMessageSent'),
				async ({ conversationID: targetID }, { id, conversationID }, { req }) => {
					if(str(targetID) !== str(conversationID)) return false;
					let a = await validateAccount(id, req.session.authToken);
					if(!a) return false;

					return true;
				}
			),
			resolve: ({ message }) => message
		},
		conversationSettingsUpdated: {
			type: ConversationType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				conversationID: { type: new GraphQLNonNull(GraphQLID) },
			},
			subscribe: withFilter(
				() => pubsub.asyncIterator('conversationSettingsUpdated'),
				async ({ conversation }, { id, conversationID }, { req }) => {
					if(
						str(conversationID) !== str(conversation.id) ||
						!conversation.contributors.includes(str(id))
					) return false;

					let a = await validateAccount(id, req.session.authToken);
					if(!a) return false;

					return true;
				}
			),
			resolve: ({ conversation }) => conversation
		},
		conversationsGridUpdated: {
			type: ConversationType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
			subscribe: withFilter(
				() => pubsub.asyncIterator('conversationUpdated'),
				async ({ conversation }, { id }, { req }) => {
					// find all user's conversations
					// check if updated conversation in this list

					let a = await validateAccount(id, req.session.authToken);
					if(!a) return false;

					let b = (await Conversation.find({ // get ids
						contributors: {
							$in: [str(a._id)]
						}
					}).select("_id")).map(io => str(io._id)); // convert [{_id: id1}, {_id: id2}] to [id1, id2, id3]

					return b.includes(str(conversation._id));
				}
			),
			resolve: ({ conversation }) => conversation
		},
		listenNoteUpdates: {
			type: NoteType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
				targetID: { type: new GraphQLNonNull(GraphQLID) },
			},
			subscribe: withFilter(
				() => pubsub.asyncIterator('noteContentUpdated'),
				async ({ note, posterID }, { id, targetID }, { req }) => {
					if(str(note._id) !== str(targetID) || str(posterID) === str(id)) return false;

					let a = await validateAccount(id, req.session.authToken);
					if(!a) return false;

					return true;
				}
			),
			resolve: ({ note }) => note
		}
	}
})

module.exports = new GraphQLSchema({
	query: RootQuery,
	mutation: RootMutation,
	subscription: RootSubscription
});