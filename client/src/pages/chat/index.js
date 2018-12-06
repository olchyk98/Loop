import React, { Component } from 'react';
import './main.css';

const image = "https://lolstatic-a.akamaihd.net/frontpage/apps/prod/LolGameInfo-Harbinger/en_US/8588e206d560a23f4d6dd0faab1663e13e84e21d/assets/assets/images/gi-landing-top.jpg";

class Conversation extends Component {
	render() {
		return(
			<div className="rn-chat-conversations-item">
				<div className="rn-chat-conversations-item-previewimg">
					<div className="rn-chat-conversations-item-previewimg-image">
					<img className="rn-chat-conversations-item-previewimg-img" alt="member" src={ image } title="Conversation's member" />
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
						<div></div>
					</div>
				</div>
			</div>
		);
	}
}

class App extends Component {
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
					<Conversation />
				</div>
			</div>
		);
	}
}

export default App;