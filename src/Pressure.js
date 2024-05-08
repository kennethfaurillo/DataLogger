import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Import chart.js to automatically register all chart types
import { Grid, Card, CardContent, Typography, Divider } from '@mui/material';
import GaugeChart from 'react-gauge-chart';
import 'chartjs-adapter-date-fns';
import { format, parseISO, subHours } from 'date-fns';
import './Chart.css'
import Modal from '@mui/material/Modal'
import { Box } from '@mui/material';

function Pressure({ id }) {
    const [datac, setCData] = useState(null);
    const [copy, setCopy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [latest, setLatest] = useState([]);
    const [info, setInfo] = useState(null)
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [selectedTimeFrame, setSelectedTimeFrame] = useState('hour');

    const handleTimeFrameChange = (event) => {
      setSelectedTimeFrame(event.target.value);
    };

    const borderColor = {
      voltage: '#FFA726', // Electric Orange
      flow: '#42A5F5',    // Water Blue
      positive: '#4CAF50', // Fresh Green
      negative: '#FF7043', // Rusty Red
    };

    const filterDataByTimeRange = (data, timeRange) => {
      const currentTime = new Date();
      let timeThreshold;

      switch (timeRange) {
        case 'hour': 
          timeThreshold = subHours(currentTime, 1);
          break;
        case 'day': 
          timeThreshold = subHours(currentTime, 24);
          break;
        case 'week': 
          timeThreshold = subHours(currentTime, 24*7);
          break;
        case 'month':
          timeThreshold = subHours(currentTime, 24 * 30);
          break;
        default:
          timeThreshold = 0;
      }

      return data.filter(item => item.LogTime >= timeThreshold);
    }

    const parseTime = (data) => {
      return data.map(item => {
          // Parse datetime string to Date object
          const datetime = parseISO(item.LogTime);
          // Add 8 hours to adjust to UTC+8 timezone
          const utcPlus8Datetime = subHours(datetime, 8);
          // Format the datetime back to a string
          return format(utcPlus8Datetime, "yyyy-MM-dd'T'HH:mm:ss");
        })
    }
    
    useEffect(() => {
        
        const fetchData = async () => {
            console.log(id)
            try {
                const response = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/pressure_log/`+id);
                const name = await axios.get(`http://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/api/logger`)
                
                const names = name.data;
                names.map(item => {
                  if(item.LoggerId === id) {
                    setInfo(item.Name);
                    console.log(item.Name)
                  }
                  return 0;
                })
                // setInfo(names);
                console.log(info)

                const data = response.data;
                const lastElement = data[data.length - 1];
                
                const parsed = parseTime(data);
                const filtered = filterDataByTimeRange(parsed)

                setLatest(lastElement);
                console.log(selectedTimeFrame)
                console.log(filtered)
                console.log(data)
                console.log(latest);
                // Process the data from the response and create the data object for the chart
                const transformedData = {
                    // labels: data.map(item => item.LogTime),
                    labels: parsed,
                    // labels: filterDataByTimeRange(parsed, selectedTimeFrame),
                    datasets: [
                        {
                            label: 'Average Voltage',
                            data: data.map(item => item.AverageVoltage),
                            borderColor: borderColor.voltage,
                            // backgroundColor: 'brown',
                            // backgroundColor: '#FAFAFA', // Light Grey

                            color: 'yellow',
                            fill: true,
                            hidden: false,
                        },
                        {
                            label: 'Current Pressure',
                            data: data.map(item => item.CurrentPressure),
                            borderColor: borderColor.flow,
                            fill: true,
                            hidden: false,
                        },
                        // Add more datasets if needed
                    ]
                };
                
                setCData(transformedData);
                setCopy(transformedData);
                setLoading(false);
                
            } catch (error) {
                setError('Error fetching data: ' + error.message);
            }
        };

        fetchData();
        // console.log(datac)
    }, [id, selectedTimeFrame, borderColor.flow, borderColor.negative, borderColor.positive, borderColor.voltage]);
    function getUnitofMeasurement(label) {
        switch (label) {
            case 'Average Voltage':
                return 'V';
            case 'Current Pressure':
                return 'm3/h';
            default: 
                return '';
        }
    }

    const options = {
        
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'minute',
            }
          },
        },
        plugins: { 
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true
              },
              mode: 'xy',
            }
          },       
            title: {
                font: {
                    size: 20,
                },
                display: true,
                text: 'Time Series Data of ' + info,
            },
            legend: {
              display: false,
            },
            tooltip: {
                callbacks: {
                    label: (item) => `${item.dataset.label}: ${item.formattedValue} ${getUnitofMeasurement(item.dataset.label)}`
                }
            },
        },
      };

      const handleCardClick = (legend) => {
        const updatedDatasets = datac.datasets.map((dataset) => {
          if (dataset.label !== legend && dataset.hidden === false) {
            // Hide other datasets if they are not the clicked legend
            return {
              ...dataset,
              hidden: true,
            };
          } 
          else if (dataset.label === legend && dataset.hidden === true) {
            // Show the clicked legend if it's hidden
            return {
              ...dataset,
              hidden: false,
            };
          } 
          return dataset; // Keep other datasets unchanged
        });
      
        // Update the chart data with the updated datasets
        setCData({
          ...datac,
          datasets: updatedDatasets,
        });
      };

    if(loading) {
        return (
            <div>Loading...</div>
        )
    }

    return (
        <div><Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{display:'flex', justifyContent: 'center'}}
      >
        <Box
          display={'flex'}
          sx={{width: 'fit-content', padding:'20px', margin:'auto', height: 'fit-content', backgroundColor: 'white', flexDirection:'column'}}
          justifyContent={'center'}
        >
          <select value={selectedTimeFrame} onChange={handleTimeFrameChange}>
            <option value="hour">Last Hour</option>
            <option value="day">Last Day</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
          <Line data={datac} options={options}/>
  <Grid container spacing={2} onClick={handleOpen}>
  {/* First Card */}
  <Grid item xs={5}>
    <Card className='card' onClick={() => handleCardClick('Average Voltage')} sx={{ border: `5px solid ${borderColor.voltage}`}}>
      <CardContent sx={{display: 'flex', flexDirection: 'row'}}>
        <Grid item container direction={'column'}>
        <Typography variant="h5" component="h2">
          Voltage
        </Typography>
        <Typography color="textSecondary">
          {latest.AverageVoltage} Volts
        </Typography>
        </Grid>
        <div style={{ width: '50%', height: '50%' }}> {/* Adjust percentage values as needed */}
          <GaugeChart id="gauge-chart" 
          percent={latest.AverageVoltage/10} 
          cornerRadius={0.2}
          arcWidth={0.4}
          // nrOfLevels={420}
          formatTextValue={(value) => value/10 + 'V'}
          arcsLength={[0.1, 0.1, 0.6, 0.1, 0.1]}
          colors={['#EA4228', '#F5CD19', 'green', '#F5CD19', '#EA4228']}
          animate={false}
          textColor='black'
          marginInPercent={0}
          hideText={true}
           />
          
        </div>
      </CardContent>
    </Card>
  </Grid>

  {/* Second Card */}
  <Grid item xs={5} sx={{display: 'flex', flexDirection: 'column'}}>
    <Card className='card' onClick={() => handleCardClick('Current Flow')} sx={{ border: `5px solid ${borderColor.flow}`}}>
      <CardContent sx={{display: 'flex', flexDirection: 'row'}}>
      <Grid item container direction={'column'}>
        <Typography variant="h5" component="h2">
          Current Pressure
        </Typography>
        <Typography color="textSecondary">
        {latest.CurrentPressure} m3/h
        </Typography>
      </Grid>
      <div style={{ width: '50%', height: '50%' }}> {/* Adjust percentage values as needed */}
          <GaugeChart id="gauge-chart" 
          percent={latest.CurrentPressure/600} 
          cornerRadius={0.2}
          arcWidth={0.4}
          // nrOfLevels={420}
          formatTextValue={(value) => value + 'V'}
          arcsLength={[0.2, 0.19, 0.44, 0.06, 0.1]}
          colors={['#EA4228', '#F5CD19', 'green', '#F5CD19', '#EA4228']}
          animate={false}
          textColor='black'
          marginInPercent={0}
          hideText={true}
           />
          
        </div>
      </CardContent>
    </Card>
  </Grid>

