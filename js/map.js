// ----------------------------------------
// Load the data
// ----------------------------------------

let ego_df, village_df;
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

loadData('ego.json', 'village.json')
	.then(([ego, village]) => {
		// Do something with the loaded data
		ego_df = ego;
		village_df = village;
		// console.log('ego_df:', ego_df);
		// console.log('village_df:', village_df);
		// Perform further actions here
		updateDropdown(ego_df);

		// filter the data by the first year in the dropdown
		filteredData = filterByYear(ego_df, document.getElementById('yearDropdown').value);

		// update the visualization with the filtered data
		updateVisualization(filteredData);
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
			// create a div for the household
			householdDiv = document.createElement('div');
			householdDiv.className = 'household';
			// create a header for the household
			householdHeader = document.createElement('h3');
			householdHeader.innerHTML = household;
			householdDiv.appendChild(householdHeader);

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
			createGridData(ego_array);

			ego.forEach(ego => {
				// get the data for the ego
				egoData = getFourthLevelItems(data, village, household, ego);

				// create a div for the ego
				createEgoCard(egoData, egocounter);
				
				egocounter++;
			});
			
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
// grid
// ----------------------------------------

function createGridData(ego) {
	console.log(ego)
	gridData = [];
	
	

	return gridData;
}


function createGrid(gridData) {
	const gridContainer = document.createElement('div');
	gridContainer.classList.add('grid-container');

	for (let row = 1; row <= 4; row++) {
		for (let col = 1; col <= 4; col++) {
			const cellData = gridData.find(cell => cell.row === row.toString() && cell.column === col.toString());
			const cell = document.createElement('div');
			cell.classList.add('grid-item');
			if (cellData) {
				cell.style.backgroundColor = cellData.color;
				cell.textContent = cellData.label;
			} else {
				cell.style.backgroundColor = 'gainsboro';
			}
			cell.style.gridColumn = col;
			cell.style.gridRow = row;
			gridContainer.appendChild(cell);
		}
	}

	return gridContainer;
}

// ----------------------------------------
// dropdown
// ----------------------------------------

function updateDropdown(data) {
	// get the years from the data
	years = getTopLevelItems(data);
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
		// filter the data by the selected year
		filteredData = filterByYear(ego_df, this.value);
		// update the visualization with the filtered data
		updateVisualization(filteredData);
	});
	// add an event listener to the previous button
	document.getElementById('previousYear').addEventListener('click', function() {
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

function createEgoCard(egoData, egocounter) {
	// create a div for the ego
	egoDiv = document.createElement('div');
	egoDiv.className = 'ego';

	// create a header for the ego
	egoHeader = document.createElement('h3');
	age = document.getElementById('yearDropdown').value - egoData.birthnac;
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
		bornhtml += '<br>born in another village: '+getVillageInfo(egoData.birth_vil,egoData.vil_id);
	}
	// lifespan html
	if (egoData.death === 0) {
		lifespanhtml = 'death year unknown';
	} else {
		lifespanhtml = egoData.birthnac + '~' + egoData.death+' death at '+deathage;
	}
	
	// rel
	if (egoData.rel === 1) {
		relhtml = '<span style="font-size:1.5rem">★</span>';
	} else if (egoData.rel === 2) {
		relhtml = 'stem kin';
	} else if (egoData.rel === 3) {
		relhtml = 'spouse of stem kin';
	} else if (egoData.rel === 4) {
		relhtml = 'non-stem kin';
	} else if (egoData.rel === 5) {
		relhtml = 'non kin';
	} else if (egoData.rel === 6) {
		relhtml = 'servant';
	} else if (egoData.rel === 7) {
		relhtml = '<span style="font-size:1.5rem;color:red;">★</span>';
	}

	// icon
	if (age < 15 && egoData.nsex === 'M') {
		iconhtml = '<span class="icon">👦🏻</span>';
	} else if (age < 15 && egoData.nsex === 'F') {
		iconhtml = '<span class="icon">👧🏻</span>';
	} else if (age >= 15 && age<60 && egoData.nsex === 'M') {
		iconhtml = '<span class="icon">🧔🏻</span>';
	} else if (age >= 15 && age<60 && egoData.nsex === 'F') {
		iconhtml = '<span class="icon">👩🏻</span>';
	} else if (age >= 60 && egoData.nsex === 'M') {
		iconhtml = '<span class="icon">👴🏼</span>';
	} else if (age >= 60 && egoData.nsex === 'F') {
		iconhtml = '<span class="icon">👵🏼</span>';
	}

	egoHeader.innerHTML = egocounter + '. <b>' + iconhtml + ' ' + age + ' years old</b> '+relhtml+'<br>'+lifespanhtml+'<br>'+bornhtml+'<br><span class="lifeline">'+createLifeLine(egoData.birthnac, document.getElementById('yearDropdown').value, egoData.death)+'</span>';

	// egoHeader.innerHTML = egocounter + '. <b>' + iconhtml + ' ' + age + ' years old</b> '+relhtml+'<br>'+lifespanhtml+'<br>'+egoData.ego+'(ego)<br>'+egoData.father+'(father)'+'<br>'+egoData.mother+'(mother)'+bornhtml+'<br><span class="lifeline">'+createLifeLine(egoData.birthnac, document.getElementById('yearDropdown').value, egoData.death)+'</span>';

	egoDiv.appendChild(egoHeader);
	
	// if egoData nsex is M, set the color to blue, else set it to red
	// calculate age by subtracting the dropdown year from the egoData birthnac
	// append the age to the egoDiv
	// egoDiv.style.backgroundColor = egoData.nsex === 'M' ? 'lightblue' : 'lightcoral';
	egoDiv.className = egoData.nsex ===	'M' ? 'egoMale' : 'egoFemale';

	// append the ego to the household
	householdDiv.appendChild(egoDiv);		
	
	// return the ego div
	return egoDiv;

}		




// function to look up village information by village id
function getVillageInfo(from_vil_id,to_vil_id) {
	console.log('village id: '+from_vil_id);
	// find and filter the village data by the village id
	from_village =  village_df.find(village_df => village_df.vil_id === from_vil_id);
	console.log('village info: '+from_village);
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
			village_map_url = 'https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+ff0000('+to_village.Longitude+','+to_village.Latitude+'),pin-s+555555('+from_village.Longitude+','+from_village.Latitude+')/auto/300x200?access_token=pk.eyJ1IjoieW9obWFuIiwiYSI6IkxuRThfNFkifQ.u2xRJMiChx914U7mOZMiZw'
		}
		// village_map_url = 'https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+555555('+village.Longitude+','+village.Latitude+')/137.3574,38.5705,2.78,0/300x200?access_token=pk.eyJ1IjoieW9obWFuIiwiYSI6IkxuRThfNFkifQ.u2xRJMiChx914U7mOZMiZw'
		// create html img tag with village map url
		village_map_html = '<img class="map" src="'+village_map_url+'">';
		return from_village.Mura+' '+from_village.Gun+' '+from_village.Kuni+'<br>'+village_map_html;
	}
}

