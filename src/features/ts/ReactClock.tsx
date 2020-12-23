import React, {
	ReactElement,
	useState,
	useEffect,
	useRef,
	useMemo
} from 'react'
import { useSpring, useSprings, animated as a } from 'react-spring'
import styled from '@emotion/styled'

function getHourCoordinates(radius: number) {
	const coordinates: [number, number][] = []
	for (let index = 0; index < 12; index++) {
		const x = radius * Math.cos(Math.PI / -2 + (2 * index * Math.PI) / 12) + 2.5
		const y = radius * Math.sin(Math.PI / -2 + (2 * index * Math.PI) / 12)

		coordinates.push([x, y])
	}

	return coordinates
}

function getSecondCoordinates(radius: number) {
	const coordinates: [number, number][] = []
	for (let index = 0; index < 60; index++) {
		const x = radius * Math.cos(Math.PI / -2 + (2 * index * Math.PI) / 60) + 2.5
		const y = radius * Math.sin(Math.PI / -2 + (2 * index * Math.PI) / 60)

		coordinates.push([x, y])
	}

	return coordinates
}

interface Props {
	size: number
}

export default function Clock({ size }: Props): ReactElement {
	const secondCoordinates = useMemo(() => getSecondCoordinates(size - 20), [
		size
	])
	const minutesCoordinates = useMemo(
		() => getSecondCoordinates(((size - 20) / 3) * 2),
		[size]
	)
	const hoursCoordinates = useMemo(() => getHourCoordinates((size + 10) / 3), [
		size
	])

	const timeRef = useRef(Date.now() - 1000)
	const [seconds, setSeconds] = useState(Math.floor(Date.now() / 1000))

	const [secondsProps, setSecondsSpring] = useSpring(() => ({
		xy: secondCoordinates[(seconds + 1) % 60],
		config: {
			duration: 1000
		}
	}))
	const [minutesProps, setMinutesSpring] = useSpring(() => ({
		xy: minutesCoordinates[(Math.floor(seconds / 60) + 1) % 60],
		config: {
			duration: 60000
		}
	}))
	const [hoursProps, setHoursSpring] = useSpring(() => ({
		xy: hoursCoordinates[(Math.floor(seconds / 3600) + 1) % 12],
		config: {
			duration: 3600000
		}
	}))

	const [positionSprings, setPositionSprings] = useSprings(60, () => ({
		opacity: 0,
		config: { duration: 1000 }
	}))

	useEffect(() => {
		const now = Date.now()
		const expected = timeRef.current + 1000
		const delta = expected - now
		const cleanUp = setTimeout(() => {
			timeRef.current = now
			setSeconds(seconds + 1)
			setHoursSpring({
				xy: hoursCoordinates[(Math.floor(seconds / 3600) + 1) % 12]
			})
			setMinutesSpring({
				xy: minutesCoordinates[(Math.floor(seconds / 60) + 1) % 60]
			})
			setSecondsSpring({ xy: secondCoordinates[(seconds + 1) % 60] })

            // @ts-ignore
			setPositionSprings(index => {
				const isPointing = seconds % 60 === index
				return { opacity: isPointing ? 1 : 0 }
			})
		}, 1000 + delta)
		return () => clearTimeout(cleanUp)
	}, [
		timeRef,
		seconds,
		hoursCoordinates,
		minutesCoordinates,
		secondCoordinates,
		setHoursSpring,
		setMinutesSpring,
		setSecondsSpring
	])

	return (
		<Container>
			<Rim size={size}>
				{positionSprings.map(({ opacity }, index) => {
					const [x, y] = secondCoordinates[index]

					return (
						<Position
							style={{
								transform: `translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`,
								opacity
							}}
						> {index + 1}</Position>
					)
				})}
				<Center>
					<Ticker
						style={{
							transform: secondsProps.xy.interpolate(
								// @ts-ignore
								(x: number, y: number) =>
									`translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`
							)
						}}
					>
						{}
					</Ticker>
					<Ticker
						style={{
							transform: minutesProps.xy.interpolate(
								// @ts-ignore
								(x: number, y: number) =>
									`translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`
							)
						}}
					>
						{Math.floor(seconds / 60) % 60}
					</Ticker>
					<Ticker
						style={{
							transform: hoursProps.xy.interpolate(
								// @ts-ignore
								(x: number, y: number) =>
									`translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`
							)
						}}
					>
						{(Math.floor(seconds / 3600) + 1) % 12}
					</Ticker>
				</Center>
			</Rim>
		</Container>
	)
}

const Container = styled.div`
	width: 100vw;
	height: 100vh;
	background-color: grey;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`

const Rim = styled.div<{ size: number }>`
	width: ${({ size }) => `${size * 2}px`};
	height: ${({ size }) => `${size * 2}px`};
	border-radius: 50%;
	border: 2px solid black;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`

const Center = styled.div`
	height: 5px;
	width: 5px;
	border-radius: 50%;
	border: 2px solid black;
	position: relative;
	background-color: black;
`

const Ticker = styled(a.div)`
	height: 20px;
	width: 20px;
	border-radius: 50%;
	border: 2px solid black;
	text-align: center;
`

const Position = styled(a.div)`
    position: absolute;
`