</Grid>
        </Box>
        
    </Modal>
    <Typography variant='h4' sx={{textAlign: 'center',}}>
        {info.split('PIWAD_').pop().replace('-',' ').replace('_', ' ')}
      </Typography>
      <Grid container spacing={2} onClick={handleOpen} sx={{paddingTop: '10px', display: 'inline-flex', flexDirection: 'column', justifyContent: 'center', alignItems:'center'}}>
        {/* First Card */}
        <Grid item xs={8} >
          <Card className='card'  onHover={() => handleCardClick('Average Voltage')} onClick={() => handleCardClick('Average Voltage')} sx={{ border: `5px solid ${borderColor.voltage}`}}>
            <CardContent sx={{display: 'flex', flexDirection: 'row'}}>
              <Grid item container direction={'column'}>
              <Typography variant="h5" component="h2">
                Voltage
              </Typography>
              <Typography color="textSecondary">
                {latest.AverageVoltage} Volts
              </Typography>
              </Grid>
              <div style={{ width: '50%', height: '50%' }}> {/* Adjust percentage values as needed */}
                <GaugeChart id="gauge-chart" 
                percent={latest.AverageVoltage/10} 
                cornerRadius={0.2}
                arcWidth={0.4}
                // nrOfLevels={420}
                formatTextValue={(value) => value/10 + 'V'}
                arcsLength={[0.1, 0.1, 0.6, 0.1, 0.1]}
                colors={['#EA4228', '#F5CD19', 'green', '#F5CD19', '#EA4228']}
                animate={false}
                textColor='black'
                marginInPercent={0}
                hideText={true}
                 />
                
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Second Card */}
        <Grid item xs={8} sx={{display: 'flex', flexDirection: 'column'}}>
          <Card className='card' onClick={() => handleCardClick('Current Flow')} sx={{ border: `5px solid ${borderColor.flow}`}}>
            <CardContent sx={{display: 'flex', flexDirection: 'row'}}>
            <Grid item container direction={'column'}>
              <Typography variant="h5" component="h2">
                Current Pressure
              </Typography>
              <Typography color="textSecondary">
              {latest.CurrentPressure} m3/h
              </Typography>
            </Grid>
            <div style={{ width: '50%', height: '50%' }}> {/* Adjust percentage values as needed */}
                <GaugeChart id="gauge-chart" 
                percent={latest.CurrentPressure/600} 
                cornerRadius={0.2}
                arcWidth={0.4}
                // nrOfLevels={420}
                formatTextValue={(value) => value + 'V'}
                arcsLength={[0.2, 0.19, 0.44, 0.06, 0.1]}
                colors={['#EA4228', '#F5CD19', 'green', '#F5CD19', '#EA4228']}
                animate={false}
                textColor='black'
                marginInPercent={0}
                hideText={true}
                 />
                
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
    );
}

export default Pressure;