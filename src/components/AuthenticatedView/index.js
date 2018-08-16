import React, { PureComponent } from 'react'

import { connectStore } from '../../redux'

@connectStore('config')
export default class AuthenticatedView extends PureComponent {
  render () {
    const { getAuthKey } = this.props.selectors
    const { children } = this.props

    const hasAuthKey = !!getAuthKey()

    return (
      <div>
        {hasAuthKey ? children : (
          <button onClick={this._onPress}>Please sign in</button>
        )}
      </div>
    )
  }

  _onPress = () => {
    this.props.actions.authenticate()
  }
}
