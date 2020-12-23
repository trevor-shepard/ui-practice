import React, { ReactElement, useState, useEffect, useRef, useMemo } from 'react'
import { useSpring, animated as a } from 'react-spring'
import styled from '@emotion/styled'


// drawHours(int radius, int cx, int cy) {
//     for(int i = 1; i <= 12; i++) {
//       double x =  + cx
//       double y = radius * Math.sin(Math.PI / -2 + (2 * i * Math.PI) / 12) + cy
  
//       String text = Integer.toString(i);
//       //draw text at [x, y] using style 'text-anchor' set to 'middle' and 'alignment-baseline' set to 'middle'
//     }
//   }

function getHourCoordinates(radius: number) { 
    const coordinates: [number, number][] = []
    for (let index = 0; index < 12; index++) {
        const x = radius * Math.cos(Math.PI / -2 + (2 * index * Math.PI) / 12)
        const y = radius * Math.sin(Math.PI / -2 + (2 * index * Math.PI) / 12)

        coordinates.push([x, y])
    }
   
    return [...coordinates.slice(1), coordinates[0]]
}

function getSecondCoordinates(radius: number) { 
    const coordinates: [number, number][] = []
    for (let index = 0; index < 60; index++) {
        const x = radius * Math.cos(Math.PI / -2 + (2 * index * Math.PI) / 60)
        const y = radius * Math.sin(Math.PI / -2 + (2 * index * Math.PI) / 60)

        coordinates.push([x, y])
    }

    return [...coordinates.slice(1), coordinates[0]]

}


export default function Clock(): ReactElement {
    const hoursCoordinates = useMemo(()=> getHourCoordinates(50), [])
    const minutesCoordinates = useMemo(()=> getSecondCoordinates(70), [])
    const secondCoordinates = useMemo(()=> getSecondCoordinates(80), [])

	const timeRef = useRef({ prevTime: Date.now() - 1000 })
	const [secondsProps, setSecondsSpring] = useSpring(() => ({
		xy: secondCoordinates[0]
	}))
	const [minutesProps, setMinutesSpring] = useSpring(() => ({
		xy: minutesCoordinates[0]
	}))
	const [HoursProps, setHoursSpring] = useSpring(() => ({
		xy: hoursCoordinates[0]
	}))
	const [seconds, setSeconds] = useState(55)
    const toggleRef = useRef<boolean>(false)
    
	useEffect(() => {
		const { prevTime } = timeRef.current
		toggleRef.current = !toggleRef.current

		const now = Date.now()
		const expected = prevTime + 1000
		const delta = expected - now
		console.log(delta)
		timeRef.current.prevTime = now
		setTimeout(() => {
            setSeconds(seconds + 1)
            setHoursSpring({ xy: hoursCoordinates[(Math.floor(seconds / 3600)) % 12] })
            setMinutesSpring({ xy: minutesCoordinates[Math.floor(seconds / 60) % 60] })
            setSecondsSpring({ xy: secondCoordinates[(seconds + 1) % 60]})
		}, 1000 + delta)
	}, [seconds])

	return (
		<Container>
			<Center>
				<Ticker
					style={{
						transform: secondsProps.xy.interpolate(
                            // @ts-ignore
							(x: number, y: number) =>
								`translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`
						)
					}}
				> {seconds % 60}
                </Ticker>
				<Ticker
					style={{
						transform: minutesProps.xy.interpolate(
                            // @ts-ignore
							(x: number, y: number) =>
								`translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`
						)
					}}
				> {Math.floor(seconds / 60)}
                </Ticker>
				<Ticker
					style={{
						transform: minutesProps.xy.interpolate(
                            // @ts-ignore
							(x: number, y: number) =>
								`translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`
						)
					}}
				> {Math.floor(seconds / 3600)}
                </Ticker>
			</Center>
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

const Center = styled.div`
	height: 20px;
	width: 20px;
	border-radius: 50%;
	border: 2px solid black;
	position: relative;
`

const Ticker = styled(a.div)`
	height: 20px;
	width: 20px;
	border-radius: 50%;
	border: 2px solid black;
`
