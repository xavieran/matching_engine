var app = angular.module('myApp', []);

app.controller('myCtrl', function($scope) {
    var websocket = new WebSocket("ws://le-chateaud:6789/");

    $scope.ready_to_trade = false;
    $scope.input_trader_id = "";
    $scope.trader_id = "";
    $scope.side = true;
    $scope.price = 1; 
    $scope.volume = 1; 
    $scope.order_id = 0;

    $scope.top_bids = []
    $scope.top_asks = []
    $scope.trade_prices = []
    $scope.orderbook = {"bid":[], "ask":[]};
	$scope.orders = [];
	$scope.trades = [];

    $scope.readyToTrade = () => {
        console.log("Setting trader_id to: " + $scope.input_trader_id);
        console.log($scope.input_trader_id);
        $scope.trader_id = ' ' + $scope.input_trader_id;
        $scope.ready_to_trade = true;
        websocket.send(JSON.stringify({type: "sync_state", trader_id: $scope.trader_id}));
    }

	$scope.display_order = (order) => {
		return order.side + " "  + order.volume + " @$" + order.price;
	}

	$scope.trade = (side) => {
        let order = {
            "type":"insert", 
            "trader_id": $scope.trader_id,
            "order_id":uuidv4(),
            "side": side,
            "price": $scope.price,
            "volume": $scope.volume}

        $scope.orders.push(order)
        websocket.send(JSON.stringify(order))

		console.log($scope.orders);
	};

    $scope.cancel = (order_id) => {
		let cancel = {
			"type":"cancel",
			"trader_id": $scope.trader_id,
			"order_id": order_id}
        $scope.orders = $scope.orders.filter(
            (elem) => {return elem.order_id != order_id;});
		websocket.send(JSON.stringify(cancel));
		
		console.log("Cancelled " + order_id)
	};
        
    websocket.onmessage = function (event) {
        data = JSON.parse(event.data);

        switch (data.type) {
            case 'orderbook':
                let bid = null;
                let ask = null;

				if (data.bid.length != 0){
                    bid = data.bid[0].price
                }

                if (data.ask.length != 0){
                    ask = data.ask[0].price
                }

                $scope.top_bids.push({
						't': new Date(),
						'y': bid});

                $scope.top_asks.push({
                    't': new Date(),
                    'y': ask});

				console.log($scope.top_asks)
				console.log($scope.top_bids)

                $scope.orderbook.bid = data.bid;
                $scope.orderbook.ask = data.ask.reverse();
                console.log("received orderbook update");
                $scope.orderbook_chart.update();
				$scope.$apply();
                break;
			case 'trade':
                console.log("received trade" + data.trader_id)
				if (data.trader_id == $scope.trader_id)
				{
					$scope.trades.push(data);
                    $scope.trade_prices.push({'t':new Date(), 'y':data.price});
					let index = findWithAttr($scope.orders, "order_id", data.order_id);
					if (index != -1){
						$scope.orders[index].volume -= data.volume;
						if ($scope.orders[index].volume <= 0){
							$scope.orders = $scope.orders.filter(
								(elem) => {return elem.order_id != data.order_id;});
						}
					}
					$scope.$apply();
				}
				break;
            case 'order':
                console.log("received order" + data.trader_id)
                if (data.trader_id == $scope.trader_id)
				{
					$scope.orders.push(data)
					$scope.$apply();
				}
				break;

            default:
                console.error(
                    "unsupported event", data);
        }

    };

	function findWithAttr(array, attr, value) {
		for(var i = 0; i < array.length; i += 1) {
			if(array[i][attr] === value) {
				return i;
			}
		}
		return -1;
	}

    function uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}

	var ctx = document.getElementById("orderbook_chart").getContext('2d');
	$scope.orderbook_chart = new Chart(ctx, {
		type: 'line',
		data: {
			datasets: [
				{
                    label: 'Bid',
                    data: $scope.top_bids,
                    steppedLine: 'before',
                    borderColor: "#00ff00"
                },
				{
                    label: 'Ask', 
                    data: $scope.top_asks,
                    steppedLine: 'before',
                    borderColor: "#ff0000",
                },
                {
                    label: 'Trades', 
                    data: $scope.trade_prices,
                    steppedLine: 'before',
                    showLine: false,
                    borderColor: "#ff00ff",
                    pointStyle: "dot",
                    pointRadius: 6,
                    fill: true
                }
			]
		},
		options: {
            responsive: true,
            title: {
                display: true,
                text: "Orderbook and Trades"
            },
			scales: {
				yAxes: [{
                    distribution: 'linear',
					ticks: {
						beginAtZero:false
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
            /*
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
            }*/
		}
	});

});

