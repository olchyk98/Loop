import React from 'react';

const NoteCreatorInput = ({ valid, title, example, value, _style, _onChange }) => (
	<div className="rn-notes-previewmodal-input" style={ _style }>
		<p className="rn-notes-previewmodal-input-title">{ title }</p>
		<div className="rn-notes-previewmodal-input-mat">
			<input
				className="definp"
				placeholder={ example }
				type="text"
				pattern={ valid }
				value={ value }
				onChange={ ({ target: { value } }) => _onChange(value) }
				required
			/>
			<div />
		</div>
	</div>
)

export default NoteCreatorInput;