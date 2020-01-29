document.querySelectorAll("#timeStart, #timeEnd").forEach(el => {
	el.addEventListener("focusout", e => {
		let val = e.target.value.toUpperCase().replace(" ", "");
		console.log(val);
		if (/^[0-9]{1,2}:(00|15|30|45|60)(\s+)?(AM|PM)$/.test(val)) {
			el.value = val;
			return;
		}
		alert("time should be in [hh:mm p] format. use 15 min interval.");
		el.value = "";
	});
});
