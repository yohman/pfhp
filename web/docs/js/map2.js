// ---------------------------------------- //
//											//
// Variables								//
//											//
// ---------------------------------------- //

let year;
let show_egos;
let show_map;
let show_lifeline;
let show_minitimeline;
let urlParams;
let vil_id;
let hhid;
let overlay;

let tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
let tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

window.onload = function() {
	initializeTooltips();
  };
// ---------------------------------------- //
//											//
// Load the data							//
//											//
// ---------------------------------------- //

loadData('data/ego.json', 'data/village.json','data/households.json')
.then(([ego, village,household]) => {
	// Do something with the loaded data
	ego_df = ego;
	village_df = village;
	household_df=household;

	// hide loading
	hideLoading();
	// once the data is loaded initialize the site
	initializeParameters();
})
.catch(error => {
	console.error('Error loading data:', error);
});

function loadData(...files) {
	// showLoading();
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

// ---------------------------------------- //
//											//
// Initialize the site						//
//											//
// ---------------------------------------- //

function initializeParameters() {

	// get url parameters
	urlParams 			= new URLSearchParams(window.location.search);
	year 				= urlParams.get('year') || 1716;
	show_egos 			= urlParams.get('show_egos') || false;
	show_map 			= urlParams.get('show_map') || true;
	show_lifeline		= urlParams.get('show_lifeline') || true;
	show_minitimeline 	= urlParams.get('show_minitimeline') || true;
	vil_id 				= urlParams.get('vil_id') || 0;
	hhid 				= urlParams.get('hhid') || 0;

	// if village and household are defined, go to household page
	// get url parameters
	urlParams = new URLSearchParams(window.location.search);
	if (urlParams.has('vil_id') && urlParams.has('hhid')) {
		createHouseholdPage(urlParams.get('vil_id'), urlParams.get('hhid'));
	}
	// if only village defined, go to village page
	else if (urlParams.has('vil_id')) {
		createVillagePage(urlParams.get('vil_id'));
	}
	else 
	{
	// if no parameters are defined, go to the main page
		createHomePage();
	}
}

// ---------------------------------------- //
//                   						//
// Create the homepage 						//
//                   						//
// ---------------------------------------- //

function createHomePage() {
	// remove vil_id and hhid from the url
	removeParameterFromUrl('vil_id');
	removeParameterFromUrl('hhid');

	// select the visualization div
	visualization = document.getElementById('visualization');
	// clear info div
	document.getElementById('info').innerHTML = '';
	// clear the visualization
	visualization.innerHTML = '';
	// delete the back button
	removeDivByClass('.backButton');
		
	// get villages
	villages = getVillages();
	villages.forEach(village => {
		createVillageHeader(village);
	});
}

// ---------------------------------------- //
//                   						//
// Create the village page 					//
//                   						//
// ---------------------------------------- //

function createVillagePage(village) {

	// delete hhid from the url
	removeParameterFromUrl('hhid');

	// clear info div
	document.getElementById('info').innerHTML = '';

	// create a back button div
	const backButton = document.createElement('div');
	backButton.className = 'btn btn-light';
	backButton.innerHTML = '◀︎ back to villages';
	// change cursor to pointer
	backButton.style.cursor = 'pointer';
	backButton.onclick = function() {
		// remove vil_id from the url
		removeParameterFromUrl('vil_id');
		createHomePage();
		// window.location.href = 'households.html';
	}
	// add back button to info
	document.getElementById('info').appendChild(backButton);

	// add legend to info
	document.getElementById('info').appendChild(createLegend());

	// initialize tooltip
	initializeTooltips();

	// add vil_id to the url
	const url = new URL(window.location.href);
	url.searchParams.set('vil_id', village);
	window.history.pushState({}, '', url);

	// get the visualization div
	visualization = document.getElementById('visualization');
	visualization.innerHTML = '';

	// create a div for the village
	createVillageHeader(village);

	// get the households by village id from household_df, which returns an array
	households = household_df[village];

	// loop through the households
	households.forEach(household => {
		// create a mini-timeline for each household
		miniContainerDiv = document.createElement('div');
		miniContainerDiv.className = 'mini-timeline';
		miniContainerDiv.appendChild(createHouseholdMiniTimeline(village,household));
		miniContainerDiv.style.cursor = 'pointer';
		miniContainerDiv.onclick = function() {
			// add vil_id and hhid to the url
			const url = new URL(window.location.href);
			url.searchParams.set('vil_id', village);
			url.searchParams.set('hhid', household);
			window.history.pushState({}, '', url);
			createHouseholdPage(village,household);
			// go to households.html with vil_id and hhid as a url parameter
			// window.location.href = 'households.html?vil_id=' + village + '&hhid=' + household;
		}
		villageDiv.appendChild(miniContainerDiv);
	});
	// append the village to the visualization
	visualization.appendChild(villageDiv);
	// hideloading
	hideLoading();
}

// ---------------------------------------- //
//                   						//
// Create the household page		 		//
//                   						//
// ---------------------------------------- //

function createHouseholdPage(vil_id,hhid) {
	// turn show_egos to true
	show_egos = true;

	// clear info div
	info = document.getElementById('info');
	info.innerHTML = '';

	// create a back button div
	const backButton = document.createElement('div');
	backButton.className = 'btn btn-light';
	backButton.innerHTML = '◀︎ back to village';
	// change cursor to pointer
	backButton.style.cursor = 'pointer';
	backButton.onclick = function() {
		showLoading();
		// if vil_id and hhid are both url parameters, go to households.html with vil_id as a url parameter
		// get url parameters
		urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has('vil_id') && urlParams.has('hhid')) {
			// get rid of hhid from the url parameters
			removeParameterFromUrl('hhid');
			// set timeout to create village page
			setTimeout(function() {
				createVillagePage(vil_id);
			}
			, 100);

			// window.location.href = 'households.html?vil_id=' + vil_id;
		}
		// if only vil_id is a url parameter, go to households.html
		else if (urlParams.has('vil_id')) {
			// get rid of the url parameters
			removeParameterFromUrl('vil_id');
			// set timeout to create home page
			setTimeout(function() {
				createHomePage();
			}
			, 100);
			// window.location.href = 'households.html';
		}
	}
	// add back button to info
	info.appendChild(backButton);
	// add legend to info
	info.appendChild(createLegend());
	// initialize tooltip
	initializeTooltips();
	
	// create an array of years from the ego data
	const years = Object.keys(ego_df);

	// select the timeline div
	const timeline = document.getElementById('visualization');
	// clear the timeline
	timeline.innerHTML = '';

	// delete the back button
	// removeDivByClass('.backButton');


	// add the mini timeline to the timeline
	const topcontainer = document.getElementById('top-container');
	info.appendChild(createHouseholdMiniTimeline(vil_id,hhid));
	
	// loop through the years
	for (const year of years) {
		
		// if the household exists in the year
		if (ego_df[parseInt(year)] && ego_df[parseInt(year)][parseInt(vil_id)] && ego_df[parseInt(year)][parseInt(vil_id)][parseInt(hhid)]) {

			// create a container for the year
			const yearContainer = document.createElement('div');
			yearContainer.className = 'year';
			yearContainer.innerHTML = year;

			// add a parameter for the year to the div
			yearContainer.setAttribute('year', year);

			// append the year container to the timeline
			filteredData = filterByYear(ego_df, year);
			createHousehold(filteredData,year, vil_id, hhid,false,false,show_minitimeline=false);

			// on hover, make the year container visible
			yearContainer.onmouseover = function() {
				// find the household header div with the same year
				householdHeader = document.querySelector('.minihousehold-year[year="'+year+'"]');
				// set the display to block
				householdHeader.style.visibility = 'visible';
			}
			// on mouseout, set the header display to none
			yearContainer.onmouseout = function() {
				// find the household header div with the same year
				householdHeader = document.querySelector('.minihousehold-year[year="'+year+'"]');
				// set the display to none
				householdHeader.style.visibility = 'hidden';
			}

			// append the household to the village
			yearContainer.appendChild(householdDiv);

			timeline.appendChild(yearContainer);
		}
	}
	// scroll to top
	window.scrollTo(0, 0);
}

