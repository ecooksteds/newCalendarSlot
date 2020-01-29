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

function adminCreateSlot(e) {
	e.preventDefault();
	// filtering data here
	var data = {
		meetingID: meetingID.value,
		day: day.value.replace(/ /g, ""),
		date: new Date(date.value),
		timeStart: timeStart.value.replace(/ /g, ""),
		timeEnd: timeEnd.value.replace(/ /g, ""),
		status: "ACCEPTED"
	};
	// sending data to server
	axios
		.post("/slot/create/" + data.meetingID, data)
		.then(res => {
			alert(res.data.message);
			date.value = "";
			day.value = "";
			timeStart.value = "";
			timeEnd.value = "";
		})
		.catch(err => {
			alert(err.response.data);
		});
}

var optionalSlots = [];
var currentMeetingID;
var currentSlotId;
function inviteeUpdateSlot(e) {
	e.preventDefault();
	currentMeetingID = meetingID.value;
	currentSlotId = slotId.value;
	optionalSlots.push({
		day: day.value.replace(/ /g, ""),
		date: new Date(date.value),
		timeStart: timeStart.value.replace(/ /g, ""),
		timeEnd: timeEnd.value.replace(/ /g, "")
	});
	date.value = "";
	day.value = "";
	timeStart.value = "";
	timeEnd.value = "";
	alert("a Slot has been added");
}

function checkBestSlot(e) {
	// sending data to server to find best slot for meeting
	e.preventDefault();
	if (optionalSlots.length > 0) {
		axios
			.post("/slot/best/" + currentMeetingID, optionalSlots)
			.then(data => {
				if (data.data.length > 0) {
					displaySearchData(data.data);
				} else {
					alert("no suitable Slot for Meeting");
				}
			})
			.catch(err => {
				alert(err);
			});
	} else {
		alert("please add Slot(s) to find best slot of your meeting");
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
				record.status = "ACCEPTED";
				record.perfection = undefined;
				axios
					.post("/slot/update/" + currentSlotId, record)
					.then(res => {
						alert(res.data.message);
						window.location.href = "/";
					})
					.catch(err => {
						alert(err.response.data);
					});
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

document.addEventListener("DOMContentLoaded", function(event) {
	// Your code to run since DOM is loaded and ready
	document.querySelectorAll("[data-delete-meeting-id]").forEach(btn => {
		btn.addEventListener("click", e => {
			let meetingId = e.target.getAttribute("data-delete-meeting-id");
			axios
				.post("/meeting/delete", {
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
