
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
			var isSerious = msg.top_class === "serious";
			if(isSerious) {
				$("#notifyDocModal").modal();
			}
			else {
				$("#sucessNote").fadeIn({
					complete: function() {
						$(this).fadeOut(5000);
					}
				});
			}
		}).fail(function(jqXHR, textStatus) {
			$("#classification").html("Registration failed: " + textStatus + "   " + JSON.stringify(jqXHR));
		});
	});
		
}

init();