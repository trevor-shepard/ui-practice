import React from 'react'
import './App.css'

import BallDrag from 'features/ts/ballDrag-scratch'

function App() {
	return (
		<BallDrag
			rowSize= {5}
			height={200}
			width={200}
			items={'what ever hi bhi sadfi ii were i is cleaver duh'.split(' ')}
		/>
	)
}

export default App
