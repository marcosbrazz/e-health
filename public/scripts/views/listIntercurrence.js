function init() {
	loadIntercurrences();
}

function formatDate(d) {
	return d.getHours() + ":" + d.getMinutes() + " - " + d.getDate() + "/" + d.getMonth() + 1 + "/" + d.getFullYear();
}

function loadIntercurrences() {
	$('#intercurrences-table').dataTable({
        "responsive": true,
        "paging": false,
        "ajax": "/api/intercurrence",
        "columns": [
            { "data": "patient" },
            { "data": function(row) {
				var d = new Date(row.timeOcurrence);
				var dateFormatted = moment(d).format('hh:mm a - DD/MM/YYYY');
				return dateFormatted;
			}},
            { "data": "intercurrence" }
        ],
        "oLanguage": {
        	"sEmptyTable": "No intercurrences available."
        },
        "rowCallback": function(row, data, index) {
	        if (data.severity == "serious" ) {
	          $(row).addClass('serious');
	        }
        }
    });
		
} 

init();