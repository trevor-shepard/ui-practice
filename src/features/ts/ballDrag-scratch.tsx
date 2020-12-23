import React, { ReactElement, useRef, ReactChild } from 'react'
import { range } from 'lodash'
import { interpolate, useSprings, animated as a } from 'react-spring'
import { useGesture } from 'react-use-gesture'
import { clamp } from 'lodash'
import styled from '@emotion/styled'

// Returns fitting styles for dragged/idle items

interface Props {
	items: ReactChild[]
	rowSize: number
	rowHeight: number
	colWidth: number
}
export default function Index({
	items,
	rowHeight,
	colWidth,
	rowSize
}: Props): ReactElement {
	// state
	const order = useRef(items.map((_, index) => index)) // Store indicies as a local ref, this represents the item order

	// constants
	const layout = range(items.length).map(index => {
		const row = Math.floor(index / rowSize)
		const col = index % rowSize
		return [colWidth * col, rowHeight * row]
	})

	// methods
	const getStyle = ({
		currOrder,
		down,
		originalIndex,
		mouseY,
		mouseX
	}: {
		currOrder?: any[]
		down?: boolean
		originalIndex?: number
		curIndex?: number
		mouseY?: number
		mouseX?: number
	}) => (index: number) => {
		if (down && index === originalIndex)
			return {
				y: mouseY,
				x: mouseX,
				scale: 1.1,
				zIndex: '1',
				shadow: 15
			}
		// @ts-ignore
		const [x, y] = layout[currOrder.indexOf(index)] as [number, number]

		return {
			x,
			y,
			scale: 1,
			zIndex: '0',
			shadow: 1
		}
	}

	function reinsert(arr: any[], from: number, to: number) {
		const _arr = arr.slice(0)
		const val = _arr[from]
		_arr.splice(from, 1)
		_arr.splice(to, 0, val)
		return _arr
	}

	// springs/gestures
	// @ts-ignore
	const [springs, setSprings] = useSprings(items.length, index => {
		const [x, y] = layout[index] as [number, number]
		return {
			x,
			y,
			scale: 1,
			zIndex: '0',
			shadow: 1
		}
	})

	const gestureConfig = {
		drag: {
			filterTaps: true,
			rubberband: true
		}
	}

	const bind = useGesture({
		onDrag: ({ args: [originalIndex], down, movement: [deltaX, deltaY] }) => {
			const curIndex = order.current.indexOf(originalIndex)
			const [initialX, initialY] = layout[curIndex]
			const [x, y] = [initialX + deltaX, initialY + deltaY]

			const col = clamp(Math.floor(x / colWidth), 0, rowSize - 1)
			const row = clamp(
				Math.floor(y / rowHeight),
				0,
				Math.floor(items.length / rowSize)
			)
			const index = row * rowSize + col

			const newOrder = reinsert(order.current, curIndex, index)

			setSprings(
				// @ts-ignore
				getStyle({
					currOrder: newOrder,
					down,
					originalIndex,
					curIndex,
					mouseX: x,
					mouseY: y
				})
			)
			if (!down) order.current = newOrder
		},
		// @ts-ignore
		gestureConfig
	})

	return (
		<div className="content" style={{ height: '100%', width: '100%' }}>
			{springs.map(({ zIndex, shadow, y, x, scale }, i) => (
				<Animated
					{...bind(i)}
					key={i}
					style={{
						// @ts-ignore
						zIndex,
						boxShadow: shadow.interpolate(
							s => `rgba(0, 0, 0, 0.15) 0px ${s}px ${2 * s}px 0px`
						),
						transform: interpolate(
							[x, y, scale],
							(x, y, s) => `translate3d(${x}px,${y}px,0) scale(${s})`
						)
					}}
					children={items[i]}
				/>
			))}
		</div>
	)
}

const Animated = styled(a.div)`
	position: absolute;
	pointer-events: auto;
`
