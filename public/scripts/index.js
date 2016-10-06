
function init() {
	bindEventHandlers();
}

function bindEventHandlers() {
	$("#register").click(function() {
		$.ajax({
			method: 'POST',
			url: '/api/intercurrence',
			async: true,
			data: {
				intercurrence: $("#intercurrence").val()
			}
		}).done(function(msg) {
			$("#classification").html(msg);
		}).fail(function(jqXHR, textStatus) {
			$("#classification").html("Registration failed: " + textStatus + "   " + JSON.stringify(jqXHR));
		});
	});
}

init();