// ---------------------------------------- //
//                   						//
// Create the household mini timeline		//
//                   						//
// ---------------------------------------- //

function createHouseholdMiniTimeline(vil_id,hhid) {

	// setup
	// get years where there is data for this village
	const years = getYearsByVillage(vil_id);
	const minitimeline 		= document.createElement('div');
	const minititle 		= document.createElement('div');

	minitimeline.className 	= 'mini-timeline';
	minititle.className 	= 'mini-title';
	minititle.innerHTML 	= 'Household '+hhid+'--▶︎';;
	minitimeline.appendChild(minititle);

	// get first and last year from years
	const firstYear 		= years[0];
	const lastYear 			= years[years.length-1];

	// start a loop from the first year to the last year
	for (let year = firstYear; year <= lastYear; year++) {
		
		// if the household exists in the year
		if (ego_df[parseInt(year)] && ego_df[parseInt(year)][parseInt(vil_id)] && ego_df[parseInt(year)][parseInt(vil_id)][parseInt(hhid)]) {

			// create a container for the year
			const yearContainer 	= document.createElement('div');
			yearContainer.className = 'mini-year';
			yearContainer.setAttribute('year', year);

			// on hover, scroll to the household div with the same year
			const urlParams = new URLSearchParams(window.location.search);
			if (urlParams.has('hhid')) {

				yearContainer.onmouseover = function() {
					console.log('yearContainer.onmouseover',year);
					// query all divs in visualization, and find  the div with the same year
					sameyearDivs = document.querySelectorAll('.year[year="'+year+'"]');
					console.log('sameyearDivs',sameyearDivs);
					sameyearDivs.forEach(sameyearDiv => {
						// ease scroll to the div scroll to top
						sameyearDiv.scrollIntoView();
						window.scrollTo(0, 0);
					});
				}		
			}

			// append the year container to the timeline
			filteredData = filterByYear(ego_df, year);
			createMiniHousehold(filteredData,year, vil_id, hhid,false,false);

			// append the household to the village
			yearContainer.appendChild(minihouseholdDiv);

			minitimeline.appendChild(yearContainer);
		}
		else
		{
			// create a container for the year
			const yearContainer = document.createElement('div');
			yearContainer.className = 'mini-year';
			yearContainer.setAttribute('year', year);
			// createEmptyMiniHousehold();
			yearContainer.appendChild(createEmptyMiniHousehold(year));
			// yearContainer.innerHTML = '-';
			minitimeline.appendChild(yearContainer);
		}
	}
	return minitimeline;
	
}

