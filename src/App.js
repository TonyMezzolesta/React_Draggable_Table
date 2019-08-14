import React from "react";
import ReactDOM from "react-dom";
import { tableData, tableHeader } from "./tableInfo.js";
import DraggableTable from "./DraggableTable";
import "./App.css";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      value: 5
    };
  }

  handleChange(e) {
    this.setState({
      value: parseInt(e.target.value)
    });
  }

  //render the component
  render() {
    return (
      <div>
        {/* <div className="card">
          <div className="container">
            <h4>
              <b>Rows in table per page</b>
            </h4>
            <input
              value={this.state.inputValue}
              onChange={evt => this.handleChange(evt)}
            />
          </div>
        </div> */}
        <div>
          <DraggableTable
            columns={tableHeader}
            data={tableData}
            rowsPerPage={this.state.value}
          />
        </div>
      </div>
    );
  }
}

export default App;
