import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

function FilterableTable() {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});
  const [activeFilter, setActiveFilter] = useState("");
  const [operator, setOperator] = useState("=");
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortColumn, setSortColumn] = useState("Entry");
  const [sortDirection, setSortDirection] = useState("asc");

  const fetchData = async (filters) => {
    const queryString = new URLSearchParams(filters).toString();
    const response = await fetch(
      `http://localhost:5000/api/employees?${queryString}`
    );
    const data = await response.json();
    return data;
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const data = await fetchData({});
      console;
      setData(data);
    };
    fetchInitialData();
  }, []);

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
    }
    const data = await fetchData(newFilters);
    setData(data);
    handleClose();
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
  return (
    <Paper style={{ margin: "20px", overflowX: "auto" }}>
      <Button
        onClick={handleResetFilters}
        style={{ margin: "10px", backgroundColor: "orange", color: "white" }}
      >
        Reset Filters
      </Button>
      <Table
        style={{
          borderTop: "1px solid rgba(224, 224, 224, 1)",
          borderBottom: "1px solid rgba(224, 224, 224, 1)",
          borderLeft: "1px solid rgba(224, 224, 224, 1)",
        }}
      >
        <TableHead>
          <TableRow>
            {Object.keys(data[0] || {}).map((key) => (
              <TableCell
                key={key}
                style={{
                  borderRight: "1px solid rgba(224, 224, 224, 1)",
                  textAlign: "center",
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
                  </IconButton>{" "}
                </div>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((row, index) => (
            <TableRow key={index}>
              {Object.values(row).map((value, idx) => (
                <TableCell
                  key={idx}
                  style={{
                    borderRight: "1px solid rgba(224, 224, 224, 1)",
                    textAlign: "center",
                  }}
                >
                  {value}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
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
