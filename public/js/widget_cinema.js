$(document).ready(function() {
	console.log("ready");
	$.getJSON("cinema", function(data) {
		console.log("wut");
		var idxMovie = 0;
		var movies = "<table>";
		
		$.each(data, function(key, movie) {
			var img = "<img src='" + movie.img + "'/>";
			var title = "<div class='movieHeader'><span class='title'>" + movie.title + "</span> | " + movie.duration + "</div>";
			var rating = "<progress max='10' value='" + movie.totalRating + "'></progress>";
			var hours = "<br><br>";
			console.log(movie.totalRating);
			var idxHour = 0;
			$.each(movie.hours, function(key, hour) {
				hours += "<div class='hour'>" + hour + "</div> ";
				
				idxHour += 1;
				if (idxHour % 3 == 0)
					hours += "<br>";
			});
			
			
			
			if ((idxMovie % 2) == 0) { movies += "<tr>"; }
			
			movies += "<td><div class='movie'><div class='thumbnail'>" + img + "</div>" + "<div class='meta'>" + title + rating + hours + "</div></div></td>";
			
			if ((idxMovie % 2) == 1) { movies += "</tr>"; }
			
			idxMovie = idxMovie + 1;
		});
		
		movies += "</table>";
		$("#cinema").append(movies);
	});
});