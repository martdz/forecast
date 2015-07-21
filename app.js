$(function(){


	var DEG = 'С';

	var weatherDiv = $('#weather'),
		scroller = $('#scroller'),
		location = $('h2'),
		expandedCurrentForecast = $('.expandedCurrentForecast ul'),
		slideNextWeather = $('.slideNextWeather'),
		table = $('#daily');


	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
	}
	else{
		showError("Your browser does not support Geolocation!");
	}


	function locationSuccess(position) {

		try{

			var cache = localStorage.weatherCache && JSON.parse(localStorage.weatherCache);
			var cache2 = localStorage.weatherCache2 && JSON.parse(localStorage.weatherCache2);

			var d = new Date();

			if(cache && cache2 && cache.timestamp && cache2.timestamp && cache.timestamp > d.getTime() - 30*60*1000){

				var offset = d.getTimezoneOffset()*60*1000;
				var city = cache.data.city.name;
				var country = cache.data.city.country;
			

				$.each(cache.data.list, function(){

					var localTime = new Date(this.dt*1000 - offset);

					addWeather(
						moment(localTime).format('D MMM'),
						convertTemperature(this.temp.max) + '°' + DEG,
						this.weather[0].icon
					);
	
				});
				$.each(cache2.data.list, function(){

					var localTime = new Date(this.dt*1000 - offset);

					addWeather2(
						moment(localTime).format('h:mm a'),
						this.weather[0].icon,
						convertTemperature(this.main.temp) + ' °' + DEG,
						this.wind.speed + ' m/s',
						this.main.humidity + ' %',
						this.main.pressure + ' hPa'
					);
			
				});
		
				var weatherAPI3 = 'http://api.openweathermap.org/data/2.5/weather?lat='+position.coords.latitude+
									'&lon='+position.coords.longitude+'&lang=uk'+'&callback=?'
									
				$.getJSON(weatherAPI3, {}, function(json){  
					
					$('.mainWeather').html('');
                                                         
					$('.mainWeather').append('<h3 class="currentDate">' + moment(json.localTime).format('dddd MMM D h:mm a') + '</h3>')
									.append('<div>' + '<img src="image/'+ json.weather[0].icon +'.png" />' + '</div>')
									.append('<div>' + convertTemperature(json.main.temp_max) + '°' + DEG + '</div>')
									.append('<p>'  + json.weather[0].description + '</p>');
                           
				});
				
				var weatherAPI4 = 'http://api.openweathermap.org/data/2.5/forecast/daily?lat='+position.coords.latitude+
									'&lon='+position.coords.longitude+'&cnt=10&lang=uk&callback=?'
									
									
				$.getJSON(weatherAPI4, function(data) {
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
				


				location.html(city +', <b>' + country + '</b>');
			

				weatherDiv.addClass('loaded');
				table.addClass('loaded');

				showSlide(0);

			}

			else{
			

				var weatherAPI = 'http://api.openweathermap.org/data/2.5/forecast/daily?lat='+position.coords.latitude+
									'&lon='+position.coords.longitude+'&cnt=16&&callback=?'

				$.getJSON(weatherAPI, function(response){

					localStorage.weatherCache = JSON.stringify({
						timestamp:(new Date()).getTime(),
						data: response
					});

					locationSuccess(position); 
				});
				
				var weatherAPI2 = 'http://api.openweathermap.org/data/2.5/forecast?lat='+position.coords.latitude+
									'&lon='+position.coords.longitude+'&callback=?'

				$.getJSON(weatherAPI2, function(response){

					localStorage.weatherCache2 = JSON.stringify({
						timestamp:(new Date()).getTime(),
						data: response
					});

					locationSuccess(position); 
				});
			}
		}
		catch(e){
			showError("We can't find information about your city!");
			window.console && console.error(e);
		}
	}

	function addWeather(day, temp, icon){

		var markup = '<li>' + 
						'<div>' + day + '</div>' +
						'<div>' + temp + '</div>' + 
						'<div>' + '<img src="image/' + icon + '.png" />' + '</div>' + 
					'</li>';

		scroller.append(markup);
	}
	function addWeather2(day, icon, temp, wind, humidity, pressure){

		var markup2 = '<li>' +
							'<div>' + day + '</div>' + 
							'<div>' + '<img src="image/'+ icon +'.png" />'+ '</div>' +
							'<div>' + temp + '</div>' + 
							'<div>' + wind + '</div>' + 
							'<div>' + humidity + '</div>' + 
							'<div>' + pressure + '</div>' +
						'</li>';

		expandedCurrentForecast.append(markup2);
	}

	var currentSlide = 0;
	slideNextWeather.find('#arrowPrew').click(function(e){
		e.preventDefault();
		showSlide(currentSlide-1);
	});

	slideNextWeather.find('#arrowNext').click(function(e){
		e.preventDefault();
		showSlide(currentSlide+1);
	});


	$(document).keydown(function(e){
		switch(e.keyCode){
			case 38: 
				slideNextWeather.find('#arrowPrew').click();
			break;
			case 40:
				slideNextWeather.find('#arrowNext').click();
			break;
		}
	});

	function showSlide(i){
		var items = scroller.find('li');

		if (i >= items.length || i < 0 || i == 10 || scroller.is(':animated')){
			return false;
		}

		items.animate({top:(-i*46)+'px'}, function(){
			currentSlide = i;
		});
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
		return Math.round(DEG == 'С' ? (kelvin - 273.15) : (kelvin*9/5 - 459.67));
	}

	function showError(msg){
		weatherDiv.addClass('error').html(msg);
	}

});
