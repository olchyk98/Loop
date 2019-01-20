import React, { Component } from 'react';
import './main.css';

import Post from '../__forall__/post';
import Loadericon from '../__forall__/loader.icon';

import { gql } from 'apollo-boost';
import { connect } from 'react-redux';

import client from '../../apollo';
import { cookieControl } from '../../utils';

const options = {
	limitComments: 5,
	commentsLimit: 7
}

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			post: false,
			fetchingComments: false,
			fetchableComments: true
		}

		this.scrollTargetCommentsF = null;
		this.matRef = React.createRef();

		this.internalMounted = false;
	}

	componentDidMount() {
		this.internalMounted = true;

		const errorTxt = "We couldn't load this post. Please, try later",
			  { id } = cookieControl.get("authdata");

		client.query({
			query: gql`
				query($id: ID!, $targetID: ID!, $limitComments: Int) {
					post(targetID: $targetID) {
						id,
						content,
						time,
						likesInt,
						commentsInt,
						isLiked(id: $id),
						creator {
							id,
							name,
							avatar
						},
						images {
							id,
							url
						},
						comments(limit: $limitComments) {
							id,
							content,
							time,
							creator {
								id,
								avatar,
								name
							},
							likesInt,
							isLiked(id: $id),
							image {
								id,
								url
							}
						}
					}
				}
			`,
			variables: {
				id,
				targetID: this.props.match.params.id,
				limitComments: options.limitComments
			}
		}).then(({ data: { post: a } }) => {
			if(!this.internalMounted) return;

			if(!a) return this.props.castError(errorTxt);

			this.setState(() => ({
				post: a
			}));

			let aa = new URL(window.location.href).searchParams.get("stc");
			if(aa === "true") {
				(this.scrollTargetCommentsF && this.scrollTargetCommentsF());
			}

		}).then(() => { // Stats // PostType
			if(!this.internalMounted) return;

			client.subscribe({
				query: gql`
					subscription($targetID: ID!) {
						listenPostStats(targetID: $targetID) {
							id,
							likesInt,
							commentsInt
						}
					}
				`,
				variables: {
					targetID: this.props.match.params.id
				}
			}).subscribe({
				next: ({ data: { listenPostStats: a } }) => {
					if(!a) return;

					this.setState(({ post }) => ({
						post: {
							...post,
							...a
						}
					}));
				}
			});
		}).then(() => { // Comments // CommentType
			if(!this.internalMounted) return;

			const { id } = cookieControl.get("authdata");

			client.subscribe({
				query: gql`
					subscription($id: ID!, $targetID: ID!) {
						listenPostComments(id: $id, targetID: $targetID) {
							id,
							content,
							creator {
								id,
								avatar,
								name
							},
							likesInt,
							isLiked(id: $id),
							image {
								id,
								url
							}
						}
					}
				`,
				variables: {
					id,
					targetID: this.props.match.params.id
				}
			}).subscribe({
				next: ({ data: { listenPostComments: a } }) => {
					if(!a) return;

					this.setState(({ post, post: { comments } }) => ({
						post: {
							...post,
							comments: [
								...comments,
								a
							]
						}
					}));
				}
			});
		}).then(() => {
			client.subscribe({
				query: gql`
					subscription($targetID: ID!) {
						listenPostCommentsLikes(targetID: $targetID) {
							id,
							likesInt
						}
					}
				`,
				variables: {
					targetID: this.props.match.params.id
				}
			}).subscribe({
				next: ({ data: { listenPostCommentsLikes: a } }) => {
					let b = Array.from(this.state.post.comments);
					b.find(io => io.id === a.id).likesInt = a.likesInt;
					this.setState(({ post }) => ({
						post: {
							...post,
							comments: b
						}
					}))
				}
			})
		}).catch(() => this.props.castError(errorTxt));
	}

	componentWillUnmount() {
		this.internalMounted = false;
	}

	fetchMoreComments = () => {
		if(!this.state.fetchableComments || this.state.fetchingComments || !this.state.post) return;
		// Get new comments, sort by time (client post moves top)

		this.setState(() => ({
			fetchingComments: true
		}));

		const { id } = cookieControl.get("authdata"),
			  errorTxt = "An error occured while tried to load more comments to this post. Please, try later.",
			  scrollTop = this.matRef.scrollTop,
			  offsetID = (this.state.post.comments.length && this.state.post.comments.slice(-1)[0].id);

		if(!offsetID) return;

		client.query({
			query: gql`
				query($id: ID!, $targetID: ID!, $limit: Int, $offsetID: ID) {
					post(targetID: $targetID) {
						id,
						comments(limit: $limit, offsetID: $offsetID) {
							id,
							content,
							time,
							creator {
								id,
								avatar,
								name
							},
							likesInt,
							isLiked(id: $id),
							image {
								id,
								url
							}
						}
					}
				}
			`,
			variables: {
				id,
				targetID: this.state.post.id,
				limit: options.commentsLimit,
				offsetID
			}
		}).then(({ data: { post: a } }) => {
			if(!this.internalMounted) return;
			if(!a) return this.props.castError(errorTxt);
			if(!a.comments) return;

			this.setState(({ post, post: { comments } }) => ({
				post: {
					...post,
					comments: [
						...comments,
						...a.comments
					].sort((a, b) => (a.time < b.time) ? 1 : -1)
				},
				fetchingComments: false,
				fetchableComments: this.state.post.comments.length + a.comments.length < this.state.post.commentsInt
			}), () => {
				if(this.matRef.scrollTop < scrollTop) this.matRef.scrollTop = scrollTop;
			});
		}).catch(() => this.props.castError(errorTxt));
	}

	render() {
		return(
			<div className="rn rn-postdisplay nonav" ref={ ref => this.matRef = ref }>
				{
					(this.state.post) ? (
						<Post
							id={ this.state.post.id }
							content={ this.state.post.content }
							creator={ this.state.post.creator }
							time={ this.state.post.time }
							likesInt={ this.state.post.likesInt }
							isLiked={ this.state.post.isLiked }
							commentsInt={ this.state.post.commentsInt }
							images={ this.state.post.images }
							comments={ this.state.post.comments }
							fetchingComments={ this.state.fetchingComments }
							fetchableComments={ this.state.fetchableComments }
							onFetchComments={ this.fetchMoreComments }
							onRef={ref => this.scrollTargetCommentsF = () => {
								ref.parentNode.scrollTo({
									top: ref.offsetTop + ref.scrollHeight,
									behavior: "smooth"
								});
							}}
						/>
					) : (
						<Loadericon />
					)
				}				
			</div>
		);
	}
}

const mapStateToProps = () => ({});

const mapActionsToProps = {
	castError: text => ({ type: 'CAST_GLOBAL_ERROR', payload: { status: true, text } })
}

export default connect(
	mapStateToProps,
	mapActionsToProps
)(App);