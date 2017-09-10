import * as React from 'react'

export interface IProps {
  mod: Promise<any>
  loading?: React.SFC | React.ComponentClass
}

export interface IState {
  mod: JSX.Element
}

class Bundle extends React.Component<IProps, IState> {
  public state = { mod: null }

  public async componentWillMount() {
    const mod = await this.props.mod
    this.setState({ mod: mod.default })
  }

  public render() {
    const Mod = this.state.mod
    const Loading = this.props.loading || (() => <div />)
    return Mod ? <Mod /> : <Loading />
  }
}

export default Bundle
