const displayedImage = document.querySelector('.displayed-img');
const displayedImageMobile = document.querySelector('.displayed-img-mobile');
const thumbBar = document.querySelector('.thumb-bar');
const imageWrapper = document.querySelector('.image-wrapper')
const imageWrapperMobile = document.querySelector('.image-wrapper-mobile')
const creditName = document.querySelector('.credit');
const creditLink = document.querySelector('.credit-link');
const creditNameMobile = document.querySelector('.credit-mobile');
const creditLinkMobile = document.querySelector('.credit-link-mobile');
const btn = document.querySelector('button');
const overlay = document.querySelector('.overlay');


// Functions differently to other randomer() function:
// Changes URL to match randomly generated integer
// Changes keyboardID to that integer, then runs ready() again
// Changes page content directly for smooth browsing
function randomer_keyboard(){
    randomEntry = Math.round(Math.random() * randomMax)
    document.getElementById("random").href=`keyboard.html#${randomEntry}`
    keyboardID = randomEntry
    thumbBar.innerHTML = ''
    creditName.innerHTML = "Is this image yours? Click me!"
    creditNameMobile.innerHTML = "Is this image yours? Click me!"
    creditLink.setAttribute('href', "credit.html")
    creditLinkMobile.setAttribute('href', "credit.html")
    imageWrapper.removeAttribute('href')
    imageWrapperMobile.removeAttribute('href')
    ready()
}



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


//
//
// Page setup
//
//

// Fetch keyboard ID
var keyboardID = window.location.hash.substr(1);

var masterTable = []

$(document).ready(ready);

// On page load
// Fetch database, place into masterTable
// Place data for specific keyboard into keyboardData
// Set up Random KBD function
// Fetch images/PDFs
// Set up page layout based on what is retrieved

