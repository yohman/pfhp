// ----------------------------------------
// Variables
// ----------------------------------------

let year, show_egos, show_map, show_lifeline, show_minitimeline;
function initializeParameters() {
	// get url parameters
	const urlParams = new URLSearchParams(window.location.search);
	year = urlParams.get('year') || 1716;
	show_egos = urlParams.get('show_egos') || false;
	show_map = urlParams.get('show_map') || true;
	show_lifeline = urlParams.get('show_lifeline') || true;
	show_minitimeline = urlParams.get('show_minitimeline') || true;

	updateDropdown();

	// set the value for the year dropdown to the year variable
	// document.getElementById('yearDropdown').value = year;

	// filter the data by the first year in the dropdown
	filteredData = filterByYear(ego_df, document.getElementById('yearDropdown').value);

	// update the visualization with the filtered data
	// if vil_id and hhid are url parameters, create a household timeline
	if (urlParams.has('vil_id') && urlParams.has('hhid')) {
		createHouseholdTimeline(urlParams.get('vil_id'), urlParams.get('hhid'));
	}
	else
	{
		updateVisualization(filteredData);
	}
}

// ----------------------------------------
// Event listeners
// ----------------------------------------

document.getElementById('showEgos').addEventListener('change', function() {
	// if it is checked, set show_egos to true
	if (this.checked) {
		show_egos = true;
	}
	// if it is unchecked, set show_egos to false
	else {
		show_egos = false;
	}
	// filter the data by the first year in the dropdown
	filteredData = filterByYear(ego_df, document.getElementById('yearDropdown').value);
	// update the visualization with the filtered data
	updateVisualization(filteredData);

});

// ----------------------------------------
// Load the data
// ----------------------------------------

function loadData(...files) {
	// Function to load a JSON file
	function loadJSON(file) {
		return new Promise((resolve, reject) => {
			fetch(file)
				.then(response => {
					if (!response.ok) {
						throw new Error(`Failed to fetch ${file}: ${response.status} ${response.statusText}`);
					}
					return response.json();
				})
				.then(data => resolve(data))
				.catch(error => reject(error));
		});
	}

	// Load all JSON files concurrently
	const promises = files.map(file => loadJSON(file));

	// Wait for all promises to resolve
	return Promise.all(promises);
}

loadData('ego.json', 'village.json','households.json')
	.then(([ego, village,household]) => {
		// Do something with the loaded data
		ego_df = ego;
		village_df = village;
		household_df=household;
		// Perform further actions here

		initializeParameters();
	})
	.catch(error => {
		console.error('Error loading data:', error);
	});


// ----------------------------------------
// Visualization
// ----------------------------------------

function updateVisualization(data) {
	// select the visualization div
	visualization = document.getElementById('visualization');
	// clear the visualization
	visualization.innerHTML = '';
	// delete the back button
	removeDivByClass('.backButton');
		
	// ----------------------------------------
	// villages
	// ----------------------------------------

	villages = getTopLevelItems(data);
	villages.forEach(village => {
		// create a div for the village
		villageDiv = document.createElement('div');
		villageDiv.className = 'village';

		// get the village information
		village_info = getVillageInfo(parseInt(village));

		// create a header for the village
		villageHeader = document.createElement('h2');
		villageHeader.innerHTML = village_info;
		villageDiv.appendChild(villageHeader);
		
		// ----------------------------------------
		// households
		// ----------------------------------------

		households = getSecondLevelItems(data, village);
		households.forEach(household => {
			current_year = document.getElementById('yearDropdown').value

			// create household
			createHousehold(data,current_year,village, household);
			
			// append the household to the village
			villageDiv.appendChild(householdDiv);
		});
		// append the village to the visualization
		visualization.appendChild(villageDiv);
	});

}

// ----------------------------------------
// life line
// ----------------------------------------

function createLifeLine(birthYear, currentYear, deathYear) {
	let lifeline = '';
	const lineLength = deathYear - birthYear + 1;
	for (let i = 0; i < lineLength; i++) {
		if (i === currentYear - birthYear) {
			lifeline += '<span class="currentyear">◯</span>'; // Mark current year with 'C'
		} else if (i === 0 || i === lineLength - 1) {
			lifeline += '|'; // Mark birth and death years with '|'
		} else {
			lifeline += '-'; // Mark other years with '-'
		}
	}
	lifeline += '\n';
	return lifeline;
}

// ----------------------------------------
// dropdown
// ----------------------------------------

