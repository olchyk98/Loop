import React, { Component, Fragment } from 'react';
import './main.css';

import { gql } from 'apollo-boost';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import client from '../../../apollo';
import api from '../../../api';
import { cookieControl, convertTime } from '../../../utils';
import links from '../../../links';

class Hero extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isLiked: null,
			likesInt: null,
			isLiking: false,
			isDeleted: false
		}
	}

	likeComment = () => {
		if(this.state.isLiking) return;
		let qRa = pl => this.setState(() => ({ isLiking: pl }));

		qRa(true);
		this.setState(( { isLiked: a, likesInt: b }, { isLiked: c, likesInt: d } ) => ({
			isLiked: (a !== null) ? !a : !c,
			likesInt: (b !== null) ? !a ? b + 1 : b - 1 : !c ? d + 1 : d - 1
		}));

		const { id } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't submit your like. Please, try again.";

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $targetID: ID!) {
					likeComment(id: $id, targetID: $targetID) {
						id,
						likesInt,
						isLiked(id: $id)
					}
				}
			`,
			variables: {
				id,
				targetID: this.props.id
			}
		}).then(({ data: { likeComment } }) => {
			qRa(false);
			if(!likeComment) return this.props.castError(errorTxt);

			this.setState(() => ({
				isLiked: likeComment.isLiked,
				likesInt: likeComment.likesInt
			}));
		}).catch(() => this.props.castError(errorTxt));
	}

	deleteComment = (pass = false) => {
		if(!pass) {
			return this.props.runFrontDialog(true, {
				title: "Delete this comment?",
				content: "Do you really want to delete this comment?",
				buttons: [
					{
						color: "submit",
						action: () => this.props.runFrontDialog(false, null),
						content: "Cancel"
					},
					{
						color: "cancel",
						action: () => { this.props.runFrontDialog(false, null); this.deleteComment(true); },
						content: "Delete"
					}
				]
			});
		}


		const { id } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't delete this comment. Please, try later.";

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $targetID: ID!) {
					deleteComment(id: $id, targetID: $targetID) {
						id
					}
				}
			`,
			variables: {
				id,
				targetID: this.props.id
			}
		}).then(({ data: { deleteComment: a } }) => {
			if(!a) return this.props.castError(errorTxt);

			this.setState(() => ({
				isDeleted: true
			}));
		}).catch(() => this.props.castError(errorTxt));
	}

	render() {
		if(this.state.isDeleted) return null;

		return(
			<div className="rn-feed-mat-item-comments-comment">
				<Link className="rn-feed-mat-item-comments-comment-avatar" to={ `${ links["ACCOUNT_PAGE"].absolute }/${ this.props.creator.id }` } onClick={ this.props.refreshDock }>
					<img src={ ((this.props.creator.avatar && api.storage + this.props.creator.avatar) || "") } alt="creator" title="Creator's avatar" />
				</Link>
				<div className="rn-feed-mat-item-comments-comment-content">
					<Link
						className="rn-feed-mat-item-comments-comment-content-name"
						to={ `${ links["ACCOUNT_PAGE"].absolute }/${ this.props.creator.id }` }
						onClick={ this.props.refreshDock }>
						{ this.props.creator.name }
					</Link>
					{
						(!this.props.content) ? null : (
							<div className="rn-feed-mat-item-comments-comment-content-mat">
								{ this.props.content }
							</div>
						)
					}
					{
						(!this.props.image) ? null : (
							<div className="rn-feed-mat-item-comments-comment-content-images" onClick={ () => this.props.openPhoto(this.props.image.id) }>
								<img src={ api.storage + this.props.image.url } alt="comment addon" />
							</div>
						)
					}
					<div className="rn-feed-mat-item-comments-comment-content-controls">
						<button className="rn-feed-mat-item-comments-comment-content-controls-action definp" onClick={ this.likeComment }>
							Like{ ( ((this.state.isLiked === null) ? this.props.isLiked : this.state.isLiked) ? "d" : "" ) } ({ this.state.likesInt || this.props.likesInt })
						</button>
						<span className="rn-feed-mat-item-comments-comment-content-controls-space">·</span>
						<span className="rn-feed-mat-item-comments-comment-content-controls-time">{ convertTime(this.props.time, "ago") }</span>
						{
							(this.props.creator.id !== this.props.clientID) ? null : (
								<Fragment>
									<span className="rn-feed-mat-item-comments-comment-content-controls-space">·</span>
									<button className="rn-feed-mat-item-comments-comment-content-controls-action definp" onClick={ () => this.deleteComment() }>
										Delete
									</button>
								</Fragment>
							)
						}
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = ({ user: { userdata } }) => ({
	clientID: userdata.id
});

const mapActionsToProps = {
	openPhoto: payload => ({
		type: "TOGGLE_PHOTO_MODAL",
		payload
	}),
	refreshDock: () => ({ type: "REFRESH_DOCK", payload: null }),
	runFrontDialog: (active, data) => ({ type: 'RUN_DIALOG', payload: { active, data } })
}

export default connect(
	mapStateToProps,
	mapActionsToProps
)(Hero);