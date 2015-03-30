function setStatus(message) {
	$('#portal-status-line').html(message);
} 

function clearStatus() {
	return setStatus('&nbsp;');
}