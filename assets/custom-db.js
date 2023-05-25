// Arrays/Dictionaries necessary for database function (state, filters, filtersActive) found at bottom of file

// Values in JSON are usually strings, but for fields with multiple attributes they are arrays

// When multiple different filters are active, they are treated as AND operators
// When multiple values are selected for one filter, they are treated as OR operators
// Example: 'kbSeries' set to "G80" and "G81", 'kbModel' set to "3000"
// Positive results must have 'kbSeries' of "G80" OR "G81" AND 'kbModel' of "3000"




// Declaring masterTable array for database data
var masterTable = []
// Declaring randomMax for Random KBD functionality
var randomMax

// On page load:
// Fetch db json
// Insert json data into masterTable var, set current queryset to masterTable data. 
// Retains 'masterTable' variable, as querySet will be overwritten if filters are used
// Adjust randomMax based on number of json entries
// Create random integer between 0 and randomMax, for Random KBD
// Call buildFilters and buildTable to complete page
$(document).ready(function(){

$.ajax({
  method: 'GET',
  url:'assets/database.json',
  success:function(response){
    masterTable = response
    randomMax = response.length
    randomEntry = Math.round(Math.random() * randomMax)
    state.querySet = masterTable
    buildFilters()
    buildTable()
  }
})
})



//
//
// Page building functions
//
//



// Build filter selectpickers, and the list of unique options contained within
function buildFilters(){
    // Iterate over list of filters
    for (var k = 0; k < filters.length; k++){
        const index = filters[k];
        // Find filter element
        var filter = document.getElementById(`${index}`)
        // Fetches list of unique values in every field of JSON data
        const uniqueItemsPre = [...new Map(masterTable.map(item => [item[`${index}`]]))]
        // Create Set for unique values available to filter element
        const uniqueItems = new Set()
        
        // Values in JSON file are usually strings, but in some cases can be arrays
        // Handle both cases; in the case of arrays, split into strings
        // Add all values to uniqueItems map
        for (var i = 0; i < uniqueItemsPre.length; i++){
            if (Array.isArray(uniqueItemsPre[i][0])){
                for (var j = 0; j < uniqueItemsPre[i][0].length; j++){
                uniqueItems.add(uniqueItemsPre[i][0][j])
                }
            } else if (uniqueItemsPre[i][0] != ""){
                uniqueItems.add(uniqueItemsPre[i][0])
            }
        }
        // Convert Set to array, sorts alphabetically
        const sortedUniqueItems = Array.from(uniqueItems).sort()
        // Inserts unique options into filter element
        sortedUniqueItems.forEach(item => filter.innerHTML += `<option>${item}</option>`)
    }
    // Refresh selectpickers
    $('.selectpicker').selectpicker('refresh');
}

// Builds table for current query set (default: masterTable, with filters in effect: filteredData)
function buildTable(){
    var table = $('#table-body')

    var data = pagination(state.querySet, state.page, state.rows)

    keyboards = data.querySet

    for (var i in keyboards){
        var row = `<tr>
                    <td><a href="keyboard.html#${keyboards[i].Index}" target="_blank" style="display:inline-block; width:100%; height:100%;">${keyboards[i].kbSeries}</a></td>
                    <td><a href="keyboard.html#${keyboards[i].Index}" target="_blank" style="display:inline-block; width:100%; height:100%;">${keyboards[i].kbModel}</a></td>
                    <td><a href="keyboard.html#${keyboards[i].Index}" target="_blank" style="display:inline-block; width:100%; height:100%;">${keyboards[i].kbExtension}</a></td>
                    <td class="hideon4">${keyboards[i].kbSwitch}</td>
                    <td class="hideon4">${keyboards[i].kbInterface}</td>
                    <td class="hideon4">${keyboards[i].kbBrand}</td>
                    <td class="hideon4">${keyboards[i].caseStyle}</td>
                    <td class="hideon3">${keyboards[i].languagePrimary}</td>
                    <td class="hideon3">${keyboards[i].languageSecondary}</td>
                    <td class="hideon3">${keyboards[i].layoutSize}</td>
                    <td class="hideon3">${keyboards[i].layoutType}</td>
                    <td class="hideon1">${keyboards[i].keycapMaterial}</td>
                    <td class="hideon1">${keyboards[i].keycapThickness}</td>
                    <td class="hideon1">${keyboards[i].keycapPrimary}</td>
                    <td class="hideon1">${keyboards[i].keycapSub}</td>
                    <td class="hideon1">${keyboards[i].keycapScheme}</td>
                    </tr>`
        table.append(row)
    }
    // Rebuilds page buttons based on number of pages for current queryset
    pageButtons(data.pages)
}


