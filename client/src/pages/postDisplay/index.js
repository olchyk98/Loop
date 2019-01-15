import React, { Component } from 'react';
import './main.css';

import Post from '../__forall__/post';
import Loadericon from '../__forall__/loader.icon';

import { gql } from 'apollo-boost';
import { connect } from 'react-redux';

import client from '../../apollo';
import { cookieControl } from '../../utils';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			post: false
		}
	}

	// TODO: Load from api (+)
	// TODO: Subscribe to comments (_)
	// TODO: Subscribe to stats (comments, likes) (+)
	// TODO: Subscribe to comment likes (+)

	componentDidMount() {
		const errorTxt = "We couldn't load this post. Please, try later";

		const { id } = cookieControl.get("authdata");

		client.query({
			query: gql`
				query($id: ID!, $targetID: ID!) {
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
						comments {
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
				}
			`,
			variables: {
				id,
				targetID: this.props.match.params.id
			}
		}).then(({ data: { post: a } }) => {
			if(!a) return this.props.castError(errorTxt);

			this.setState(() => ({
				post: a
			}));

		}).then(() => { // Stats // PostType
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

	render() {
		return(
			<div className="rn rn-postdisplay nonav">
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