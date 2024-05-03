import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import axios from 'axios';
import Logger from './components/Logger';
import Chart from './components/Chart';
import Pressure from './Pressure'
import ToggleButtonsMultiple from './components/Toggle';
import MyMap from './components/Map';
import { Box } from '@mui/material';
import Login from './Login';

function App() {
  const [data, setData] = useState([]);
  // const [searchData, setSearchData]
  const [error, setError] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState('statistics');
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleChange = (event, newComponent) => {
    if (newComponent !== null) setSelectedComponent(newComponent);
  };

  const filteredData = data.filter((item) =>
    item.LoggerId.toLowerCase().includes(searchQuery.toLowerCase()) || item.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'statistics':
        return filteredData.map((item) => (
          <Box
            p={2}
            sx={{
              width: '30%',
              boxShadow: 4,
              borderRadius: '20px',
            }}
          >
            {item.Name.toLowerCase().includes('pressure') ? <Pressure id={item.LoggerId} />: <Chart id={item.LoggerId} name={item.Name} />}
            {/* <Chart id={item.LoggerId} /> */}
          </Box>
        ));
      case 'map':
        return (
          <div style={{ border: '2px solid #00b3ff', flex: '1' }}>
            <div id="map">
              <MyMap />
            </div>
          </div>
        );
      case 'config':
        return <Logger />;
      default:
        return <Login />;
    }
  };

  useEffect(() => {
    const fetchUniqueLoggers = async () => {
      try {
        const response = await axios.get(
          `http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/logger/`
        );
        const data = response.data;
        setData(data);
      } catch (error) {
        setError('Error fetching data: ' + error.message);
      }
    };

    fetchUniqueLoggers();
  }, [selectedComponent]);

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#00bcd4', // Cyan color
      },
      secondary: {
        main: '#ffeb3b', // Yellow color
      },
    },
  });

  const lightTheme = createTheme({
    palette: {
      primary: {
        main: '#2196f3', // Blue color
      },
      secondary: {
        main: '#4caf50', // Green color
      },
    },
  });

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <div>
        <ToggleButtonsMultiple onChange={handleToggleChange} setSearchQuery={setSearchQuery}/>
        {/* <TextField
          id="search"
          label="Search Logger"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
        /> */}
        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent={"center"}
          gap={1.5}
          flexDirection="row"
          p={1}
          sx={{ boxSizing: 'border-box',  height: '100%', width: '100vw', maxWidth: '100%' }}
        >
          {renderComponent()}
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default App;