// Fetches keyboards to be displayed on current page from querySet, based on page and number of rows supplied
// Returns 'trimmedData' - keyboards to be listed on current page
// Returns 'pages' - total page count, based on current queryset
function pagination(querySet, page, rows){
    var trimStart = (page - 1) * rows
    var trimEnd = trimStart + rows

    var trimmedData = querySet.slice(trimStart, trimEnd)

    var pages = Math.ceil(querySet.length/rows)

    return{
        'querySet':trimmedData,
        'pages':pages
    }
}

// Builds page buttons based on number of pages for current dataset, and calls buildTable when a page is changed
function pageButtons(pages){
    var wrapper = document.getElementById('pagination-wrapper')
    wrapper.innerHTML = ''
    var maxLeft = (state.page - Math.floor(state.window/2))
    var maxRight = (state.page + Math.floor(state.window/2))
    if (maxLeft < 1){
        maxLeft = 1
        maxRight = state.window
    }
    if (maxRight > pages){
        maxLeft = pages - (state.window - 1)
        maxRight = pages
        if (maxLeft < 1){
        maxLeft = 1
        }
    }
    for (var page = maxLeft; page < state.page; page ++){
        wrapper.innerHTML += `<button value=${page} class="page btn btn-sm btn-secondary">${page}</button>`
    }
    wrapper.innerHTML += `<button value=${state.page} class="page btn btn-sm btn-danger">${state.page}</button>`
    for (var page = (state.page + 1); page <= maxRight; page ++){
        wrapper.innerHTML += `<button value=${page} class="page btn btn-sm btn-secondary">${page}</button>`
    }
    wrapper.innerHTML = `<button value=${1} class="page btn btn-sm btn-secondary hideon4">&#171; First</button>` + wrapper.innerHTML
    wrapper.innerHTML += `<button value=${pages} class="page btn btn-sm btn-secondary hideon4">Last &#187;</button>`
    $('.page').on('click', function(){
        $('#table-body').empty()
        state.page = Number($(this).val())
        buildTable()
    })
}





//
//
// Data filtering
//
//



// Finds common elements between two arrays, for keyboards that have array/s as value/s
function findCommonElement(array1, array2) {
    for(let i = 0; i < array1.length; i++) {
        for(let j = 0; j < array2.length; j++) {
            // Compare the element of each and
            // every element from both of the
            // arrays
            if(array1[i] === array2[j]) {
                // Return if common element found
                return true;
            }
        }
    }
    
    // Return if no common element exist
    return false;
}
  

// Iterate over keyboards to check if they match active filters
// Matches are inserted into filteredData
// buildTable called after completion
function searchTable(data){
    var filteredData = []
    // Iterate over keyboards to check if they match active filters
    for (var i = 0; i < data.length; i++){
        var match = filters.every(function(filter){
            // If filter is empty, it's inactive - no check needed
            if (filtersActive[filter][0] == ""){
                return filter
            
            // If data to be checked is an array, use findCommonElements function to check for a match
            } else if (Array.isArray(data[i][filter])) {
                if (findCommonElement(data[i][filter], filtersActive[filter])) {
                return filter
                }
            // If not, check if active filter (array) includes given value - if it does, there's a match
            } else {
                if (filtersActive[filter].includes(data[i][filter])){
                    return filter
                }
            }
        })
        // If keyboard matches, add to filteredData
        if (match){
        filteredData.push(data[i])
        }
    }
    state.querySet = filteredData
    var table = document.getElementById('table-body')
    table.innerHTML = ''
    buildTable()
}

// When selectpicker value is changed, insert currently active filters into filtersActive dictionary
// Then call searchTable
$('.selectpicker').on('change', function(){
    // Reset page number
    state.page = 1
    // Get filter name and value for changed element
    var value = $(this).val()
    var filter = $(this).attr('id')

    // If value.lenght > 0, filter is active
    if (value.length > 0){
    filtersActive[filter] = value
    searchTable(masterTable)} else {
        // If value.length = 0, filter is inactive
        filtersActive[filter] = [""]
        searchTable(masterTable)
    }
})


//
//
// Extra functions
//
//


// Below a certain size, the filter sidebar is removed
// Function to extend the database to fill the empty space
function screenSize(x) {
if (x.matches) { // If media query matches
    document.getElementById("db-container").classList.remove('col-10');
    document.getElementById("db-container").classList.add('col-12');
} else {
    document.getElementById("db-container").classList.remove('col-12');
    document.getElementById("db-container").classList.add('col-10');
}
}

