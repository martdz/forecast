 $(document).ready(function(){   
 

	var DEG = 'C';
	var weatherDiv = $('#weather')
	var table = $('#daily');

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
	}
	else{
		showError("Your browser does not support Geolocation!");
	}


	function locationSuccess(position) {
			var d = new Date();
			var offset = d.getTimezoneOffset()*60*1000;
			
			var weatherAPI = 'http://api.openweathermap.org/data/2.5/forecast/daily?lat='+position.coords.latitude+
									'&lon='+position.coords.longitude+'&cnt=10&lang=uk&callback=?'
									
									
			$.getJSON(weatherAPI, function(data) {
				var items = [];
				$.each(data.list, function() {
				var localTime = new Date(this.dt*1000 - offset);
					items.push('<tr>' + 
									'<td>' + moment(localTime).format('D MMM') + '</td>' + 
									'<td>' + convertTemperature(this.temp.night) + '°' + DEG + '</td>' +
									'<td>' + convertTemperature(this.temp.morn) + '°' + DEG + '</td>' +
									'<td>' + convertTemperature(this.temp.day) + '°' + DEG + '</td>' +
									'<td>' + convertTemperature(this.temp.eve) + '°' + DEG + '</td>' +
									'<td>' + '<img src="image/' + this.weather[0].icon + '.png" />' + '</td>' +
									'<td>' + this.weather[0].description + '</td>' + 
									'<td>' + this.humidity + ' %' + 
									'<td>' + this.pressure + ' hPa' + 
									'<td>' + this.speed + ' m/s' + '</tr>');
				});
				$('<tbody>', {
					'class': 'daily',
					html: items.join('')
				}).appendTo('#daily');

			});  
			weatherDiv.addClass('loaded');
			table.addClass('loaded');
	}

		
		
	function locationError(error){
		switch(error.code) {
			case error.TIMEOUT:
				showError("A timeout occured! Please try again!");
				break;
			case error.POSITION_UNAVAILABLE:
				showError('We can\'t detect your location. Sorry!');
				break;
			case error.PERMISSION_DENIED:
				showError('Please allow geolocation access for this to work.');
				break;
			case error.UNKNOWN_ERROR:
				showError('An unknown error occured!');
				break;
		}

	}

	function convertTemperature(kelvin){
		return Math.round(DEG == 'C' ? (kelvin - 273.15) : (kelvin*9/5 - 459.67));
	}

	function showError(msg){
		weatherDiv.addClass('error').html(msg);
	}

});

	
		