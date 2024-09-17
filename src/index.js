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
  render() {
    return (
      <div style={{color: 'black', display: 'flex', gap: '30px'}}>
        Hello Simple React
        <span>{this.props.a}</span>
        <span>{this.props.b}</span>
      </div>
    )
  }
}


ReactDOM.render(
  <MyClassComponent a={1} b={2}/>,
  document.getElementById('root')
)
