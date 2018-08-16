import React, { PureComponent } from 'react'

import { connectStore } from '../../redux'
import AuthenticatedView from '../../components/AuthenticatedView'
import GameBoard from '../../components/GameBoard'
import Ship from '../../components/Ship'
import { getColor, shipSitsOn, shipCanBePlaced, calculateShipEndPoint } from '../../utils/ships'

import styles from './index.styl'

@connectStore()
export default class NewGame extends PureComponent {
  state = {
    maxRounds: 30,
    boardLength: 10,
    shipLengths: [ 5, 4, 3, 3, 2 ],
    shipPositions: {},
    shipPositionBits: 0,
    selectedShip: null
  }

  render () {
    const { boardLength, shipLengths, shipPositions } = this.state

    const allShipsPlaced = (Object.keys(shipPositions).length === shipLengths.length)

    return (
      <AuthenticatedView>
        <div className={styles.selectableShips}>
          {this._renderShipSelector()}
        </div>
        <GameBoard
          boardLength={boardLength}
          shipLengths={shipLengths}
          shipPositions={shipPositions}
          onPress={this._onSelectCell}
          applyHoverStyleToEmptyCell={this._applyHoverStyleToEmptyCell}
        />
        <button disabled={!allShipsPlaced} onClick={this._onStartGame}>Start game</button>
      </AuthenticatedView>
    )
  }

  _renderShipSelector = () => {
    const { shipLengths, shipPositions } = this.state

    const ships = []

    shipLengths.forEach((length, shipId) => {
      // if already placed ship then skip it
      if (shipPositions[shipId]) {
        return
      }

      const onPress = this._buildShipSelector(shipId)

      ships.push(
        <div key={shipId} className={styles.selectableShip}>
          <Ship size={1} length={length} isVertical={false} onPress={onPress} />
          {1 < length ? (
            <Ship size={1} length={length} isVertical={true} onPress={onPress} />
          ) : null}
        </div>
      )
    })

    return ships
  }

  _buildShipSelector = shipId => isVertical => {
    this.setState({
      selectedShip: {
        shipId, isVertical
      }
    })
  }

  _onSelectCell = (x, y) => {
    const { boardLength, shipPositions, shipLengths, selectedShip } = this.state

    let foundShip

    // if there is a ship in this position then remove it
    Object.keys(shipPositions).forEach(id => {
      if (shipSitsOn(shipPositions[id], shipLengths[id], x, y)) {
        foundShip = id
      }
    })

    if (foundShip) {
      delete shipPositions[foundShip]

      this.setState({
        shipPositions: {
          ...shipPositions
        }
      })
    }
    // no ship at position, so let's add one!
    else if (selectedShip) {
      const { shipId, isVertical } = selectedShip

      if (shipCanBePlaced(boardLength, shipPositions, shipLengths, shipId, isVertical, x, y)) {
        this.setState({
          selectedShip: null,
          shipPositions: {
            ...shipPositions,
            [shipId]: {
              x, y, isVertical
            }
          }
        })
      }
    }
  }

  _applyHoverStyleToEmptyCell = (style, x, y, hoverX, hoverY) => {
    const { boardLength, shipLengths, shipPositions, selectedShip } = this.state

    if (selectedShip) {
      const { shipId, isVertical } = selectedShip

      if (shipCanBePlaced(
        boardLength, shipPositions, shipLengths, shipId, isVertical, hoverX, hoverY
      )) {
        const { x: endX, y: endY } =
          calculateShipEndPoint(hoverX, hoverY, isVertical, shipLengths[shipId])

        // if current cell intersects potential ship position
        if ((hoverX <= x && endX >= x) && (hoverY <= y && endY >= y)) {
          const color = getColor(shipLengths[selectedShip.shipId])

          // eslint-disable-next-line no-param-reassign
          style.border = `1px solid ${color}`
          // eslint-disable-next-line no-param-reassign
          style.backgroundColor = color
        }
      } else if (x === hoverX && y === hoverY) {
        // eslint-disable-next-line no-param-reassign
        style.backgroundColor = '#999'
      }
    }
  }

  _onStartGame = () => {
    this.props.actions.createNewGame(this.state)
  }
}