function updateDropdown() {
	// get the years from the data
	years = getTopLevelItems(ego_df);

	// select the dropdown
	dropdown = document.getElementById('yearDropdown');
	// add the years to the dropdown
	years.forEach(year => {
		option = document.createElement('option');
		option.value = year;
		option.text = year;
		dropdown.appendChild(option);
	});
	// add an event listener to the dropdown
	dropdown.addEventListener('change', function() {
		// removeMiniTimeline
		removeDivByClass('.mini-timeline');
		// filter the data by the selected year
		filteredData = filterByYear(ego_df, this.value);
		// update the visualization with the filtered data
		updateVisualization(filteredData);
	});

	current_year = document.getElementById('yearDropdown').value

	// add an event listener to the previous button
	document.getElementById('previousYear').addEventListener('click', function() {
		// removeMiniTimeline
		removeDivByClass('.mini-timeline');

		// get the index of the current year in the dropdown
		index = years.indexOf(document.getElementById('yearDropdown').value);
		// if the current year is not the first year
		if (index > 0) {
			// set the dropdown to the previous year
			document.getElementById('yearDropdown').value = years[index - 1];
			// filter the data by the previous year
			filteredData = filterByYear(ego_df, document.getElementById('yearDropdown').value);
			// update the visualization with the filtered data
			updateVisualization(filteredData);
		}
	});
	// add an event listener to the next button
	document.getElementById('nextYear').addEventListener('click', function() {
		
		// removeMiniTimeline
		removeDivByClass('.mini-timeline');

		// get the index of the current year in the dropdown
		index = years.indexOf(document.getElementById('yearDropdown').value);
		// if the current year is not the last year
		if (index < years.length - 1) {
			// set the dropdown to the next year
			document.getElementById('yearDropdown').value = years[index + 1];
			// filter the data by the next year
			filteredData = filterByYear(ego_df, document.getElementById('yearDropdown').value);
			// update the visualization with the filtered data
			updateVisualization(filteredData);
		}
	});
}

function removeDivByClass(classname) {
	const elementToRemove = document.querySelector(classname);
	if (elementToRemove) {
	  elementToRemove.remove();
	} else {
	  console.log('No element found with the class name ', classname);
	}
  }

// ----------------------------------------
// data functions
// ----------------------------------------

// function that filters the data by year
function filterByYear(data, year) {
	return data[year];
}

// function that outputs the items at the top level of the data
function getTopLevelItems(data) {
	return Object.keys(data);
}

// function that outputs the items at the second level of the data
function getSecondLevelItems(data, topLevelItem) {
	return Object.keys(data[topLevelItem]);
}

// function that outputs the items at the third level of the data
function getThirdLevelItems(data, topLevelItem, secondLevelItem) {
	return Object.keys(data[topLevelItem][secondLevelItem]);
}

// function that outputs the items at the fourth level of the data
function getFourthLevelItems(data, topLevelItem, secondLevelItem, thirdLevelItem) {
	return data[topLevelItem][secondLevelItem][thirdLevelItem];
}

// ----------------------------------------
// ego
// ----------------------------------------

