function init() {
	bindEventHandlers();
}


function bindEventHandlers() {
	$("#startTraining").click(function() {
		$.ajax({
			method: 'POST',
			url: '/api/train',
			async: true
		}).done(function(msg) {
			$("#trainingResult").html(msg);
		}).fail(function(jqXHR, textStatus) {
			$("#trainingResult").html("Training failed: " + textStatus + "   " + JSON.stringify(jqXHR));
		});
	});
}

init();