// ---------------------------------------- //
//                   						//
// Village functions 						//
//                   						//
// ---------------------------------------- //

function createVillageHeader(village) {
	// create a div for the village
	villageDiv = document.createElement('div');
	villageDiv.className = 'village';
	// get the village information
	village_info = getVillageInfo(parseInt(village));

	// create a header for the village
	villageHeader = document.createElement('div');
	villageHeader.innerHTML = village_info;
	villageDiv.appendChild(villageHeader);
	// make the village header clickable
	villageHeader.style.cursor = 'pointer';

	// click the div to go to base url with vil_id
	villageHeader.onclick = function() {

		showLoading();
		
		// add vil_id to the url
		const url = new URL(window.location.href);
		url.searchParams.set('vil_id', village);
		window.history.pushState({}, '', url);

		// after a delay, go to the village page
		setTimeout(function() {
			createVillagePage(village);
		}, 100);

		// createVillagePage(village);
	}
	// append the village to the visualization
	visualization.appendChild(villageDiv);
}

function getVillageInfo(vil_id) {

	// find and filter the village data by the village id
	from_village =  village_df.find(village_df => village_df.vil_id === vil_id);

	// return the village data
	if (from_village === undefined) {
		return 'village not found';
	}
	else
	{
		if (show_map) {
			village_map_url = 'https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+ff0000('+from_village.Longitude+','+from_village.Latitude+')/140.1753,37.4844,7,0/300x200?access_token=pk.eyJ1IjoieW9obWFuIiwiYSI6IkxuRThfNFkifQ.u2xRJMiChx914U7mOZMiZw'
			village_map_html = '<img class="map" src="'+village_map_url+'">';
		}
		else
		{
			village_map_html = '';
		}
		return '<span style="font-size:1rem">'+from_village.Mura+' '+from_village.Gun+' '+from_village.Kuni+'<br>'+village_map_html+'</span>';
	}
}

