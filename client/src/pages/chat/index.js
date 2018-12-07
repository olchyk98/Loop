import React, { Component } from 'react';
import './main.css';

const image = "https://lolstatic-a.akamaihd.net/frontpage/apps/prod/LolGameInfo-Harbinger/en_US/8588e206d560a23f4d6dd0faab1663e13e84e21d/assets/assets/images/gi-landing-top.jpg";

class ConversationMember extends Component {
	static defaultProps = {
		isMoreTrack: false,
		moreInt: 1
	}

	render() {
		return(
			<div className="rn-chat-conversations-item-content-members-item">
				{
					(!this.props.isMoreTrack) ? (
						<img
							className="rn-chat-conversations-item-content-members-item-mg"
							src={ image }
							alt="member"
							title="Conversation member"
						/>
					) : (
						<span className="rn-chat-conversations-item-content-members-item-mr">{ this.props.moreInt }+</span>
					)
				}
			</div>
		);
	}
}

class Conversation extends Component {
	static defaultProps = {
		color: "white"
	}

	render() {
		return(
			<div className={ `rn-chat-conversations-item ${ this.props.color }` }>
				<div className="rn-chat-conversations-item-previewimg">
					<div className="rn-chat-conversations-item-previewimg-image">
					<img className="rn-chat-conversations-item-previewimg-img" alt="member" src={ image } title="Conversation member" />
						<div className="rn-chat-conversations-item-previewimg-not" />
					</div>
				</div>
				<div className="rn-chat-conversations-item-content">
					<div className="rn-chat-conversations-item-content-title">
						<div>
							<span className="rn-chat-conversations-item-content-title-name">Oles Odynets</span>
							<span className="rn-chat-conversations-item-content-title-placeholder">•</span>
							<span className="rn-chat-conversations-item-content-title-time">13:24</span>
						</div>
						<div className="rn-chat-conversations-item-content-controls">
							<button className="rn-chat-conversations-item-content-controls-btn definp">
								<i className="fas fa-trash" />
							</button>
						</div>
					</div>
					<div className="rn-chat-conversations-item-content-last"> {/* className: lastinrow */}
						<span className="rn-chat-conversations-item-content-last-name">Oles Odynets</span>
						<span className="rn-chat-conversations-item-content-last-content">
							{ this.props.content }
						</span>
					</div>
					<div className="rn-chat-conversations-item-content-members">
						<ConversationMember
							isMoreTrack={ true }
							moreInt={ 2 }
						/>
						<ConversationMember
							
						/>
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
			stage: "LIST_STAGE"
		}
	}

	render() {
		return(
			<div className="rn rn-chat">
				<div className="rn-chat-search">
					{/* hide, if no conversations */}
					<input
						type="search"
						placeholder="Enter id, date of a last message or name..."
						className="definp rn-chat-search-field"
					/>
				</div>
				<div className="rn-chat-conversations">
					<Conversation
						content="Hello, World!"
						color="red"
					/>
					<Conversation
						content="Hello, World!  Hello, World!"
						color="blue"
					/>
					<Conversation
						content="Hello, World! Hello, World! Hello, World! Hello, World! Hello, World! Hello, World! Hello, World! Hello, World! Hello, World!"
						color="purple"
					/>
					<Conversation
						content="Hello, World!  Hello, World!"
						color="clouds"
					/>
					<Conversation
						content="Hello, World!  Hello, World!"
						color="sea"
					/>
					<Conversation
						content="Hello, World!"
						color="red"
					/>
					<Conversation
						content="Hello, World!"
						color="pink"
					/>
					<Conversation
						content="Hello, World!"
						color="orange"
					/>
					<Conversation
						content="Hello, World! Hello, World! Hello, World! Hello, World! Hello, World! Hello, World! Hello, World! Hello, World! Hello, World!"
						color="red"
					/>
				</div>
			</div>
		);
	}
}

export default App;