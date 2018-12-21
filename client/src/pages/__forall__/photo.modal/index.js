import React, { Component, Fragment } from 'react';
import './main.css';

import { gql } from 'apollo-boost';
import { connect } from 'react-redux';

import Comment from '../postComment';
import CommentInput from '../postCommentInput';

import api from '../../../api';

const image = "https://reizeclub.com/wp-content/uploads/2017/11/gaming-room-fi-1-1.jpg";

class ControlsBtn extends Component {
	render() {
		return(
			<button className="gl-photomodal-mg-controls-btn definp" onClick={ this.props._onClick }>
				<div>
					{ this.props.icon }
				</div>
				<span>{ this.props.title }</span>
			</button>
		);
	}
}

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {

		}

		this.commentInputRef = React.createRef();
	}

	postComment = () => {

	}

	render() {
		return(
			<Fragment>
				<div className={ `gl-photomodal_bg${ (!this.props.active) ? "" : " active" }` } />
				<div className={ `gl-photomodal${ (!this.props.active) ? "" : " active" }` }>
					<section className="gl-photomodal-mg">
						<div className="gl-photomodal-mg-mat">
							<img src={ image } alt="modal" />
						</div>
						<div className="gl-photomodal-mg-controls">
							{
								[
									{
										title: "Like",
										icon: <i className="far fa-heart" />,
										action: () => null
									},
									{
										title: "Comment",
										icon: <i className="far fa-comment-alt" />,
										action: () => null
									},
									{
										title: "Download",
										icon: <i className="far fa-arrow-alt-circle-down" />,
										action: () => null
									}
								].map(({ title, icon, action }, index) => (
									<ControlsBtn
										key={ index }
										_onClick={ action }
										title={ title }
										icon={ icon }
									/>
								))
							}
						</div>
					</section>
					<section className="gl-photomodal-infoc">
						<div className="gl-photomodal-infoc-account">
							<div className="gl-photomodal-infoc-account-img">
								<img src={ image } alt="profile user" />
							</div>
							<div className="gl-photomodal-infoc-account-info">
								<p className="gl-photomodal-infoc-account-info-name">Oles Odynets</p>
								<p className="gl-photomodal-infoc-account-info-date">23:32 23 Dec, 2018</p>
							</div>
						</div>
						<Comment
							id={ 0 }
							content={ "asd" }
							creator={ {} }
							time={ 123 }
							likesInt={ 1 }
							isLiked={ true }
							image={ "" }
							castError={ this.props.castError }
						/>
						<CommentInput
							uavatar={ ((this.props.userdata && Object.keys(this.props.userdata).length && api.storage + this.props.userdata.avatar) || "") }
							_onRef={ ref => this.commentInputRef = ref }
							_onSubmit={ this.postComment }
							rootId={ "asd" }
						/>
					</section>
				</div>
			</Fragment>
		);
	}
}

const mapStateToProps = ({ user: { userdata } }) => ({
	userdata
});

const mapActionsToProps = {
	castError: text => ({ type: 'CAST_GLOBAL_ERROR', payload: { status: true, text } })
}

export default connect(
	mapStateToProps,
	mapActionsToProps
)(App);