function getVillages() {
	// get the villages from the data, which returns an array
	return Object.keys(household_df);
}

// ---------------------------------------- //
//                   						//
// data functions							//
//                   						//
// ---------------------------------------- //

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

// ---------------------------------------- //
//                   						//
// ego										//
//                   						//
// ---------------------------------------- //

function createEgoCard(egoData, egocounter,year,show_lifeline = true,show_map = true) {
	// create a div for the ego
	egoDiv = document.createElement('div');
	egoDiv.className = 'ego';

	// add a parameter for the ego in the div
	egoDiv.setAttribute('ego', egoData.ego);

	// on hover, highlight other divs with the same ego on the mini timeline
	egoDiv.onmouseover = function() {
		
		// for all other divs with different ego, set the divs opacity to 0.2
		for (const div of document.querySelectorAll('div[ego]:not([ego="'+egoData.ego+'"])')) {
			div.style.opacity = 0.2;
		}

	}
	// on mouseout, remove the highlight
	egoDiv.onmouseout = function() {
		
		// for all other divs with different ego, set the divs opacity to 1
		for (const div of document.querySelectorAll('div[ego]:not([ego="'+egoData.ego+'"])')) {
			div.style.opacity = 1;
		}
	}

	// create a header for the ego
	egoHeader = document.createElement('span');

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

	// check if birth_vil is different from vil_id
	bornhtml = '';
	if (egoData.birth_vil !== egoData.vil_id) {
		from_village =  village_df.find(village_df => village_df.vil_id === egoData.birth_vil);
		if (from_village === undefined) {
			bornhtml += '<br><span class="from-village">village not found</span>';
		}
		else
		{
			bornhtml += '<br><span class="from-village-icon">➟⌂</span> <span class="from-village">'+from_village.Mura+'</span>';
		}
			
	}
	// lifespan html
	if (egoData.death === 0) {
		lifespanhtml = '<span class="lifespan">'+egoData.birthnac + '~</span>';
	} else {
		lifespanhtml = '<span class="lifespan">'+egoData.birthnac + '~' + egoData.death+' ('+deathage+')</span>';
	}
	
	// rel
	if (egoData.rel === 1) {
		relhtml = '<span class="star">★</span>';
	} else if (egoData.rel === 7) {
		relhtml = '<span class="star">●</span>';
	}
	else {
		relhtml = '';
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

	egoHeader.innerHTML = iconhtml + '<br><span class="age">' + age + '</span></b>歳'+relhtml+'<br>'+lifespanhtml+bornhtml;
	// egoHeader.innerHTML = egocounter + '. <b>' + iconhtml + ' <span class="age">' + age + '</span></b>歳'+relhtml+'<br>'+lifespanhtml+bornhtml;

	egoDiv.appendChild(egoHeader);
	
	// if egoData nsex is M, set the color to blue, else set it to red
	egoDiv.className = egoData.nsex ===	'M' ? 'egoMale' : 'egoFemale';

	// ---------------- //
	// symbolize boxes  //
	// ---------------- //

	// semi stem kin
	if (egoData.rel === 3) {
		egoDiv.style.boxSizing = 'border-box';
		egoDiv.style.borderRight = '10px solid rgba(0,0,0,0.5)';
	}
	// non stem kin
	else if (egoData.rel === 4) {
		egoDiv.style.boxSizing = 'border-box';
		egoDiv.style.borderBottom = '10px solid rgba(0,0,0,0.5)';
	} 
	// servant or non kin
	else if (egoData.rel === 5 || egoData.rel === 6) {
		egoDiv.style.boxSizing = 'border-box';
		egoDiv.style.border = '10px solid rgba(0,0,0,0.5)';	
	}


	// append the ego to the household
	householdDiv.appendChild(egoDiv);		
	
	// return the ego div
	return egoDiv;

}

function createLegend() {
	// create a div for the legend
	legendDiv = document.createElement('div');
	legendDiv.className = 'legend';

	// create a single line for the legend
	let legendHTML = '';
	legendHTML += '<img src="images/box-head.jpg" width=15> household head ';
	legendHTML += '<img src="images/box-head-spouse.jpg" width=15> spouse of head ';
	legendHTML += '<img src="images/box-semi-stem-kin.jpg" width=15> spouse of stem kin ';
	legendHTML += '<img src="images/box-non-stem-kin.jpg" width=15> non-stem kin  <span class="help-icon" data-bs-toggle="tooltip" data-bs-title="siblings, uncle/aunt, nephew/niece,cousin"></span> ';
	legendHTML += '<img src="images/box-servant.jpg" width=15> servant or non kin ';

	// tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
	// tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
	

	legendDiv.innerHTML += legendHTML;
	
	return legendDiv;
}
	

function createMiniEgoCard(egoData,current_year) {
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
	
	// create a div for the ego
	egoDiv = document.createElement('div');
	egoDiv.className = 'mini-ego';
	// add a parameter for the ego in the div
	egoDiv.setAttribute('ego', egoData.ego);	

	
	// set cursor to pointer
	egoDiv.style.cursor = 'pointer';
	
	relhtml = '';
	egoDiv.className = egoData.nsex ===	'M' ? 'mini mini-egoMale' : 'mini mini-egoFemale';
	
	if (egoData.rel === 1){
		relhtml = '<span style="font-size:0.3rem">★</span>';
	}
	// semi stem kin
	else if (egoData.rel === 3) {
		egoDiv.style.boxSizing = 'border-box';
		egoDiv.style.borderRight = '4px solid rgba(0,0,0,0.5)';
	}
	// non stem kin
	else if (egoData.rel === 4) {
		egoDiv.style.boxSizing = 'border-box';
		egoDiv.style.borderBottom = '4px solid rgba(0,0,0,0.5)';
	} 
	// servant or non kin
	else if (egoData.rel === 5 || egoData.rel === 6) {
		egoDiv.style.boxSizing = 'border-box';
		egoDiv.style.border = '3px solid rgba(0,0,0,0.5)';	
	}
	// spouse of head
	else if (egoData.rel === 7) {
		relhtml = '<span style="font-size:0.3rem">●</span>';
	}
	egoDiv.innerHTML = relhtml;


	// on hover, highlight other divs with the same ego on the mini timeline
	// only if hhid is in url
	// get url parameters
	urlParams = new URLSearchParams(window.location.search);
	if (urlParams.has('hhid')) {
		egoDiv.onmouseover = function() {
			// for all other divs with different ego, set the divs opacity to 0.5
			for (const div of document.querySelectorAll('div[ego]:not([ego="'+egoData.ego+'"])')) {
				div.style.opacity = 0.2;
			}
		}
		// on mouseout, remove the highlight
		egoDiv.onmouseout = function() {
			// for all other divs with different ego, set the divs opacity to 1
			for (const div of document.querySelectorAll('div[ego]:not([ego="'+egoData.ego+'"])')) {
				div.style.opacity = 1;
			}
		}
	}

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
	householdHeader = document.createElement('span');
	
	// add onclick event to household header to createHouseholdPage function
	householdHeader.onclick = function() {
		createHouseholdPage(village,household);
	}
	householdHeader.style.cursor = 'pointer';
	// householdHeader.innerHTML = household + '--▶︎';
	householdDiv.appendChild(householdHeader);

	// add mini timeline to household
	if (show_minitimeline) {
		miniContainerDiv = document.createElement('div');
		miniContainerDiv.className = 'mini-timeline';
		miniContainerDiv.appendChild(createHouseholdMiniTimeline(village,household));
		miniContainerDiv.style.cursor = 'pointer';
		miniContainerDiv.onclick = function() {
			createHouseholdPage(village,household);
		}
		householdDiv.appendChild(miniContainerDiv);
	}

	// ----------------------------------------
	// ego
	// ----------------------------------------

	if (show_egos) {
		ego = getThirdLevelItems(data, village, household);

		// // order the ego by looking up the birthnac
		// ego.sort((a, b) => {
		// 	return data[village][household][a].birthnac - data[village][household][b].birthnac;
		// });

	// sort the ego by birthnac but put the servant and non kin at the end
	ego.sort((a, b) => {
		// get the data for the ego
		egoDataA = getFourthLevelItems(data, village, household, a);
		egoDataB = getFourthLevelItems(data, village, household, b);
		// if the ego is a servant or non kin
		if (egoDataA.rel === 5 || egoDataA.rel === 6) {
			// if the ego is a servant or non kin
			if (egoDataB.rel === 5 || egoDataB.rel === 6) {
				// order the ego by looking up the birthnac
				return egoDataA.birthnac - egoDataB.birthnac;
			}
			// if the ego is not a servant or non kin
			else {
				// put the ego at the end
				return 1;
			}
		}
		// if the ego is not a servant or non kin
		else {
			// if the ego is a servant or non kin
			if (egoDataB.rel === 5 || egoDataB.rel === 6) {
				// put the ego at the end
				return -1;
			}
			// if the ego is not a servant or non kin
			else {
				// order the ego by looking up the birthnac
				return egoDataA.birthnac - egoDataB.birthnac;
			}
		}
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

function getEgo(ego){
	// get all instances of ego from ego_df
	// ego_df is structured by year, village or household
	// get ego regardless of year, village or household

	// loop through each year, then each village, then every household and find the ego

	// get the years from the data
	years = getTopLevelItems(ego_df);
	// create an array to store the ego data
	egos = [];

	// loop through the years
	for (const year of years) {
		// get the villages from the data
		villages = getSecondLevelItems(ego_df, year);
		// loop through the villages
		for (const village of villages) {
			// get the households from the data
			households = getSecondLevelItems(ego_df[year], village);
			// loop through the households
			for (const household of households) {
				// get the egos from the data
				egos = getSecondLevelItems(ego_df[year][village], household);
				// loop through the egos
				for (const ego of egos) {
					// if the ego is found, return the data
					if (ego === ego) {
						// add to array
						egos.push(ego_df[year][village][household][ego]);
						// return ego_df[year][village][household][ego];
					}
				}
			}
		}
	}

}

function createEmptyMiniHousehold(current_year) {
	// create a div for the household
	minihouseholdDiv = document.createElement('div');
	minihouseholdDiv.className = 'minihousehold';
	// create a header for the household
	householdHeader = document.createElement('div');
	householdHeader.className = 'minihousehold-year';
	// add the year as a parameter to the div
	householdHeader.setAttribute('year', current_year);
	// add the year to the header
	householdHeader.innerHTML = current_year;
	minihouseholdDiv.appendChild(householdHeader);
	// hide the header
	householdHeader.style.visibility = 'hidden';
	// add year as a parameter to the div
	minihouseholdDiv.setAttribute('year', current_year);

	// on hover, set the header display to block
	minihouseholdDiv.onmouseover = function() {
		// find the household header div with the same year
		householdHeader = document.querySelector('.minihousehold-year[year="'+current_year+'"]');
		// set the display to block
		householdHeader.style.visibility = 'visible';


	}
	// on mouseout, set the header display to none
	minihouseholdDiv.onmouseout = function() {
		// find the household header div with the same year
		householdHeader = document.querySelector('.minihousehold-year[year="'+current_year+'"]');
		// set the display to none
		householdHeader.style.visibility = 'hidden';
	}

	// create an empty household
	householdDiv = document.createElement('div');

	// add multiple classes mini and mini-empty to the household div
	householdDiv.className = 'mini mini-empty';

	// add a span to the household div that is the same size as the ego div
	emptyDiv = document.createElement('span');
	emptyDiv.innerHTML = '';
	householdDiv.appendChild(emptyDiv);	

	minihouseholdDiv.appendChild(householdDiv);


	return minihouseholdDiv;
}

function createMiniHousehold(data,current_year,village, household,show_lifeline = true,show_map = true) {

	// create a div for the household
	minihouseholdDiv 			= document.createElement('div');
	minihouseholdDiv.className 	= 'minihousehold';
	householdHeader 			= document.createElement('div');
	householdHeader.className 	= 'minihousehold-year';
	householdHeader.setAttribute('year', current_year);
	householdHeader.innerHTML	 = current_year;
	minihouseholdDiv.appendChild(householdHeader);

	// hide the year label
	householdHeader.style.visibility = 'hidden';

	// add year as a parameter to the div
	minihouseholdDiv.setAttribute('year', current_year);

	// on hover, show the year label
	minihouseholdDiv.onmouseover = function() {
		// find the household header div with the same year
		householdHeader = document.querySelector('.minihousehold-year[year="'+current_year+'"]');
		// set the display to block
		householdHeader.style.visibility = 'visible';
	}
	// on mouseout, set the header display to none
	minihouseholdDiv.onmouseout = function() {
		// find the household header div with the same year
		householdHeader = document.querySelector('.minihousehold-year[year="'+current_year+'"]');
		// set the display to none
		householdHeader.style.visibility = 'hidden';
	}

	// ----------------------------------------
	// ego
	// ----------------------------------------

	ego = getThirdLevelItems(data, village, household);

	// sort the ego by birthnac but put the servant and non kin at the end
	ego.sort((a, b) => {
		// get the data for the ego
		egoDataA = getFourthLevelItems(data, village, household, a);
		egoDataB = getFourthLevelItems(data, village, household, b);
		// if the ego is a servant or non kin
		if (egoDataA.rel === 5 || egoDataA.rel === 6) {
			// if the ego is a servant or non kin
			if (egoDataB.rel === 5 || egoDataB.rel === 6) {
				// order the ego by looking up the birthnac
				return egoDataA.birthnac - egoDataB.birthnac;
			}
			// if the ego is not a servant or non kin
			else {
				// put the ego at the end
				return 1;
			}
		}
		// if the ego is not a servant or non kin
		else {
			// if the ego is a servant or non kin
			if (egoDataB.rel === 5 || egoDataB.rel === 6) {
				// put the ego at the end
				return -1;
			}
			// if the ego is not a servant or non kin
			else {
				// order the ego by looking up the birthnac
				return egoDataA.birthnac - egoDataB.birthnac;
			}
		}
	});


	// order the ego by looking up the birthnac
	// ego.sort((a, b) => {
	// 	return data[village][household][a].birthnac - data[village][household][b].birthnac;
	// });
	
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
		createMiniEgoCard(egoData,current_year,false,false);
		
		egocounter++;
	});
	return minihouseholdDiv;
}


// ----------------------------------------
// household stats
// ----------------------------------------

function householdStats(vil_id,hhid){
	// find number of distinct egos with the same vil_id and hhid in the ego data
	// do so by looping through the every year of the ego data
	// and checking if the household exists in each year
	// if it does, add the number of egos in the household to the total
	// create an array of years from the ego data
	const years = Object.keys(ego_df);
	// create an array for the number of egos
	egos = [];
	// loop through the years
	for (const year of years) {
		// if the household exists in the year
		if (ego_df[parseInt(year)] && ego_df[parseInt(year)][parseInt(vil_id)] && ego_df[parseInt(year)][parseInt(vil_id)][parseInt(hhid)]) {
			// get the number of egos in the household
			egos.push(getThirdLevelItems(ego_df[parseInt(year)], vil_id, hhid).length);
		}
	}
	// sum the number of egos
	total = egos.reduce((a, b) => a + b, 0);

	// find the number of distinct egos
	// do so by creating a set from the egos array
	distinct = new Set(egos);
	// find the size of the set
	distinct = distinct.size;

	// find the number of years the household exists
	// do so by finding the first year that this household exists
	// and the last year that this household exists
	// if the household exists in the year
	if (ego_df[parseInt(years[0])] && ego_df[parseInt(years[0])][parseInt(vil_id)] && ego_df[parseInt(years[0])][parseInt(vil_id)][parseInt(hhid)]) {
		// get the first year
		firstYear = years[0];
	}
	// if the household exists in the year
	if (ego_df[parseInt(years[years.length-1])] && ego_df[parseInt(years[years.length-1])][parseInt(vil_id)] && ego_df[parseInt(years[years.length-1])][parseInt(vil_id)][parseInt(hhid)]) {
		// get the last year
		lastYear = years[years.length-1];
	}
	// if the first year is the same as the last year
	if (firstYear === lastYear) {
		// set the years to the first year
		years = firstYear;
	} else {
		// set the years to the first year to the last year
		years = firstYear + ' to ' + lastYear;
	}

	// create a div for the stats
	stats = document.createElement('div');
	stats.className = 'stats';
	// add the years to the stats
	stats.innerHTML = 'years: '+years;

	// add the total number of egos to the stats
	stats.innerHTML = '<br>total: '+total+' egos';
	// add the number of distinct egos to the stats
	stats.innerHTML += '<br>distinct: '+distinct+' egos';

	return stats;


}

function getYearsByVillage(vil_id) {
	// create an array of years from the ego data
	const years = Object.keys(ego_df);
	// create an array for the village years
	villageYears = [];
	// loop through the years
	for (const year of years) {
		// if the village exists in the year
		if (ego_df[parseInt(year)] && ego_df[parseInt(year)][parseInt(vil_id)]) {
			// add the year to the village years
			villageYears.push(year);
		}
	}
	// return the village years
	return villageYears;
}



// ---------------------------------------- //
//                   						//
// Misc functions							//
//                   						//
// ---------------------------------------- //

function removeDivByClass(classname) {
	const elementToRemove = document.querySelector(classname);
	if (elementToRemove) {
	  elementToRemove.remove();
	} else {
	  console.log('No element found with the class name ', classname);
	}
}


function showLoading() {

	overlay = document.getElementById('loadingOverlay');
    overlay.style.display = 'block';

}

function hideLoading() {
	// hide overlay if overlay.style.display is not none
	overlay = document.getElementById('loadingOverlay');
	overlay.style.display = 'none';
}

function removeParameterFromUrl(parameter) {
    // Get the current URL
    var url = window.location.href;

    // Create a regular expression pattern to match the parameter
    var pattern = new RegExp('&?' + parameter + '=[^&]*', 'g');

    // Replace the parameter with an empty string
    var newUrl = url.replace(pattern, '');

    // If the parameter was found and removed, update the URL
    if (newUrl !== url) {
        window.history.replaceState({}, document.title, newUrl);
    }
}

// Create a function to initialize tooltips
function initializeTooltips() {
	tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
	tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
    // $('[data-bs-toggle="tooltip"]').tooltip(); // Initialize tooltips for all elements with data-toggle="tooltip"
}