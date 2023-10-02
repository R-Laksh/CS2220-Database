import { Route, Routes } from "react-router-dom";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import React, { useDebugValue, useEffect, useState } from "react";
import Topbar from "./scenes/global/Topbar";
import FilterableTable from "./scenes/apiFilter";
function App() {
  const [theme, colorMode] = useMode();
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <main className="content">
            <Topbar onSearchChange={setSearchTerm} />
            <Routes>
              <Route
                path="/"
                element={<FilterableTable searchTerm={searchTerm} />}
              />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