function ready(){
    $.ajax({
    method: 'GET',
    url:'assets/database.json',
    success:function(response){
        masterTable = response
        randomMax = response.length-1
        randomEntry = Math.round(Math.random() * randomMax)
        document.getElementById("random").href=`keyboard.html#${randomEntry}`
        var keyboardData = masterTable.filter(obj => {
        return obj.Index == keyboardID
        })
        keyboardData = keyboardData[0]

    
        //
        //
        // Fetch images/PDFs, image/PDF setup
        //
        //


        // Initial image
        $.ajax({
            // Standard URL for first image from first source
            url: 'images/'+keyboardData.kbSeries+'/'+keyboardData.kbModel+'/'+keyboardData.kbExtension+'/'+keyboardData.Index+'/'+keyboardData.kbSeries+'-'+keyboardData.kbModel+keyboardData.kbExtension+'-ref1-1.jpg',
            type:'HEAD',


            // If request fails, there are two possibilities
            // First source is a PDF, not an image
            // First source doesn't exist - no images for this keyboard
            error: function()
            {
                // If "PDF" found in refImagecount1, adjust URL to PDF URL
                // Place PDF into imageWrappers
                if (keyboardData["refImagecount1"].split(",")[0] == "PDF") {
                    imageWrapper.innerHTML = `<object data="PDFs/${keyboardData["refImagecount1"].split(",")[1]}.pdf"><object>`
                    imageWrapperMobile.innerHTML = `<object data="PDFs/${keyboardData["refImagecount1"].split(",")[1]}.pdf"><object>`
                // If no "PDF" found, use 'noimage.jpg' message
                } else {
                document.querySelector('.displayed-img').src = `images/noimage.jpg`
                document.querySelector('.displayed-img-mobile').src = `images/noimage.jpg`
                }
            },

            // If request succeeds, first source has images
            success: function()
            {
                // Place image URL into imagewrapper
                imageWrapper.innerHTML = `<img class="displayed-img" src="images/${keyboardData.kbSeries}/${keyboardData.kbModel}/${keyboardData.kbExtension}/${keyboardData.Index}/${keyboardData.kbSeries}-${keyboardData.kbModel}${keyboardData.kbExtension}-ref1-1.jpg"><div class="comment"></div>`
                imageWrapperMobile.innerHTML = `<img class="displayed-img-mobile" src="images/${keyboardData.kbSeries}/${keyboardData.kbModel}/${keyboardData.kbExtension}/${keyboardData.Index}/${keyboardData.kbSeries}-${keyboardData.kbModel}${keyboardData.kbExtension}-ref1-1.jpg"><div class="comment-mobile"></div>`
                // If first source has a comment, place comment into comment elements, and make them visible
                if (keyboardData["comment1"] !== "") {
                    document.querySelector('.comment').innerHTML = keyboardData["comment1"]
                    document.querySelector('.comment-mobile').innerHTML = keyboardData["comment1"]
                    document.querySelector('.comment').style.display = "block"
                    document.querySelector('.comment-mobile').style.display = "block"
                // Otherwise, make them invisible
                } else {
                    document.querySelector('.comment').style.display = "none"
                    document.querySelector('.comment-mobile').style.display = "none"
                }
                // If first source has a known author, place author name/URL into author elements, and make them visible
                if (keyboardData["refAuthor1"] !== "") {
                    creditName.innerHTML = `Photo by ${keyboardData["refAuthor1"]}`
                    creditNameMobile.innerHTML = `Photo by ${keyboardData["refAuthor1"]}`
                }
                if (keyboardData["refSite1"] !== "") {
                    creditLink.setAttribute('href', keyboardData["refSite1"])
                    creditLinkMobile.setAttribute('href', keyboardData["refSite1"])
                }
            }
        });

        // Iterate over number of image/PDF sources (refQuantity)
        for(let i = 1; i <= keyboardData.refQuantity; i++){

            // Fetch number of images for given source, and detect if source is a PDF
            var counter = eval(`keyboardData.refImagecount${i}`)

            // If PDF:
            if (counter.split(",")[0] == "PDF") {
                // Create PDF thumbnail using pdf.png, add to thumbnail bar
                pdfLink = `PDFs/${counter.split(",")[1]}.pdf`
                const pdfImage = document.createElement('img');
                pdfImage.setAttribute('src', `images/pdf.png`);
                pdfImage.setAttribute('href', pdfLink);
                thumbBar.appendChild(pdfImage);
                // When thumbnail is clicked, present PDF and set credit and comment to none (PDFs have no credit or comment)
                pdfImage.onclick = function(d) {
                    pdfLocation = d.target.getAttribute("href");
                    imageWrapper.innerHTML = `<object data=${pdfLocation}><object>`
                    imageWrapperMobile.innerHTML = `<object data=${pdfLocation}><object>`
                    creditName.innerHTML = "Is this image yours? Click me!"
                    creditNameMobile.innerHTML = "Is this image yours? Click me!"
                    creditLink.setAttribute('href', "credit.html")
                    creditLinkMobile.setAttribute('href', "credit.html")
                    document.querySelector('.comment').style.display = "none"
                    document.querySelector('.comment-mobile').style.display = "none"
                }

            // If image:
            } else {
                // Iterate over number of images for given source
                for(let j = 1; j <= counter; j++) {

                    // Create thumbnails, add to thumbnail bar
                    const newImage = document.createElement('img');
                    newImage.setAttribute('src', `images/${keyboardData.kbSeries}/${keyboardData.kbModel}/${keyboardData.kbExtension}/${keyboardData.Index}/${keyboardData.kbSeries}-${keyboardData.kbModel}${keyboardData.kbExtension}-ref${i}-${j}.thumbnail`);
                    thumbBar.appendChild(newImage);

                    // When thumbnail is clicked, present image and set correct credit / comment
                    newImage.onclick = function(e) {
                        // Set main image to given thumbnail
                        fullImage = e.target.src.substr(0, e.target.src.lastIndexOf(".") + 1) + "jpg";
                        imageWrapper.innerHTML = `<img class="displayed-img" src=${fullImage}><div class="comment"></div>`
                        imageWrapperMobile.innerHTML = `<img class="displayed-img-mobile" src=${fullImage}><div class="comment-mobile"></div>`
                        
                        // If src URL contains ref1, image in question is ref1
                        if (document.querySelector('.displayed-img').src.includes("ref1")){
                            // Comment setup
                            if (keyboardData["comment1"] !== ""){
                                document.querySelector('.comment').style.display = "block"
                                document.querySelector('.comment-mobile').style.display = "block"
                                document.querySelector('.comment').innerHTML = keyboardData["comment1"]
                                document.querySelector('.comment-mobile').innerHTML = keyboardData["comment1"]
                            } else {
                                document.querySelector('.comment').style.display = "none"
                                document.querySelector('.comment-mobile').style.display = "none"
                            }
                            // Author setup
                            if (keyboardData["refAuthor1"] !== ""){
                                console.log(document.querySelector('.displayed-img').src)
                                creditName.innerHTML = `Photo by ${keyboardData["refAuthor1"]}`
                                creditNameMobile.innerHTML = `Photo by ${keyboardData["refAuthor1"]}`
                                if (keyboardData["refSite1"] !== ""){
                                    creditLink.setAttribute('href', keyboardData["refSite1"])
                                    creditLinkMobile.setAttribute('href', keyboardData["refSite1"])
                                }
                            } else {
                                creditName.innerHTML = "Is this image yours? Click me!"
                                creditNameMobile.innerHTML = "Is this image yours? Click me!"
                                creditLink.setAttribute('href', "credit.html")
                                creditLinkMobile.setAttribute('href', "credit.html")
                            }

                        // If src URL contains ref2, image in question is ref2
                        } else if (document.querySelector('.displayed-img').src.includes("ref2")){
                            // Comment setup
                            if (keyboardData["comment2"] !== ""){
                                document.querySelector('.comment').innerHTML = keyboardData["comment2"]
                                document.querySelector('.comment-mobile').innerHTML = keyboardData["comment2"]
                                document.querySelector('.comment').style.display = "block"
                                document.querySelector('.comment-mobile').style.display = "block"
                            } else {
                                document.querySelector('.comment').style.display = "none"
                                document.querySelector('.comment-mobile').style.display = "none"
                            }
                            // Author setup
                            if (keyboardData["refAuthor2"] !== ""){
                                creditName.innerHTML = `Photo by ${keyboardData["refAuthor2"]}`
                                creditNameMobile.innerHTML = `Photo by ${keyboardData["refAuthor2"]}`
                                if (keyboardData["refSite2"] !== ""){
                                    creditLink.setAttribute('href', keyboardData["refSite2"])
                                    creditLinkMobile.setAttribute('href', keyboardData["refSite2"])
                                }
                            } else {
                                creditName.innerHTML = "Is this image yours? Click me!"
                                creditNameMobile.innerHTML = "Is this image yours? Click me!"
                                creditLink.setAttribute('href', "credit.html")
                                creditLinkMobile.setAttribute('href', "credit.html")
                        }
                        } 
                    }
                }
            }
        }


        // Set keyboard name
        keyboardName.innerHTML = `Cherry ${keyboardData.kbSeries}-${keyboardData.kbModel}${keyboardData.kbExtension}`

        // Set table info
        var keyboardInfo = document.getElementById("keyboard").querySelector("#keyboardInfo");
        var tableData = ''

        // Detecting fields that are arrays
        // Transforms arrays to strings
        // Example: If 'Interface' is ["DIN5", "PS/2"], the value is printed as "DIN5, PS/2"
        for (const index of Object.keys(filtersMain)) {
            if (Array.isArray(keyboardData[index])) {
                var arrayedData = ''
                keyboardData[index].forEach(item => arrayedData += `${item}, `)
                arrayedData = arrayedData.substr(0, arrayedData.lastIndexOf(","))
                tableData += `<tr>
                                            <th>${filtersMain[index]}</th>
                                            <td>${arrayedData}</td>
                                            </tr>`
            } else {
                tableData += `<tr>
                                            <th>${filtersMain[index]}</th>
                                            <td>${keyboardData[index]}</td>
                                            </tr>`
                }
        }
        tableData += `<tr>
                        <th>Alternate designation</th>
                        <td>-</td>
                        </tr>`
        keyboardInfo.innerHTML = tableData

        }
        })

}