function createEgoCard(egoData, egocounter,year,show_lifeline = true,show_map = true) {
	// create a div for the ego
	egoDiv = document.createElement('div');
	egoDiv.className = 'ego';

	// create a header for the ego
	egoHeader = document.createElement('h3');

	// create a variable for the age
	// if year is not defined, use the dropdown year
	if (year === undefined) {
		age = document.getElementById('yearDropdown').value - egoData.birthnac;
	} else {
		age = year - egoData.birthnac;
	}
	deathage=egoData.death-egoData.birthnac;
	
	// make ego a number
	ego = parseInt(ego);
	// if nsex is M, use male emoji, else use female emoji
	if (egoData.nsex === 'M') {
		nsexhtml = '<span class="male">㊚</span>';
	} else {
		nsexhtml = '<span class="female">㊛</span>';
	}

	// check if birth_vil is different from vil_id
	bornhtml = '';
	if (egoData.birth_vil !== egoData.vil_id) {
		bornhtml += '<br><span style="font-size:1.2rem">➟⌂</span> '+getVillageInfo(egoData.birth_vil,egoData.vil_id,show_map);
	}
	// lifespan html
	if (egoData.death === 0) {
		lifespanhtml = 'death year unknown';
	} else {
		lifespanhtml = egoData.birthnac + '~' + egoData.death+' ('+deathage+')';
	}
	
	// rel
	if (egoData.rel === 1) {
		relhtml = '<span style="font-size:1.5rem">★</span><br>';
	} else if (egoData.rel === 2) {
		relhtml = '<br>stem kin';
	} else if (egoData.rel === 3) {
		relhtml = '<br>semi-stem kin';
	} else if (egoData.rel === 4) {
		relhtml = '<br>non-stem kin';
	} else if (egoData.rel === 5) {
		relhtml = '<br>non kin';
	} else if (egoData.rel === 6) {
		relhtml = '<br>servant';
	} else if (egoData.rel === 7) {
		relhtml = '<span style="font-size:1.5rem;color:red;">★</span><br>';
	}

	// icon
	if (age < 4 && egoData.nsex === 'M') {
		iconhtml = '<span class="icon">👶🏻</span>';
	} else if (age < 4 && egoData.nsex === 'F') {
		iconhtml = '<span class="icon">👶🏻</span>';

	} else if (age >= 4 && age < 15 && egoData.nsex === 'M') {
		iconhtml = '<span class="icon">👦🏻</span>';
	} else if (age >= 4 && age < 15 && egoData.nsex === 'F') {
		iconhtml = '<span class="icon">👧🏻</span>';

	} else if (age >= 15 && age<30 && egoData.nsex === 'M') {
		iconhtml = '<span class="icon">👨🏻</span>';
	} else if (age >= 15 && age<30 && egoData.nsex === 'F') {
		iconhtml = '<span class="icon">🧒🏻</span>';

	} else if (age >= 30 && age<55 && egoData.nsex === 'M') {
		iconhtml = '<span class="icon">🧔🏻</span>';
	} else if (age >= 30 && age<55 && egoData.nsex === 'F') {
		iconhtml = '<span class="icon">👩🏻</span>';

	} else if (age >= 55 && egoData.nsex === 'M') {
		iconhtml = '<span class="icon">👴🏼</span>';
	} else if (age >= 55 && egoData.nsex === 'F') {
		iconhtml = '<span class="icon">👵🏼</span>';
	}

	// if lifeline is true, create a lifeline
	if (show_lifeline) {
		lifelinehtml = '<br><span class="lifeline">'+createLifeLine(egoData.birthnac, year, egoData.death)+'</span>';
	} else {
		lifelinehtml = '';
	}

	egoHeader.innerHTML = egocounter + '. <b>' + iconhtml + ' ' + age + '歳</b>'+relhtml+'<br>'+lifespanhtml+bornhtml+lifelinehtml;

	// egoHeader.innerHTML = egocounter + '. <b>' + iconhtml + ' ' + age + ' years old</b> '+relhtml+'<br>'+lifespanhtml+'<br>'+egoData.ego+'(ego)<br>'+egoData.father+'(father)'+'<br>'+egoData.mother+'(mother)'+bornhtml+'<br><span class="lifeline">'+createLifeLine(egoData.birthnac, document.getElementById('yearDropdown').value, egoData.death)+'</span>';

	egoDiv.appendChild(egoHeader);
	
	// if egoData nsex is M, set the color to blue, else set it to red
	// calculate age by subtracting the dropdown year from the egoData birthnac
	// append the age to the egoDiv
	// egoDiv.style.backgroundColor = egoData.nsex === 'M' ? 'lightblue' : 'lightcoral';
	egoDiv.className = egoData.nsex ===	'M' ? 'egoMale' : 'egoFemale';

	// override if servant
	if (egoData.rel === 6) {
		egoDiv.className = 'egoServant';
	}

	// override if non kin 4 or 5	
	if (egoData.rel === 4) {
		egoDiv.className = 'egoNonKin';
	}
	if (egoData.rel === 5) {
		egoDiv.className = 'egoNonKin';
	}
	// append the ego to the household
	householdDiv.appendChild(egoDiv);		
	
	// return the ego div
	return egoDiv;

}		

