import {Line} from 'react-chartjs-2'

import React from 'react'

class OrderbookGraph extends React.Component {
    render() {
        return (
            <div className="orderbookGraph">
              <Line data={
                {
                    datasets: [
                    {
                        label: 'Bid',
                        data: this.props.bid,
                        steppedLine: 'before',
                        borderColor: "#00ff00"
                    },
                    {
                        label: 'Ask', 
                        data: this.props.ask,
                        steppedLine: 'before',
                        borderColor: "#ff0000",
                    },
                    {
                        label: 'Trades', 
                        data: this.props.trade,
                        steppedLine: 'before',
                        showLine: false,
                        borderColor: "#ff00ff",
                        pointStyle: "dot",
                        pointRadius: 6,
                        fill: true
                    }
                  ],
                  options: {
                      responsive: true,
                      maintainAspectRatio: false,
                      title: {
                          display: true,
                          text: "Orderbook and Trades"
                      },
                      scales: {
                          yAxes: [{
                              distribution: 'linear',
                              ticks: {
                                  beginAtZero:true
                              }
                          }],
                          xAxes: [{
                              type: 'time',
                              distribution: 'linear',
                              ticks: {
                                  source: 'data'
                              }
                          }]

                      },
                      pan: {
                          enabled: true,
                          mode: 'x',
                          speed: 10,
                          threshold: 10,
                          onPan: function() {console.log("PANNED");}
                      },
                      zoom: {
                          enabled: true,
                          mode: 'x',
                          sensitivity: 0.25
                      }
                  }

              }} />
            </div>
        )
    }
}

export default OrderbookGraph 
