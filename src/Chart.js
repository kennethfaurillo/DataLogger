import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Import chart.js to automatically register all chart types


function Chart() {
    const [chartData, setChartData] = useState({});
    const [datac, setCData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://192.168.3.179:3001/api/timelogger')
            .then(response => {
                // Process the data from the response and create the data object for the chart
                setChartData(response.data);
                console.log(chartData)
                console.log('Type of chartData:', typeof chartData);
                console.log('Is chartData an array?', Array.isArray(chartData));

                // const data = {
                //     labels: chartData.map(item => item.LogTime), // Assuming LogTime is the x-axis data
                //     datasets: [
                //         {
                //             label: 'Average Voltage',
                //             data: chartData.map(item => item.AverageVoltage),
                //             borderColor: 'rgba(75,192,192,1)',
                //             fill: false,
                //         },
                //         // Add more datasets if needed
                //     ],
                // };
                setCData(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    const data = {
        labels: chartData.map(item => item.LogTime), // Assuming LogTime is the x-axis data
        datasets: [
            {
                label: 'Average Voltage',
                data: chartData.map(item => item.AverageVoltage),
                borderColor: 'rgba(75,192,192,1)',
                fill: false,
            },
            // Add more datasets if needed
        ],
    };

    if(loading) {
        return (
            <div>Loading...</div>
        )
    }

    return (
        <div>
            <h2>Average Voltage over Time</h2>
            <Line data={datac} /> 
        </div>
    );
}

export default Chart;