function createMiniEgoCard(egoData, egocounter,year,show_lifeline = true,show_map = true) {
	// create a div for the ego
	egoDiv = document.createElement('div');
	egoDiv.className = 'mini-ego';
	
	// rel
	// 	1 household head
	// 	2 stem kin (child, grandchild, parents, 
	// 	  grandparents; incl. adopted/step)
	// 	3 semi-stem kin (spouse of stem kin)
	// 	4 non-stem kin (siblings, uncle/aunt, nephew/niece,
	// 	  cousin)
	// 	5 non kin (neither kin nor servants)
	// 	6 servant
	// 	7 spouse of head  
	//  9 unknown   


	if (egoData.rel === 1) {
		relhtml = '<span class="ego-head">★</span>';
	} else if (egoData.rel === 2) {
		relhtml = '<span class="ego-head-kin"></span>';
	} else if (egoData.rel === 3) {
		relhtml = '<span class="ego-head-kin"></span>';
	} else if (egoData.rel === 4) {
		relhtml = '<span class="ego-head-nonkin"></span>';
	} else if (egoData.rel === 5) {
		relhtml = '<span class="ego-head-nonkin"></span>';
	} else if (egoData.rel === 6) {
		relhtml = '<span class="ego-head-servant"></span>';
	} else if (egoData.rel === 7) {
		relhtml = '<span class="ego-head-spouse">●</span>';
	}
	


	egoDiv.innerHTML = relhtml;

	egoDiv.className = egoData.nsex ===	'M' ? 'mini-egoMale' : 'mini-egoFemale';

	// append the ego to the household
	minihouseholdDiv.appendChild(egoDiv);		
	
	// return the ego div
	return egoDiv;

}		

// ----------------------------------------
// create household
// ----------------------------------------

function createHousehold(data,current_year,village, household,show_lifeline = true,show_map = true,show_minitimeline = true) {

	// create a div for the household
	householdDiv = document.createElement('div');
	householdDiv.className = 'household';
	// create a header for the household
	householdHeader = document.createElement('h3');
	
	// add onclick event to household header to createHouseholdTimeline function
	householdHeader.onclick = function() {
		createHouseholdTimeline(village,household);
	}
	householdHeader.style.cursor = 'pointer';
	householdHeader.innerHTML = household + '--▶︎';
	householdDiv.appendChild(householdHeader);

	// add mini timeline to household
	if (show_minitimeline) {
		miniContainerDiv = document.createElement('div');
		miniContainerDiv.className = 'mini-timeline';
		miniContainerDiv.appendChild(createHouseholdMiniTimeline(village,household));
		miniContainerDiv.style.cursor = 'pointer';
		miniContainerDiv.onclick = function() {
			createHouseholdTimeline(village,household);
		}
		householdDiv.appendChild(miniContainerDiv);
	}

	// householdDiv.appendChild(createHouseholdMiniTimeline(village,household));

	// ----------------------------------------
	// ego
	// ----------------------------------------

	if (show_egos) {
		ego = getThirdLevelItems(data, village, household);

		// order the ego by looking up the birthnac
		ego.sort((a, b) => {
			return data[village][household][a].birthnac - data[village][household][b].birthnac;
		});
		
		egocounter = 1;
		// get the data for each ego and put it in an array
		ego_array = [];
		ego.forEach(ego => {
			ego_array.push(getFourthLevelItems(data, village, household, ego));
		})

		ego.forEach(ego => {
			// get the data for the ego
			egoData = getFourthLevelItems(data, village, household, ego);

			// create a div for the ego
			createEgoCard(egoData, egocounter,current_year,show_lifeline,show_map);
			
			egocounter++;
		});
	}
	
	return householdDiv;
}


function createMiniHousehold(data,current_year,village, household,show_lifeline = true,show_map = true) {

	// create a div for the household
	minihouseholdDiv = document.createElement('div');
	minihouseholdDiv.className = 'minihousehold';

	// ----------------------------------------
	// ego
	// ----------------------------------------

	ego = getThirdLevelItems(data, village, household);

	// order the ego by looking up the birthnac
	ego.sort((a, b) => {
		return data[village][household][a].birthnac - data[village][household][b].birthnac;
	});
	
	egocounter = 1;
	// get the data for each ego and put it in an array
	ego_array = [];
	ego.forEach(ego => {
		ego_array.push(getFourthLevelItems(data, village, household, ego));
	})

	ego.forEach(ego => {
		// get the data for the ego
		egoData = getFourthLevelItems(data, village, household, ego);

		// create a div for the ego
		createMiniEgoCard(egoData, egocounter,current_year,false,false);
		
		egocounter++;
	});
	return minihouseholdDiv;
}

// ----------------------------------------
// village
// ----------------------------------------

