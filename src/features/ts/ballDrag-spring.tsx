import React, { ReactElement, useState, useEffect, useRef } from 'react'
import { range } from 'lodash'
import { interpolate, useSprings, animated as a } from 'react-spring'
import { useGesture } from 'react-use-gesture'
import { clamp } from 'lodash'
import styled from '@emotion/styled'
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

const layout = range(count).map(n => {
	const row = Math.floor(n / 3)
	const col = n % 3
	return [width * col, height * row]
})

// Returns fitting styles for dragged/idle items
const fn = ({
	order,
	down,
	originalIndex,
	curIndex,
	y,
	x
}: {
	order: any[]
	down?: boolean
	originalIndex?: number
	curIndex?: number
	y?: number
	x?: number
}) => (index: number) => {
	if (down && index === originalIndex)
		return {
			y,
			x,
			scale: 1.1,
			zIndex: '1',
			shadow: 15,
			immediate: (n: any) => n === 'y' || n === 'zIndex'
		}

	const position = layout[order.indexOf(originalIndex)] as [number, number]

	return {
		x: position[0],
		y: position[1],
		scale: 1,
		zIndex: '0',
		shadow: 1,
		immediate: false
	}
}

function reinsert(arr: any[], from: number, to: number) {
	const _arr = arr.slice(0)
	const val = _arr[from]
	_arr.splice(from, 1)
	_arr.splice(to, 0, val)
	return _arr
}
export default function Index({ items }: { items: string[] }): ReactElement {
	const order = useRef(items.map((_, index) => index)) // Store indicies as a local ref, this represents the item order
	const [springs, setSprings] = useSprings(items.length, i => ({
		y: i * 100,
		scale: 1,
		zIndex: '0',
		shadow: 1,
		immediate: false
	})) // Create springs, each corresponds to an item, controlling its transform, scale, etc.
	// @ts-ignore
	const bind = useGesture(({ args: [originalIndex], down, delta: [x, y] }) => {
		const curIndex = order.current.indexOf(originalIndex)
		const curRow = clamp(
			Math.round((curIndex * 100 + y) / 100),
			0,
			items.length - 1
		)

		const newOrder = reinsert(order.current, curIndex, curRow)
		// @ts-ignore
		setSprings(fn({ order: newOrder, down, originalIndex, curIndex, y })) // Feed springs new style data, they'll animate the view without causing a single render
		if (!down) order.current = newOrder
	})

	return (
		<div className="content" style={{ height: items.length * 100 }}>
			{springs.map(({ zIndex, shadow, y, scale }, i) => (
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
							[y, scale],
							(y, s) => `translate3d(0,${y}px,0) scale(${s})`
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
	width: 320px;
	height: 90px;
	overflow: visible;
	pointer-events: auto;
	transform-origin: 50% 50% 0px;
	border-radius: 5px;
	color: white;
	line-height: 90px;
	padding-left: 32px;
	font-size: 14.5px;
	background: lightblue;
	text-transform: uppercase;
	letter-spacing: 2px;
`
