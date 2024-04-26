import React, { useEffect, useState } from 'react';
// import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import axios from 'axios';
import Logger from './components/Logger';
import L from 'leaflet' 
import Chart from './components/Chart';
import ToggleButtonsMultiple from './components/Toggle';
import MyMap from './components/Map';
import { Box } from '@mui/material';
// import { Router } from '@mui/icons-material';

function App() {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [selectedComponent, setSelectedComponent] = useState('statistics');

    const handleToggleChange = (event, newComponent) => {
        if (newComponent !== null)
            setSelectedComponent(newComponent);
    };

    const renderComponent = () => {
        switch (selectedComponent) {
          case 'statistics':
            console.log(data)
            return data.map(item => (
                <Box                
                // my={4}
                // display="flex"
                alignItems = "center"
                // alignContent="center"
                // gap={4}
                p={2}
                sx={{ 
                  // border: '2px solid grey', 
                  // height: '65vh', 
                  width: '47.5%',
                  boxShadow: 4,
                  // bgcolor: '#568189',
                  // bgcolor: '#1C4380',
                  bgcolor:'white',
                  borderRadius: '20px',
                  // overflow: 'auto'
                }}
                >
                  <Chart id={item.LoggerId} />
                </Box>
              // </Box>
            ))
          case 'map':
            return <div style={{border:'2px solid #00b3ff', flex:'1',}}>
                <div id="map">
                  <MyMap />
                </div>
            </div>;
          case 'config':
            return <Logger />;
          case 'other':
            return <Logger />;
          default:
            return <h1>XDD</h1>;
        }
      };

    useEffect(() => {
      // Make an API call to your Node.js backend using axios
      const fetchUniqueLoggers = async () => {
            try {
                const response = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/logger/`);
                const data = response.data;
                
                setData(data)
            } catch (error) {
                setError('Error fetching data: ' + error.message);
            }
        }
      
      fetchUniqueLoggers()

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
    }
  })

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

  // const gradientTheme = createTheme({
  //   palette: {
  //     primary: {
  //       main: 'linear-gradient(to right, #ff416c, #ff4b2b)', // Gradient from pink to orange
  //     },
  //     secondary: {
  //       main: 'linear-gradient(to right, #4caf50, #2196f3)', // Gradient from green to blue
  //     },
  //   },
  // });

    return (
    //   <Router>
    //   <Switch>
    //     <Route path="/" exact component={renderComponent()} />
    //     <Route path="/map" component={MyMap} />
    //   </Switch>
    // </Router>
    // <ThemeProvider theme={darkTheme}>
      // <CssBaseline />
      <div>
            <ToggleButtonsMultiple onChange={handleToggleChange}/>
            <Box
                // my={4}
                display="flex"
                // alignItems="center"
                // alignContent={'space-evenly'}
                flexWrap={'wrap'}
                gap={1.5}
                flexDirection={'row'}
                p={1}
                sx={{ boxSizing:'border-box', border:'2px solid grey', height: '100%', width: '100vw', maxWidth:'100%'}}
              >
            {renderComponent()}
            </Box>
            
        </div>
    // </ThemeProvider>
    );
}

export default App;