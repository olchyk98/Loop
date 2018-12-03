import React, { Component } from 'react';
import './main.css';

import GridItem from '../__forall__/post';

const image = 'https://d2v9y0dukr6mq2.cloudfront.net/video/thumbnail/VnxYrY1ux/young-blonde-beautiful-girl-fashion-looks-at-blue-neon-light-portrait-at-night_sujtbljwx_thumbnail-full03.png';

class ThumbNavButton extends Component {
	render() {
		return(
			<button className={ `rn-account-thumb-nav-btn definp${ (!this.props.active) ? "" : " active" }${ (!this.props.ei) ? "" : " ei" }` } onClick={ this.props._onClick }>
				<span className="rn-account-thumb-nav-btn-title">{ this.props.title }</span>
				{
					(!parseInt(this.props.counter)) ? null : (
						<span className="rn-account-thumb-nav-btn-counter">{ this.props.counter }</span>
					)
				}
			</button>
		);
	}
}

class FriendsGridFriend extends Component {
	constructor(props) {
		super(props);

		this.state = {
			settingsVisible: false,
			settingsMoreINCV: false
		}

		this.settingsRef = React.createRef();
	}

	render() {
		return(
			<div className="rn-account-display-friends-nav-grid-user">
				<div className="rn-account-display-friends-nav-grid-user-avatar">
					<img src={ image } alt="User" title="User's avatar" />
				</div>
				<div className="rn-account-display-friends-nav-grid-user-info">
					<span className="rn-account-display-friends-nav-grid-user-info-name">Oles Odynets</span>
					<span className="rn-account-display-friends-nav-grid-user-info-info">15 mutual friends</span>
				</div>
				<div
					className="rn-account-display-friends-nav-grid-user-set definp"
					onClick={ () => this.setState(({ settingsVisible: a }) => ({ settingsVisible: !a })) }>
					<i className="fas fa-ellipsis-h" />
					<div
						className={ `rn-account-display-friends-nav-grid-user-set-list${ (this.state.settingsMoreINCV) ? "" : " hidgrad" }${ (!this.state.settingsVisible) ? "" : " visible" }` }
						ref={ ref => this.settingsRef = ref }
						onScroll={ () => this.setState({ settingsMoreINCV: this.settingsRef.scrollTop > 0 }) }>
						<button className="rn-account-display-friends-nav-grid-user-set-list-btn definp">Something</button>
						<button className="rn-account-display-friends-nav-grid-user-set-list-btn definp">Something</button>
						<button className="rn-account-display-friends-nav-grid-user-set-list-btn definp">Something</button>
						<button className="rn-account-display-friends-nav-grid-user-set-list-btn definp">Something</button>
						<button className="rn-account-display-friends-nav-grid-user-set-list-btn definp">Something</button>
					</div>
				</div>
			</div>
		);
	}
}

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			stage: "GALLERY_STAGE", // TIMELINE_STAGE, FRIENDS_STAGE, GALLERY_STAGE
			friendsStage: "MAIN_STAGE"
		}
	}

	render() {
		return(
			<div className="rn rn-account">
				<div className="rn-account-thumb">
					<div className="rn-account-thumb-cover">
						<img
							className="rn-account-thumb-cover-img"
							title="User's cover"
							src={ image }
							alt="Cover"
						/>
						<input type="file" id="rn-account-thumb-cover-edit" />
						<label htmlFor="rn-account-thumb-cover-edit" className="rn-account-thumb-cover-edit definp">
							<i className="fas fa-camera-retro" />
							<span>Edit Cover</span>
						</label>
					</div>
					<div className="rn-account-thumb-nav">
						<div className="rn-account-thumb-nav-img">
							<img src={ image } alt="User" title="User's avatar" />
							<span className="rn-account-thumb-nav-name">Oles Odynets</span>
						</div>
						<ThumbNavButton
							title="Timeline"
							counter="0"
							active={ this.state.stage === "TIMELINE_STAGE" }
							ei={ false }
							_onClick={ () => this.setState({ stage: "TIMELINE_STAGE" }) }
						/>
						<ThumbNavButton
							title="Friends"
							counter="580"
							active={ this.state.stage === "FRIENDS_STAGE" }
							ei={ false }
							_onClick={ () => this.setState({ stage: "FRIENDS_STAGE" }) }
						/>
						<ThumbNavButton
							title="Gallery"
							counter="0"
							active={ this.state.stage === "GALLERY_STAGE" }
							ei={ false }
							_onClick={ () => this.setState({ stage: "GALLERY_STAGE" }) }
						/>
					</div>
				</div>
				<div className="rn-account-display">
					<div className={ `rn-account-display-item rn-account-display-timeline iostyle${ (this.state.stage !== "TIMELINE_STAGE") ? "" : " visible" }` }>
						<GridItem />
						<GridItem />
						<GridItem />
						<GridItem />
						<GridItem />
					</div>
					<div className={ `rn-account-display-item rn-account-display-friends${ (this.state.stage !== "FRIENDS_STAGE") ? "" : " visible" }` }>
						<div className="rn-account-display-item-title">
							Friends
						</div>
						<div className="rn-account-display-friends-nav">
							<div>
								<ThumbNavButton
									title="All Friends"
									counter="238"
									active={ this.state.friendsStage === "MAIN_STAGE" }
									ei={ true }
									_onClick={ () => this.setState({ friendsStage: "MAIN_STAGE" }) }
								/>
								<ThumbNavButton
									title="Friend Requests"
									counter="2"
									active={ this.state.friendsStage === "REQUESTS_STAGE" }
									ei={ true }
									_onClick={ () => this.setState({ friendsStage: "REQUESTS_STAGE" }) }
								/>
							</div>
							<div>
								<div className="rn-account-display-friends-nav-search">
									<input
										placeholder="Search..."
										type="text"
										className="rn-account-display-friends-nav-search-field definp"
									/>
									<div className="rn-account-display-friends-nav-search-icon">
										<i className="fas fa-search" />
									</div>
								</div>
							</div>
						</div>
						<div className="rn-account-display-friends-nav-grid">
							<FriendsGridFriend />
							<FriendsGridFriend />
						</div>
					</div>
					<div className={ `rn-account-display-item rn-account-display-gallery iostyle${ (this.state.stage !== "GALLERY_STAGE") ? "" : " visible" }` }>
						<div className="rn-account-display-gallery-new">
							<input
								type="file"
								id="rn-account-display-gallery-new-mat"
								className="hidden"
								onChange={ ({ target: { files } }) => null }
							/>
							<label htmlFor="rn-account-display-gallery-new-mat" className="rn-account-display-gallery-new-mat definp">
								<i className="fas fa-plus" />
							</label>
						</div>
						<div className="rn-account-display-gallery-grid">
							<div className="rn-account-display-gallery-grid-photo">
								<img src={ image } alt="In" title="User's photo" />
							</div>
							<div className="rn-account-display-gallery-grid-photo">
								<img src={ image } alt="In" title="User's photo" />
							</div>
							<div className="rn-account-display-gallery-grid-photo">
								<img src={ image } alt="In" title="User's photo" />
							</div>
							<div className="rn-account-display-gallery-grid-photo">
								<img src={ image } alt="In" title="User's photo" />
							</div>
							<div className="rn-account-display-gallery-grid-photo">
								<img src={ image } alt="In" title="User's photo" />
							</div>
							<div className="rn-account-display-gallery-grid-photo">
								<img src={ image } alt="In" title="User's photo" />
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default App;