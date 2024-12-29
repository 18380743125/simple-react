import React from "./react";
import ReactDOM from "./react-dom";

class MyClassComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      list: [
        {
          key: 1,
          name: "A",
        },
        {
          key: 2,
          name: "B",
        },
        {
          key: 3,
          name: "C",
        },
        {
          key: 4,
          name: "D",
        },
        {
          key: 5,
          name: "E",
        },
      ],
    };
  }

  handleClick() {
    let { count } = this.state;
    this.setState({
      count: count + 1,
      list: [
        {
          key: 3,
          name: "C",
        },
        {
          key: 2,
          name: "B",
        },
        {
          key: 5,
          name: "E",
        },
        {
          key: 6,
          name: "F",
        },
        {
          key: 1,
          name: "A",
        },
      ],
    });
  }

  render() {
    const { count, list } = this.state;

    return (
      <div style={{ color: "black" }}>
        <div style={{ display: "flex", gap: "20px" }}>
          Hello Simple React
          <span>{count}</span>
          <button onClick={this.handleClick.bind(this)}>点我</button>
        </div>
        <div>
          <ul>
            {list.map((item) => (
              <li key={item.key}>{item.name}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <MyClassComponent a={1} b={2} />,
  document.getElementById("root")
);
