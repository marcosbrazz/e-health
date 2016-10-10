function init() {
	bindEventHandlers();
	loadMenu();
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

function loadMenu() {
	$('#menu').load('/menu');
}

init();