function getVillageInfo(from_vil_id,to_vil_id,show_map = true) {

	// find and filter the village data by the village id
	from_village =  village_df.find(village_df => village_df.vil_id === from_vil_id);

	// return the village data
	if (from_village === undefined) {
		return 'village not found';
	}
	else
	{
		//if to_vil_id is not defined, return village info
		if (to_vil_id === undefined) {
			village_map_url = 'https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+ff0000('+from_village.Longitude+','+from_village.Latitude+')/140.1753,37.4844,7,0/300x200?access_token=pk.eyJ1IjoieW9obWFuIiwiYSI6IkxuRThfNFkifQ.u2xRJMiChx914U7mOZMiZw'
		} else {
			//if to_vil_id is defined, return village info with path
			to_village =  village_df.find(village_df => village_df.vil_id === to_vil_id);
			if (to_village === undefined) {
				return 'village not found';
			}
			village_map_url = 'https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+ff0000('+to_village.Longitude+','+to_village.Latitude+'),pin-s+555555('+from_village.Longitude+','+from_village.Latitude+')/auto/100x100?access_token=pk.eyJ1IjoieW9obWFuIiwiYSI6IkxuRThfNFkifQ.u2xRJMiChx914U7mOZMiZw'
		}
		// village_map_url = 'https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+555555('+village.Longitude+','+village.Latitude+')/137.3574,38.5705,2.78,0/300x200?access_token=pk.eyJ1IjoieW9obWFuIiwiYSI6IkxuRThfNFkifQ.u2xRJMiChx914U7mOZMiZw'
		// create html img tag with village map url
		if (show_map) {
			village_map_html = '<img class="map" src="'+village_map_url+'">';
		}
		else
		{
			village_map_html = '';
		}
		return from_village.Mura+' '+from_village.Gun+' '+from_village.Kuni+'<br>'+village_map_html;
	}
}

// ----------------------------------------
// household timeline
// ----------------------------------------

function createHouseholdTimeline(vil_id,hhid) {
	// turn show_egos to true
	show_egos = true;

	// hide the time-dial div
	document.getElementById('timedial').style.display = 'none';

	// create an array of years from the ego data
	const years = Object.keys(ego_df);

	// select the timeline div
	const timeline = document.getElementById('visualization');
	// clear the timeline
	timeline.innerHTML = '';

	// delete the back button
	removeDivByClass('.backButton');

	// create a back button div
	const backButton = document.createElement('div');
	backButton.className = 'backButton';
	backButton.innerHTML = '◀︎ back to households';
	// change cursor to pointer
	backButton.style.cursor = 'pointer';
	backButton.onclick = function() {
		// removeMiniTimeline
		removeDivByClass('.mini-timeline');
		// show the time-dial div
		document.getElementById('timedial').style.display = 'block';
		// filter the data by the first year in the dropdown
		filteredData = filterByYear(ego_df, document.getElementById('yearDropdown').value);
		// update the visualization with the filtered data
		updateVisualization(filteredData);
	}
	// add the mini timeline to the timeline
	const topcontainer = document.getElementById('top-container');
	topcontainer.appendChild(backButton);
	// topcontainer.appendChild('◀︎ back to households')
	topcontainer.appendChild(createHouseholdMiniTimeline(vil_id,hhid));
	
	// loop through the years
	for (const year of years) {
		
		// if the household exists in the year
		if (ego_df[parseInt(year)] && ego_df[parseInt(year)][parseInt(vil_id)] && ego_df[parseInt(year)][parseInt(vil_id)][parseInt(hhid)]) {

			// create a container for the year
			const yearContainer = document.createElement('div');
			yearContainer.className = 'year';
			yearContainer.innerHTML = year;

			// append the year container to the timeline
			filteredData = filterByYear(ego_df, year);
			createHousehold(filteredData,year, vil_id, hhid,false,false,show_minitimeline=false);

			// append the household to the village
			yearContainer.appendChild(householdDiv);

			timeline.appendChild(yearContainer);
		}
	}
	
}

function createHouseholdMiniTimeline(vil_id,hhid) {

	// create an array of years from the ego data
	const years = Object.keys(ego_df);

	// create another div for the graph
	const minitimeline = document.createElement('div');
	minitimeline.className = 'mini-timeline';

	// loop through the years
	for (const year of years) {
		
		// if the household exists in the year
		if (ego_df[parseInt(year)] && ego_df[parseInt(year)][parseInt(vil_id)] && ego_df[parseInt(year)][parseInt(vil_id)][parseInt(hhid)]) {

			// create a container for the year
			const yearContainer = document.createElement('div');

			// if year is the current year, set the class to mini-year current
			if (year == document.getElementById('yearDropdown').value) {
				yearContainer.className = 'mini-year-current';
			}
			else
			{
				yearContainer.className = 'mini-year';
			}

			// append the year container to the timeline
			filteredData = filterByYear(ego_df, year);
			createMiniHousehold(filteredData,year, vil_id, hhid,false,false);

			// append the household to the village
			yearContainer.appendChild(minihouseholdDiv);

			minitimeline.appendChild(yearContainer);
		}
	}
	return minitimeline;
	
}