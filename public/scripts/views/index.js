
function init() {
	bindEventHandlers();
	loadMenu();
}

function bindEventHandlers() {
	$("#register").click(function() {
		var interText = $("#intercurrence").val();
		if(!interText || interText == '') {
			interText = $("#intercurrence").attr("placeholder");
		}
		
		$.ajax({
			method: 'POST',
			url: '/api/intercurrence',
			async: true,
			data: {
				intercurrence: interText
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
	
	$("#clean").click(function() {
		$("#intercurrence").val('');
	});
		
}

function loadMenu() {
	$('#menu').load('/menu');
}

init();