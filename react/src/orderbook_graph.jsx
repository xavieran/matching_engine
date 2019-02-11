import { Chart, Line } from 'react-chartjs-2'

import * as zoom from 'chartjs-plugin-zoom'

import moment from 'moment'
import React from 'react'

class OrderbookGraph extends React.Component {
    render() {
        const data = {
			datasets: [
				{
					label: 'Bid', 
                    data: this.props.data.map((d) => {return {t: d.time, y: d.bid}}),
					steppedLine: 'before',
                    borderColor: "#00ff00",
                    fill: false
                },
                {
					label: 'Ask', 
                    data: this.props.data.map((d) => {return {t: d.time, y: d.ask}}),
					steppedLine: 'before',
                    borderColor: "#ff0000",
                    fill: false
				}
			]
        }

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    distribution: 'linear', 
                    ticks: { beginAtZero: true, suggestedMin: 0},
                }],
                xAxes: [{
                    type: 'time',
                    distribution: 'linear',
                    ticks: { source: 'data'}
                }]
            },
            pan: {
                enabled: false,
                mode: 'x',
                speed: 10,
                threshold: 10
            },
            zoom: {
                enabled: true, 
                mode: 'xy',
                sensitivity: 0.25,
                drag: true,
            }
		}

 		console.log(data)
		return (<div className="orderbookGraph">
			<Line width={200} height={200} data={data} options={options}
            />
            </div>
		)
	}
}

export default OrderbookGraph 