// Adds listener function to detect when screen size goes below 1595px
var x = window.matchMedia("(max-width: 1595px)")
screenSize(x)
x.addListener(screenSize)


// Theme setting function
function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.documentElement.className = themeName;
}


// Immediately invoked function to set the theme on initial load
(function () {
    if (localStorage.getItem('theme') === 'theme-dark') {
    setTheme('theme-dark');
    } else if (localStorage.getItem('theme') === 'theme-light') {
    setTheme('theme-light');
    } else {
    setTheme('theme-classic');
    }    
})();

// Picks a random integer between 0 and randomMax
// Sets 'Random KBD' button href to a keyboard with this ID
function randomer(){
    randomEntry = Math.round(Math.random() * randomMax)
    document.getElementById("random").href=`keyboard.html#${randomEntry}`
}


// Adjusts number of table rows on screen resize
// Bodged
tableHeightRaw = window.innerHeight-215
tableHeightAdj = tableHeightRaw - 10
rowQuantityRaw = tableHeightAdj/28.781
rowQuantity = Math.floor(rowQuantityRaw)

$(window).resize(function() {
    tableHeightRaw = window.innerHeight-215
    tableHeightAdj = tableHeightRaw - 10
    rowQuantityRaw = tableHeightAdj/28.781
    rowQuantity = Math.floor(rowQuantityRaw)
    state.rows = rowQuantity
    $('#table-body').empty()
    buildTable();
});


// Adjusts layout when toggler menu is opened/closed (for smaller screens)
function togglerEvent() {
    var toggler = document.getElementById('toggler');
    if(toggler.classList.contains('collapsed' || 'collapsing')){
        tableHeightRaw = window.innerHeight-215
        tableHeightAdj = tableHeightRaw - 10
        rowQuantityRaw = tableHeightAdj/28.781
        rowQuantity = Math.floor(rowQuantityRaw)
        state.rows = rowQuantity
        $('#table-body').empty()
        buildTable();
    } else {
        tableHeightRaw = window.innerHeight-444
        tableHeightAdj = tableHeightRaw - 10
        rowQuantityRaw = tableHeightAdj/28.781
        rowQuantity = Math.floor(rowQuantityRaw)
        state.rows = rowQuantity
        $('#table-body').empty()
        buildTable();
    }
}
  
  


// vars for database functionality
var state = {
    'querySet':masterTable,
    'page':1,
    'rows':rowQuantity,
    'window':5,
    }
    
// List of filters / JSON keys
var filters = [
    "kbSeries",
    "kbModel",
    "kbExtension",
    "kbSwitch",
    "kbInterface",
    "kbBrand",
    "caseStyle",
    "languagePrimary",
    "languageSecondary",
    "layoutSize",
    "layoutType",
    "keycapMaterial",
    "keycapThickness",
    "keycapPrimary",
    "keycapSub",
    "keycapScheme",
    "kbKRO",
    "kbFeature",
    "switchPlate",
    "switchSuper",
    "switchLock",
    "caseColour",
    "keycapNonstandard",
    "keycapSide",
    "keycapSecColour",
    "keycapSideColour",
    "keycapColour",
    "keycapWindow",
    "keycapCaps",
    "keycapMX",
    "keycapReleg",
    "keycapBottomTop",
    "keycapSpace",
    "layoutWin"
]

// Currently active filter values
var filtersActive = {
    "kbSeries": [""],
    "kbModel": [""],
    "kbExtension": [""],
    "kbSwitch": [""],
    "kbInterface": [""],
    "kbBrand": [""],
    "caseStyle": [""],
    "languagePrimary": [""],
    "languageSecondary": [""],
    "layoutSize": [""],
    "layoutType": [""],
    "keycapMaterial": [""],
    "keycapThickness": [""],
    "keycapPrimary": [""],
    "keycapSub": [""],
    "keycapScheme": [""],
    "kbKRO": [""],
    "kbFeature": [""],
    "switchPlate": [""],
    "switchSuper": [""],
    "switchLock": [""],
    "caseColour": [""],
    "keycapNonstandard": [""],
    "keycapSide": [""],
    "keycapSecColour": [""],
    "keycapSideColour": [""],
    "keycapColour": [""],
    "keycapWindow": [""],
    "keycapCaps": [""],
    "keycapMX": [""],
    "keycapReleg": [""],
    "keycapBottomTop": [""],
    "keycapSpace": [""],
    "layoutWin": [""]
}