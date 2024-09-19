import React from "./react";
import ReactDOM from './react-dom';

const ForwardRefComponent = React.forwardRef((props, ref) => {
  return (
    <div style={{color: 'black', display: 'flex', gap: '30px'}}>
      Hello Simple React
      <span>xx1</span>
      <span ref={ref}>xx2</span>
    </div>
  )
})

class InputClassComponent extends React.Component {

  constructor(props) {
    super(props);
    this.inputRef = React.createRef()
  }

  focus() {
    this.inputRef.current.focus()
  }

  render() {
    return <input ref={this.inputRef}/>
  }
}

class MyClassComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {count: 0}

    this.wrapperRef = React.createRef()
    this.inputRef = React.createRef()

    setTimeout(() => {
      this.inputRef.current.focus()
      console.log(this.wrapperRef)
    }, 500)
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
        <InputClassComponent ref={this.inputRef}/>
        <ForwardRefComponent ref={this.wrapperRef}/>
      </div>
    )
  }
}


ReactDOM.render(
  <MyClassComponent a={1} b={2}/>,
  document.getElementById('root')
)
