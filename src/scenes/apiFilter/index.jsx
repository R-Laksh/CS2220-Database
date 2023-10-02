import React, { useState, useEffect } from "react";
import "./style.css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  TableFooter,
  TablePagination,
  Checkbox,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

function FilterableTable({ searchTerm }) {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});
  const [activeFilter, setActiveFilter] = useState("");
  const [operator, setOperator] = useState("=");
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortColumn, setSortColumn] = useState("Entry");
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState(
    Object.keys(data[0] || {})
  );
  const [anchorElColumns, setAnchorElColumns] = useState(null);

  const handleColumnsClick = (event) => {
    setAnchorElColumns(event.currentTarget);
  };

  const handleCloseColumns = () => {
    setAnchorElColumns(null);
  };

  const toggleColumnVisibility = (column) => {
    if (visibleColumns.includes(column)) {
      setVisibleColumns((prev) => prev.filter((col) => col !== column));
    } else {
      setVisibleColumns((prev) => [...prev, column]);
    }
  };
  const fetchData = async (filters) => {
    const queryString = new URLSearchParams(filters).toString();
    const response = await fetch(
      `http://localhost:5000/api/data?${queryString}`
    );
    console.log(response);
    const data = await response.json();
    return data;
  };

  const fetchMutations = async (filters) => {
    const queryString = new URLSearchParams(filters).toString();
    const response = await fetch(
      `http://localhost:5000/api/mutations2?${queryString}`
    );
    console.log(response);
    const data = await response.json();
    return data;
  };
  /*
  useEffect(() => {
    const fetchInitialData = async () => {
      const data = await fetchData({});
      setData(data);
      setVisibleColumns(Object.keys(data[0] || {}));
    };
    fetchInitialData();
  }, []);
  */
  useEffect(() => {
    const fetchInitialData = async () => {
      const data = await fetchData({});
      setData(data);
      setVisibleColumns(Object.keys(data[0] || {}));
    };
    if (searchTerm) {
      // Filter the data based on the searchTerm
      const filteredData = data.filter((row) =>
        Object.values(row).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setData(filteredData);
    } else {
      // Fetch all data if no searchTerm
      fetchInitialData();
    }
  }, [searchTerm]);
  const handleFilterClick = (e, column) => {
    setAnchorEl(e.currentTarget);
    setActiveFilter(column);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setActiveFilter("");
  };

  const handleApplyFilter = async () => {
    const newFilters = { ...filters };
    if (operator && activeFilter) {
      if (activeFilter === "Mutations2") {
        const mutationFilters = {};
        switch (operator) {
          case "mutationsCount":
            mutationFilters.mutationsCount = filters[activeFilter];
            break;
          case "startsWith":
            mutationFilters.startsWith = filters[activeFilter];
            break;
          case "endsWith":
            mutationFilters.endsWith = filters[activeFilter];
            break;
          case "startsAndEndsWith":
            const [start, end] = filters[activeFilter].split("-");
            mutationFilters.startsWith = start;
            mutationFilters.endsWith = end;
            break;
          default:
            break;
        }
        const data = await fetchMutations(mutationFilters);
        setData(data);
      } else {
        switch (operator) {
          case "=":
            newFilters[`${activeFilter}_eq`] = filters[activeFilter];
            break;
          case "<":
            newFilters[`${activeFilter}_lt`] = filters[activeFilter];
            break;
          case ">":
            newFilters[`${activeFilter}_gt`] = filters[activeFilter];
            break;
          case "between":
            const [start, end] = filters[activeFilter].split("-");
            newFilters[`${activeFilter}_start`] = start;
            newFilters[`${activeFilter}_end`] = end;
            break;
          case "notBetween":
            const [notStart, notEnd] = filters[activeFilter].split("-");
            newFilters[`${activeFilter}_notstart`] = notStart;
            newFilters[`${activeFilter}_notend`] = notEnd;
            break;
          default:
            break;
        }
        const data = await fetchData(newFilters);
        setData(data);
      }
      handleClose();
    }
  };

  const handleResetFilters = async () => {
    setFilters({});
    const data = await fetchData({});
    setData(data);
    setSortColumn("Entry");
    setSortDirection("asc");
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (sortColumn) {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];

      if (typeof valueA === "number") {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      } else {
        return sortDirection === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    }
    return 0;
  });
  const displayedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const convertToCSV = (data, visibleColumns) => {
    const header = visibleColumns.join(",");
    const rows = data.map((row) =>
      visibleColumns.map((col) => JSON.stringify(row[col])).join(",")
    );
    return [header, ...rows].join("\n");
  };

  const handleCSVDownload = () => {
    const csvData = convertToCSV(data, visibleColumns);
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "export.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Paper style={{ margin: "20px", maxHeight: "90vh", overflow: "auto" }}>
      <Button
        onClick={handleResetFilters}
        style={{ margin: "10px", backgroundColor: "orange", color: "white" }}
      >
        Reset Filters
      </Button>
      <Button
        onClick={handleColumnsClick}
        style={{ margin: "10px", backgroundColor: "orange", color: "white" }}
      >
        Select Columns
      </Button>
      <Button
        onClick={handleCSVDownload}
        style={{ margin: "10px", backgroundColor: "green", color: "white" }}
      >
        Export CSV
      </Button>
      <Menu
        anchorEl={anchorElColumns}
        open={Boolean(anchorElColumns)}
        onClose={handleCloseColumns}
      >
        {Object.keys(data[0] || {}).map((column) => (
          <MenuItem key={column} onClick={() => toggleColumnVisibility(column)}>
            <Checkbox checked={visibleColumns.includes(column)} />
            {column}
          </MenuItem>
        ))}
      </Menu>
      <TableFooter>
        <TableRow>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={sortedData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0); // reset to the first page
            }}
          />
        </TableRow>
      </TableFooter>
      <Table
        style={{
          maxWidth: "100%",
          borderTop: "1px solid rgba(224, 224, 224, 1)",
          borderBottom: "1px solid rgba(224, 224, 224, 1)",
          borderLeft: "1px solid rgba(224, 224, 224, 1)",
        }}
      >
        <TableHead>
          <TableRow>
            {Object.keys(data[0] || {}).map(
              (key) =>
                visibleColumns.includes(key) && (
                  <TableCell
                    key={key}
                    style={{
                      width: key === "Entry" ? "25px" : "auto",
                      borderRight: "1px solid rgba(224, 224, 224, 1)",
                      textAlign: "center",
                      fontSize: "0.8rem",
                      padding: "4px 8px",
                    }}
                  >
                    {key}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "5px",
                      }}
                    >
                      <IconButton onClick={() => handleSort(key)}>
                        {sortColumn === key && sortDirection === "asc" ? (
                          <ArrowUpwardIcon fontSize="small" />
                        ) : (
                          <ArrowDownwardIcon fontSize="small" />
                        )}
                      </IconButton>
                      <IconButton onClick={(e) => handleFilterClick(e, key)}>
                        <FilterListIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </TableCell>
                )
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedData.map((row, index) => (
            <TableRow key={index}>
              {Object.entries(row).map(
                ([key, value], idx) =>
                  visibleColumns.includes(key) && (
                    <TableCell
                      key={idx}
                      style={{
                        width: key === "Entry" ? "25px" : undefined, // Set width for the "Entry" column
                        maxWidth: key === "Entry" ? "50px" : undefined, // Set max-width for the "Entry" column
                        overflow: key === "Entry" ? "hidden" : undefined, // Hide overflow for the "Entry" column
                        textOverflow: key === "Entry" ? "ellipsis" : undefined, // Add ellipsis for the "Entry" column
                        whiteSpace: key === "Entry" ? "nowrap" : undefined, // Prevent wrapping for the "Entry" column
                        borderRight: "1px solid rgba(224, 224, 224, 1)",
                        textAlign: "center",
                        wordBreak:
                          key === "Mutations2"
                            ? "break-all"
                            : "Entry"
                            ? "break-all"
                            : "normal",
                      }}
                    >
                      {value}
                    </TableCell>
                  )
              )}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={sortedData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0); // reset to the first page
              }}
            />
          </TableRow>
        </TableFooter>
      </Table>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {activeFilter === "Mutations2" ? (
          <>
            <MenuItem>
              <FormControl fullWidth>
                <InputLabel>Operator</InputLabel>
                <Select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                >
                  <MenuItem value="mutationsCount">
                    Number of Mutations
                  </MenuItem>
                  <MenuItem value="startsWith">Starts With</MenuItem>
                  <MenuItem value="endsWith">Ends With</MenuItem>
                  <MenuItem value="startsAndEndsWith">
                    Starts and Ends With
                  </MenuItem>
                </Select>
              </FormControl>
            </MenuItem>
            <MenuItem>
              <TextField
                value={filters[activeFilter] || ""}
                onChange={(e) =>
                  setFilters({ ...filters, [activeFilter]: e.target.value })
                }
                placeholder={
                  operator === "startsAndEndsWith" ? "e.g. A-B" : "Enter value"
                }
                fullWidth
              />
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem>
              <FormControl fullWidth>
                <InputLabel>Operator</InputLabel>
                <Select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                >
                  <MenuItem value="=">{"="}</MenuItem>
                  <MenuItem value="<">{"<"}</MenuItem>
                  <MenuItem value=">">{">"}</MenuItem>
                  <MenuItem value="between">Between</MenuItem>
                  <MenuItem value="notBetween">Not Between</MenuItem>
                </Select>
              </FormControl>
            </MenuItem>
            <MenuItem>
              <TextField
                value={filters[activeFilter] || ""}
                onChange={(e) =>
                  setFilters({ ...filters, [activeFilter]: e.target.value })
                }
                placeholder={
                  operator === "between" || operator === "notBetween"
                    ? "e.g. 35-37"
                    : "Enter value"
                }
                fullWidth
              />
            </MenuItem>
          </>
        )}
        <MenuItem>
          <Button onClick={handleApplyFilter} color="primary">
            Apply Filter
          </Button>
        </MenuItem>
      </Menu>
    </Paper>
  );
}

export default FilterableTable;
