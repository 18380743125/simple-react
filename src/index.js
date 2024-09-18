import React from "./react";
import ReactDOM from './react-dom';
import {Component} from "./Component";

function MyFunctionComponent(props) {
  return (
    <div style={{color: 'black', display: 'flex', gap: '30px'}}>
      Hello Simple React
      <span>xx1</span>
      <span>xx2</span>
    </div>
  )
}

class MyClassComponent extends Component {

  constructor(props) {
    super(props);
    this.state = {count: 0}
  }

  handleClick() {
    let {count} = this.state
    this.setState({count: count + 1})
  }

  render() {
    return (
      <div style={{color: 'black', display: 'flex', gap: '30px'}}>
        Hello Simple React
        <span>{this.props.a}</span>
        <span>{this.props.b}</span>
        <span>{this.state.count}</span>
        <button onClick={this.handleClick.bind(this)}>点我</button>
      </div>
    )
  }
}


ReactDOM.render(
  <MyClassComponent a={1} b={2}/>,
  document.getElementById('root')
)
