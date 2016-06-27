var photofilepath = "frame.jpg";
var photoTaken = false;
var uploadingPhoto = false;
function callbackGesturePhoto(gesture) {
	if (gesture.palm && gesture.elapsedTimeWithSameGesture > 1)
		bringBackMainMenu();
	else if (!uploadingPhoto && photoTaken && gesture.thumbsUp && gesture.elapsedTimeWithSameGesture > 1)
		uploadPhotoToDrive();
}

function uploadPhotoToDrive() {
	uploadingPhoto = true;
	$("#uploadLibelle").html("Uploading photo to Dropbox");
	$.get("motion/uploadPhoto/" + photofilepath, function(data) {
		$("#uploadLibelle").html("Photo succesfully uploaded");
	}).fail(function (err) {
		$("#uploadLibelle").html("Failed to upload photo");
		console.log(err);
	});
}

function displayPhoto(retryAttempt) {
	console.log("Display photo");
	$.get("doesFileExist/" + photofilepath, function(data) {
		photoTaken = true;
		$("#photoTaken").show().attr("src", photofilepath);
		$("#countdown").hide();
		$("#uploadLibelle").show();
	}).fail(function (err) {
		retryAttempt += 1;
		if (retryAttempt > 0)
			setTimeout(function() { displayPhoto(retryAttempt); }, 250);
	});
}

function takePhoto() {
	$.get("motion/takePhoto/" + photofilepath, function(data) {
		displayPhoto(25);
	}).fail(function (err) {
		console.log("Motion server offline probably");
	});;
}

var startCountdown = 3;
$(document).ready(function() {
	setTimeout(takePhoto, 1000 * startCountdown);
	
	for (countdown = startCountdown; countdown >= 0; countdown--) {
		(function(localCountdown) {
			setTimeout(function() {
				console.log("COUNTDOWN!" + localCountdown);
				$("#countdown").text(localCountdown);	
			}, 1000 * startCountdown - 1000 * localCountdown);
		})(countdown);
	}
});