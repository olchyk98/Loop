import React, { Component } from 'react';
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
			isLiking: false
		}
	}

	likeComment = () => {
		if(this.state.isLiking) return;
		let qRa = pl => this.setState(() => ({ isLiking: pl }));

		qRa(true);
		this.setState(( { isLiked: a, likesInt: b }, { isLiked: c, likesInt: d } ) => ({
			isLiked: (a) ? !a : !c,
			likesInt: (a) ? !a : !c ? a + 1 : -1
		}));

		const { id, authToken } = cookieControl.get("authdata"),
			  errorTxt = "We couldn't submit your like. Please, try again.";

		client.mutate({
			mutation: gql`
				mutation($id: ID!, $authToken: String!, $targetID: ID!) {
					likeComment(id: $id, authToken: $authToken, targetID: $targetID) {
						id,
						likesInt,
						isLiked(id: $id)
					}
				}
			`,
			variables: {
				id, authToken,
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

	render() {
		return(
			<div className="rn-feed-mat-item-comments-comment">
				<div className="rn-feed-mat-item-comments-comment-avatar">
					<img src={ ((this.props.creator.avatar && api.storage + this.props.creator.avatar) || "") } alt="creator" title="Creator's avatar" />
				</div>
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
						<button className="rn-feed-mat-item-comments-comment-content-controls-like definp" onClick={ this.likeComment }>
							Like{ ( ((this.state.isLiked === null) ? this.props.isLiked : this.state.isLiked) ? "d" : "" ) } ({ this.state.likesInt || this.props.likesInt })
						</button>
						<span className="rn-feed-mat-item-comments-comment-content-controls-space">·</span>
						<span className="rn-feed-mat-item-comments-comment-content-controls-time">{ convertTime(this.props.time, "ago") }</span>
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = ({ session: { dockRefresher } }) => ({
	refreshDock: dockRefresher
});

const mapActionsToProps = {
	openPhoto: payload => ({
		type: "TOGGLE_PHOTO_MODAL",
		payload
	})
}

export default connect(
	mapStateToProps,
	mapActionsToProps
)(Hero);