var filtersMain = {
    "kbSeries": "Series",
    "kbModel": "Model",
    "kbExtension": "Extension",
    "kbSwitch": "Switch",
    "kbInterface": "Interface",
    "kbBrand": "Brand",
    "caseStyle": "Case Style",
    "languagePrimary": "Language",
    "languageSecondary": "Secondary Language",
    "layoutSize": "Layout Size",
    "layoutType": "Layout Type",
    "keycapMaterial": "Keycap Material",
    "keycapThickness": "Keycap Thickness",
    "keycapPrimary": "Legend Print",
    "keycapSub": "Sub Legend Print",
    "keycapScheme": "Colour Scheme",
    "kbKRO": "Key Rollover",
    "kbFeature": "Keyboard Feature",
    "switchPlate": "Switchplate",
    "switchSuper": "MX Superblack",
    "switchLock": "MX Lock",
    "caseColour": "Casing Colour",
    "keycapNonstandard": "Non-Standard Keycaps",
    "keycapSide": "Side Legend Print",
    "keycapSecColour": "Secondary Legend Colour",
    "keycapSideColour": "Side Legend Colour",
    "keycapColour": "Coloured Keycaps",
    "keycapWindow": "LED Windows",
    "keycapCaps": "Caps Lock Type",
    "keycapMX": "MX Compatibility",
    "keycapReleg": "Relegendable Keycaps",
    "keycapBottomTop": "Bottom/Top Row Profile",
    "keycapSpace": "Spacebar Size",
    "layoutWin": "Windows Keys"
}