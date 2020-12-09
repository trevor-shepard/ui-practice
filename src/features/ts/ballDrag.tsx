import React, { ReactElement, useState, useEffect } from 'react'
import { Motion, spring } from 'react-motion'
import { range } from 'lodash'

const springSetting1 = { stiffness: 180, damping: 10 }
const springSetting2 = { stiffness: 120, damping: 17 }

// props

const allColors = [
	'#EF767A',
	'#456990',
	'#49BEAA',
	'#49DCB1',
	'#EEB868',
	'#EF767A',
	'#456990',
	'#49BEAA',
	'#49DCB1',
	'#EEB868',
	'#EF767A'
]

const [count, width, height] = [11, 70, 90]

export default function Index(): ReactElement {
	// state
	const [mouseXY, setMouseXY] = useState([0, 0])
	const [mouseCircleDelta, setMouseCircleDelta] = useState([0, 0])
	const [lastPress, setLastPress] = useState<null | number>(null)
	const [isPressed, setIsPressed] = useState(false)
	const [order, setOrder] = useState(range(count))

	// util methods
	function reinsert(arr: any[], from: number, to: number) {
		const _arr = arr.slice(0)
		const val = _arr[from]
		_arr.splice(from, 1)
		_arr.splice(to, 0, val)
		return _arr
	}

	function clamp(n: number, min: number, max: number) {
		return Math.max(Math.min(n, max), min)
	}

	// handle ui input
	const handleMouseDown = (
		key: number,
		[pressX, pressY]: [number, number],
		{ pageX, pageY }: { pageX: number; pageY: number }
	) => {
		try {
			setMouseXY([pressX, pressY])
			setLastPress(key)
			setIsPressed(true)
			setMouseCircleDelta([pageX - pressX, pageY - pressY])
		} catch (error) {
			debugger
		}
	}

	const handleMouseUp = () => {
		setIsPressed(false)
		setMouseCircleDelta([0, 0])
	}

	const handleMouseMove = ({
		pageX,
		pageY
	}: {
		pageX: number
		pageY: number
	}) => {
		if (isPressed) {
			const [dx, dy] = mouseCircleDelta
			const _mouseXY = [pageX - dx, pageY - dy]
			const col = clamp(Math.floor(_mouseXY[0] / width), 0, 2)
			const row = clamp(
				Math.floor(_mouseXY[1] / height),
				0,
				Math.floor(count / 3)
			)
			const index = row * 3 + col
			const newOrder = reinsert(
				order,
				order.indexOf(lastPress as number),
				index
			)
			setMouseXY(_mouseXY)
			setOrder(newOrder)
		}
	}

	const handleTouchStart = (
		key: number,
		pressLocation: [number, number],
		e: React.TouchEvent
	) => {
		handleMouseDown(key, pressLocation, e.touches[0])
	}

	const handleTouchMove = (e: TouchEvent) => {
		e.preventDefault()
		handleMouseMove(e.touches[0])
	}

	// vars
	const layout = range(count).map(n => {
		const row = Math.floor(n / 3)
		const col = n % 3
		return [width * col, height * row]
	})

	// effects
	useEffect(() => {
		window.addEventListener('touchmove', handleTouchMove)
		window.addEventListener('touchend', handleMouseUp)
		window.addEventListener('mousemove', handleMouseMove)
		window.addEventListener('mouseup', handleMouseUp)
		return () => {
			window.addEventListener('touchmove', handleTouchMove)
			window.addEventListener('touchend', handleMouseUp)
			window.addEventListener('mousemove', handleMouseMove)
			window.addEventListener('mouseup', handleMouseUp)
		}
	}, [handleMouseMove])

	return (
		<div className="demo2">
			{order.map((_, key) => {
				let style
				let x: number
				let y: number
				const visualPosition = order.indexOf(key)
				if (key === lastPress && isPressed) {
					;[x, y] = mouseXY
					style = {
						translateX: x,
						translateY: y,
						scale: spring(1.2, springSetting1),
						boxShadow: spring((x - (3 * width - 50) / 2) / 15, springSetting1)
					}
				} else {
					;[x, y] = layout[visualPosition]
					style = {
						translateX: spring(x, springSetting2),
						translateY: spring(y, springSetting2),
						scale: spring(1, springSetting1),
						boxShadow: spring((x - (3 * width - 50) / 2) / 15, springSetting1)
					}
				}
				return (
					<Motion key={key} style={style}>
						{({ translateX, translateY, scale, boxShadow }) => (
							<div
								onMouseDown={({ pageX, pageY }) =>
									handleMouseDown(key, [x, y], { pageX, pageY })
								}
								onTouchStart={e => handleTouchStart(key, [x, y], e)}
								className="demo2-ball"
								style={{
									backgroundColor: allColors[key],
									WebkitTransform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
									transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
									zIndex: key === lastPress ? 99 : visualPosition,
									boxShadow: `${boxShadow}px 5px 5px rgba(0,0,0,0.5)`
								}}
							/>
						)}
					</Motion>
				)
			})}
		</div>
	)
}
