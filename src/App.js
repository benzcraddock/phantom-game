import React, { useState, useRef, useEffect } from 'react'
import './App.css'
import { useInterval } from './useInterval'
import {
  CANVAS_SIZE,
  PHANTOM_START,
  RAT_START,
  SCALE,
  SPEED,
  DIRECTIONS
} from './constants'

const App = () => {
  const canvasRef = useRef()
  const [phantom, setPhantom] = useState(PHANTOM_START)
  const [rat, setRat] = useState(RAT_START)
  const [dir, setDir] = useState([0, -1])
  const [speed, setSpeed] = useState(null)
  const [gameOver, setGameOver] = useState(false)

  useInterval(() => gameLoop(), speed)

  const startGame = () => {
    setPhantom(PHANTOM_START)
    setRat(RAT_START)
    setDir([0, -1])
    setSpeed(SPEED)
    setGameOver(false)
  }

  const endGame = () => {
    setSpeed(null)
    setGameOver(true)
  }

  const movePhantom = ({ keyCode }) =>
    keyCode >= 37 && keyCode <= 40 && setDir(DIRECTIONS[keyCode])

  const createRat = () =>
    // create new rat
    // map rat, create random # and multiply by canvas size at index i / scale to obtain create unitsv
    rat.map((_r, i) => Math.floor(Math.random() * (CANVAS_SIZE[i] / SCALE)))

  const checkCrash = (piece, phant = phantom) => {
    // if head of phantom is >= canvas size and has crashed into wall
    if(
      piece[0] * SCALE >= CANVAS_SIZE[0] ||
      piece[0] < 0 ||
      piece[1] * SCALE >= CANVAS_SIZE[1] ||
      piece[1] < 0
    )
    return true
    for (const segment of phant) {
      if (piece[0] === segment[0] && piece[1] === segment[1]) return true
    }
    return false
  }

  const checkRatCrash = newPhantom => {
    // check if new phantom (first segment is the head of the phantom, then x coordinate) collides with rat
    if (newPhantom[0][0] === rat[0] && newPhantom[0][1] === rat[1]) {
      let newRat = createRat()
      // as long as crash with phantom is true, we create a new rat until it doesnt crash w phantom
      while (checkCrash(newRat, newPhantom)) {
        newRat = createRat()
      }
      setRat(newRat)
      return true
    }
    return false
  }

  const gameLoop = () => {
    // create copy of multi dimensional phantom array
    const phantomCopy = JSON.parse(JSON.stringify(phantom))
    // head will always be first element in array, add directions for x and y coordinates
    const newPhantomHead = [phantomCopy[0][0] + dir[0], phantomCopy[0][1] + dir[1]]
    // add new element to top of array
    phantomCopy.unshift(newPhantomHead)

    if (checkCrash(newPhantomHead)) endGame()
    // if we dont crash, we pop the tail off of the phantom and remove last element of array
    if (!checkRatCrash(phantomCopy)) phantomCopy.pop()
    // set state
    setPhantom(phantomCopy)
  }

  useEffect(() => {
    // obtain context to be able to draw on canvas
    const context = canvasRef.current.getContext('2d')
    // when canvas renders, set scale so it resets each time to const
    context.setTransform(SCALE, 0, 0, SCALE, 0, 0)
    // clear canvas
    context.clearRect(0, 0, window.innerWidth, window.innerHeight)
    // style for phantom
    context.fillStyle = '#ecebf3'
    // phantom is in state, loop w forEach by destructuring x, y and draw in canvas using fillRect
    phantom.forEach(([x, y]) => context.fillRect(x, y, 1, 1))
    // style for rat
    context.fillStyle = '#99582a'
    context.fillRect(rat[0], rat[1], 1, 1)
  }, [phantom, rat, gameOver])

  return (
    <div className='wrapper'>
      <div className='header'>
          <h1>Let's Play Phantom Game!</h1>
          <h2>👻 You are the phantom! 👻 </h2>
          <h2>🐀 Your goal is to try to catch as many rats in the sewers as possible 🐀</h2>
          <h2>👾 This is a PXN mini game inspired by Snake Game, built by Benye (discord id: benyetothe#1279) 👾</h2>
      </div>
      <div className='grid'>
        <div role='button' tabIndex='0' onKeyDown={e => movePhantom(e)}>
          <canvas
            style={{ border: '5px solid black' }}
            ref={canvasRef}
            width={`${CANVAS_SIZE[0]}px`}
            height={`${CANVAS_SIZE[1]}px`}
          />
        <div className='buttonWrapper'>
          <button onClick={startGame}>Start Game</button>
        </div>
        <div className='gameOver'>
          {gameOver && <h3>Game Over! Play again?</h3>}
        </div>
        </div>
      </div>
    </div>
  )
}

export default App
