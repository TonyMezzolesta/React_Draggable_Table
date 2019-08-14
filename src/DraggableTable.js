import React from "react";
import PropTypes from "prop-types";
import "./DraggableTable.css";

class DraggableTable extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      data: this.props.data,
      columns: this.props.columns,
      rowsPerPage: this.props.rowsPerPage,
      tableData: [],
      tableColumns: [],
      expanded: false,
      page: 0,
      value: 0,
      order: "asc",
      orderBy: ""
    };
  }

  currentColumn = {};
  searchValues = {
    inputValue: {},
    inputColumn: {}
  };
  arrPages = [];

  componentDidMount = () => {
    this.inputValue = {};
    this.inputColumn = {};
    this.getDataForTable();
  };

  componentDidUpdate(prevProps) {
    let rowsPerPage = 5; //set default
    if (
      this.props.data != prevProps.data ||
      this.props.columns != prevProps.columns ||
      this.props.rowsPerPage != prevProps.rowsPerPage
    ) {
      // Check if it's a new user, you can also use some unique property, like the ID  (this.props.user.id !== prevProps.user.id)
      this.inputValue = {};
      this.inputColumn = {};
    }
  }

  handleChange = (event, value) => {
    this.searchValues.inputValue = event.target.value;
    this.searchValues.inputColumn = event.target.name;
    this.FilterObjects();
    //this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  handleExpandClick = prop => {
    this.setState(state => ({ expanded: !state.expanded }));
  };

  generateKeys = obj => {
    var hasOwn = Object.prototype.hasOwnProperty;
    var keys = [],
      name;
    for (name in obj) {
      if (hasOwn.call(obj, name)) {
        keys.push(name);
      }
    }
    return keys;
  };

  organizeColumns(dataColumns, userColumns) {
    const orgColumns = [];

    userColumns.map(rowUser => {
      dataColumns.map(rowData => {
        if (rowUser.columnLink === rowData) {
          orgColumns.push(rowUser);
        }
      });
    });

    return orgColumns;
  }

  getDataForTable = () => {
    const tableData = [];

    const { data, columns } = this.state;

    //get columns from dataset fields
    let arrayColumns = this.generateKeys(data[0]);
    let orgColumns = this.organizeColumns(arrayColumns, columns);

    data.map(html => {
      let values = [];
      orgColumns.map(dynamicinator => {
        values.push({
          rowKey: html.id,
          rowData: eval("html." + dynamicinator.columnLink)
        });
      });

      tableData.push(values);
    });

    this.setState(
      { tableData: tableData, tableColumns: orgColumns },
      this.setPages(tableData)
    );
  };

  reOrderColumns = droppedColumn => {
    const { columns } = this.state;

    var from = columns.indexOf(this.currentColumn);
    var to = columns.indexOf(droppedColumn);
    if (from < to) to - 2;
    columns.splice(to, 0, columns.splice(from, 1)[0]);

    this.setState({ columns: columns }, this.getDataForTable);
  };

  FilterObjects() {
    const { tableColumns } = this.state;
    const { inputValue, inputColumn } = this.searchValues;
    const tableData = [];

    var regValue = new RegExp(inputValue, "g");

    // Otherwise filter on the type (singular) and colors (multiple):
    const filteredData = this.state.data.filter(filt => {
      return filt[inputColumn].toLowerCase().match(regValue);
    });

    filteredData.map(html => {
      let values = [];
      tableColumns.map(dynamicinator => {
        //values.push(eval('html.' + dynamicinator.columnLink));
        values.push({
          rowKey: html.id,
          rowData: eval("html." + dynamicinator.columnLink)
        });
      });

      tableData.push(values);
    });

    this.setState(
      {
        tableData: tableData,
        page: 0
      },
      this.setPages(tableData)
    );
  }

  //////////////drag and drop functions//////////////////////////////////
  onDrag = (event, column) => {
    event.stopPropagation();
    this.currentColumn = column;
  };

  onDragOver = event => {
    event.preventDefault();
  };

  onDrop = (event, column) => {
    event.preventDefault();
    this.reOrderColumns(column);
  };

  //////////////table paging/////////////////////////////////////
  setPages = tableData => {
    const { rowsPerPage } = this.state;
    //reset array each time
    this.arrPages = [];
    //divide the rows of pages with the rows in the datatable
    const numOfPages = Math.max(tableData.length / rowsPerPage);

    for (var i = 0; i < numOfPages; i++) {
      //add page numbers to array
      this.arrPages.push(i);
    }
  };

  handleNextClick = () => {
    const { page } = this.state;
    if (page + 1 < this.arrPages.length) {
      this.setState(state => ({ page: state.page + 1 }));
    }
  };

  handleBackClick = () => {
    const { page } = this.state;
    if (page - 1 >= 0) {
      this.setState(state => ({ page: state.page - 1 }));
    }
  };

  pagesFunc = (pageClick, page) => {
    const currentPage = page;
    if (pageClick == currentPage) {
      return (
        <a
          href="#"
          class="active"
          onClick={() => this.setState({ page: pageClick })}
        >
          {pageClick + 1}
        </a>
      );
    } else {
      return (
        <a href="#" onClick={() => this.setState({ page: pageClick })}>
          {pageClick + 1}
        </a>
      );
    }
  };

  //////////////table sorting/////////////////////////////////
  compareValues(key, order = "asc") {
    return function(a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        return 0;
      }

      const varA = typeof a[key] === "string" ? a[key].toUpperCase() : a[key];
      const varB = typeof b[key] === "string" ? b[key].toUpperCase() : b[key];

      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return order === "desc" ? comparison * -1 : comparison;
    };
  }

  handleRequestSort = (event, property) => {
    const { data } = this.state;
    const orderBy = property;
    let order = "desc";

    if (this.state.orderBy === property && this.state.order === "desc") {
      order = "asc";
    }

    data.sort(this.compareValues(orderBy, order));

    this.setState({ order, orderBy, data }, this.getDataForTable);
  };

  orderByFunc = (order, orderBy, orderByColumn) => {
    if (orderBy == orderByColumn) {
      return order == "desc" ? <i class="down" /> : <i class="up" />;
    }
  };

  //render the component
  render() {
    const {
      order,
      orderBy,
      page,
      tableColumns,
      tableData,
      rowsPerPage
    } = this.state;
    const emptyRows =
      rowsPerPage -
      Math.min(rowsPerPage, tableData.length - page * rowsPerPage);
    return (
      <div>
        <table class="table">
          <tr>
            {tableColumns.map(row => (
              <th
                draggable
                align="left"
                onDrag={event => this.onDrag(event, row)}
                onDragOver={event => this.onDragOver(event, row)}
                onDrop={event => this.onDrop(event, row)}
                onClick={() => this.handleRequestSort("", row.columnLink)}
              >
                {row.displayColumn}
                {this.orderByFunc(order, orderBy, row.columnLink)}
              </th>
            ))}
          </tr>
          <tr>
            {tableColumns.map(row => (
              <td align="left">
                <input
                  id="outlined-with-placeholder"
                  onChange={this.handleChange}
                  name={row.columnLink}
                  width="auto"
                />
              </td>
            ))}
          </tr>
          {tableData
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((prop, key) => {
              return (
                <tr key={key} hover onClick={() => this.props.getDetails(prop)}>
                  {prop.map((prop, key) => {
                    return (
                      <td key={key} align="left">
                        {prop.rowData}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          {/* {emptyRows > 0 && (
            <tr>
              <td />
            </tr>
          )} */}
        </table>
        <div class="pagination">
          <a href="#" onClick={() => this.handleBackClick()}>
            &laquo;
          </a>
          {this.arrPages.map(row => {
            return this.pagesFunc(row, page);
          })}
          <a href="#" onClick={() => this.handleNextClick()}>
            &raquo;
          </a>
        </div>
      </div>
    );
  }
}

DraggableTable.propTypes = {
  data: PropTypes.object.isRequired,
  columns: PropTypes.object.isRequired,
  rowsPerPage: PropTypes.object.isRequired
};

export default DraggableTable;
