function onChageDate(e) {
	// find day of week
	e.preventDefault();
	var weekday = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	];
	var dt = new Date(e.target.value);
	document.getElementById("day").value = weekday[dt.getDay()];
}
var optionalSlot = [];
function setMeeting(e) {
	e.preventDefault();
	var dateobj = new Date(date.value);
	var B = dateobj.toISOString();
	// filtering data here
	var data = {
		meetingID: meetingID.value,
		day: day.value.replace(/ /g, "").toLowerCase(),
		date: B,
		timeStart: timeStart.value.replace(/ /g, ""),
		timeEnd: timeEnd.value.replace(/ /g, "")
	};
	// sending data to server
	axios
		.post("/api/setMeeting", data)
		.then(res => {
			date.value = "";
			day.value = "";
			timeStart.value = "";
			timeEnd.value = "";
			alert(res.data.message);
			window.location.href = "/home";
		})
		.catch(err => {
			alert(err.response.data);
		});
}

function addSlotFN(e) {
	// adding slot data in array
	e.preventDefault();
	var dateobj = new Date(date.value);
	var B = dateobj.toISOString();
	var data = {
		meetingID: meetingID.value,
		day: day.value.replace(/ /g, "").toLowerCase(),
		date: B,
		timeStart: timeStart.value.replace(/ /g, ""),
		timeEnd: timeEnd.value.replace(/ /g, "")
	};
	optionalSlot.push(data);
	date.value = "";
	day.value = "";
	timeStart.value = "";
	timeEnd.value = "";
	alert("A Slot Has Been Added");
}
function checkBestSlot(e) {
	// sending data to server to find best slot for meeting
	e.preventDefault();
	if (optionalSlot.length > 0) {
		axios
			.post("/checkslot", optionalSlot)
			.then(data => {
				if (data.data.length > 0) {
					displaySearchData(data.data);
				} else {
					alert("No Suitable Slot for Meeting");
				}
			})
			.catch(err => {
				alert(err);
			});
	} else {
		alert("Please Add Slot(s) to Find Best Slot Your Meeting");
	}
}
function displaySearchData(data) {
	// dispalying data in table view with JavaScript Dom Manipulation
	if (data.length > 0) {
		var parent = document.getElementById("table");
		if (parent.children.length > 0) {
			var childTable = document.getElementById("dispalyDataNode");
			parent.removeChild(childTable);
		}
		var table = document.createElement("table");
		table.id = "dispalyDataNode";
		table.className = "table table-bordered";
		var thead = document.createElement("thead");
		var thr = document.createElement("tr");

		var th1 = document.createElement("th");
		th1.innerText = "Date";
		var th2 = document.createElement("th");
		th2.innerText = "Day";
		var th3 = document.createElement("th");
		th3.innerText = "Time Start";
		var th4 = document.createElement("th");
		th4.innerText = "Time End";

		var th5 = document.createElement("th");
		th5.innerText = "Action";

		thr.appendChild(th1);
		thr.appendChild(th2);
		thr.appendChild(th3);
		thr.appendChild(th4);
		thr.appendChild(th5);

		thead.appendChild(thr);
		table.appendChild(thead);
		var tbody = document.createElement("tbody");
		data.forEach(function(record) {
			var tr = document.createElement("tr");
			var td1 = document.createElement("td");
			var td2 = document.createElement("td");
			var td3 = document.createElement("td");
			var td4 = document.createElement("td");
			var td5 = document.createElement("td");
			var btn = document.createElement("button");
			btn.className = "accept-btn";
			btn.innerText = "Accept";
			btn.onclick = event => {
				event.preventDefault();
				acceptSlotFN(record);
			};
			td1.innerText = new Date(record.date).toLocaleDateString();
			td2.innerText = record.day;
			td3.innerText = record.timeStart;
			td4.innerText = record.timeEnd;
			td5.appendChild(btn);

			tr.appendChild(td1);
			tr.appendChild(td2);
			tr.appendChild(td3);
			tr.appendChild(td4);
			tr.appendChild(td5);

			tbody.appendChild(tr);
			table.appendChild(tbody);
			document.getElementById("table").appendChild(table);
			document.getElementById("mess").style.display = "block";
		});
	} else {
		var parent = document.getElementById("table");
		if (parent.children.length > 0) {
			var childTable = document.getElementById("dispalyDataNode");
			parent.removeChild(childTable);
			document.getElementById("mess").style.display = "none";
		}
	}
}

function acceptSlotFN(data) {
	// sending data to server that user ready to accept the Meeting
	axios
		.post("/acceptmeeting", data)
		.then(data => {
			alert(data.data.message);
			optionalSlot = [];
			window.location.href = "/home";
		})
		.catch(err => {
			alert(err);
			optionalSlot = [];
		});
}
document.addEventListener("DOMContentLoaded", function(event) {
	// Your code to run since DOM is loaded and ready
	document.querySelectorAll("[data-delete-meeting-id]").forEach(btn => {
		btn.addEventListener("click", e => {
			let meetingId = e.target.getAttribute("data-delete-meeting-id");
			axios
				.post("/api/meeting/delete", {
					meetingID: meetingId
				})
				.then(response => {
					alert(response.data.message);
					window.location.reload();
				})
				.catch(err => {
					alert(err.response.data.message);
				});
		});
	});
});
