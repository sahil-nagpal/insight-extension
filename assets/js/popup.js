var params = {
    active: true,
    currentWindow: true
}

let messageElement = document.querySelector(".msg_box")
let loaderElement = document.getElementById("loader")

let errorMessages = {
    "otherPageMsg":"Not an instagram page",
    "notFoundMsg":"No data found for this page"
}

let apiCredintials = {
    "X-RapidAPI-Key":"95a4e3b7b2msh2e293350fea2552p1a9c9bjsn1963a544e339",
    "X-RapidAPI-Host":"instagram-statistics-api.p.rapidapi.com"
}

let apiUrl = "https://instagram-statistics-api.p.rapidapi.com/community"


async function main(){
    let profileElement = document.getElementById("profile-element")
    profileElement.style.display = "none"
    await getUserInformation()
}


async function getUserName(tab) {
    let userName = "notFound"
    try {
        let splittedDomain = tab?.url.split("/")
        userName = splittedDomain[splittedDomain.findIndex(item => item === "www.instagram.com") + 1]
        return userName
    }
    catch (err) {
        console.log("error in getUsername :: ", err.message)
    }
    return userName
}


function formatNumber(num, precision = 2) {
    const map = [
      { suffix: 'T', threshold: 1e12 },
      { suffix: 'B', threshold: 1e9 },
      { suffix: 'M', threshold: 1e6 },
      { suffix: 'K', threshold: 1e3 },
      { suffix: '', threshold: 1 },
    ];
  
    const found = map.find((x) => Math.abs(num) >= x.threshold);
    if (found) {
      const formatted = (num / found.threshold).toFixed(precision) + found.suffix;
      return formatted;
    }
  
    return num;
  }

async function getUserData(url){
    let respValue = {
        "found":false,
        "userData":{}
    }
    try{
        apiUrl = apiUrl + `?url=${url}`
        console.log(apiUrl)
        let response = await fetch(apiUrl,{
            "method":"GET",
            "headers":{...apiCredintials,"Content-Type": "application/json"}
           })
        let result = await response.json()
        if(response.status === 200 && result){
            respValue.found = true
            respValue.userData = result.data
            console.log("userData ::: ",result.data)
        }
        else{
            respValue.found = false
            loaderElement.style.display = "none"
            messageElement.style.display = "block"
            messageElement.innerHTML = errorMessages['notFoundMsg']
        }
    }
    catch(err){
        console.log("error in getUserData :::",err.message)
    }
    return respValue
}

function feedDataInPopup(calculatedData){
    try{
        let analyticalTable = document.getElementById("profile-element")
        analyticalTable.style.display = "block"
        loaderElement.style.display = "none"
        messageElement.style.display = "none"
        let valueIds = Object.keys(calculatedData)
        valueIds.forEach((item)=>{
            try{
                let strokeName =  item != "img" ? "innerHTML" :"src"
                document.getElementById(item)[strokeName] = calculatedData[item]
            }
            catch(err){}
        })
    }
    catch(err){
        console.log("error in feedDataInPopup :: ",err.message)
    }
}


function reformData(userData){
    let calculatedData = {}
    try{
        calculatedData.userName = userData.name
        calculatedData.followers = formatNumber(userData?.usersCount) || 0
        calculatedData.avgLikes = formatNumber(userData.avgLikes) || 0
        calculatedData.img = userData?.image || ""
        calculatedData.engagmentRate = ( (userData?.avgER ? userData?.avgER : 0) * 100).toFixed(2) + "%" || 0
        calculatedData.avgInteractions = formatNumber(userData.avgInteractions) || 0
        calculatedData.avgViews = formatNumber(userData.avgVideoViews) || 0
        calculatedData.avgComments = formatNumber(userData.avgComments) || 0
    }
    catch(err){
        console.log("error in reformData ::: ",err.message)
    }
    return calculatedData
}


function validateUrl(url){
    try{
        let urlArr = url.split("/")
        let checkForInsta = urlArr.find(item => item === "www.instagram.com")
        if(!checkForInsta){
            let waitingLoader = document.getElementById("loader")
            waitingLoader.style.display = "none"
            messageElement.style.display = "block"
            messageElement.innerHTML = errorMessages['otherPageMsg']
        }
        else{
            return true
        }
    }
    catch(err){
        console.log("error in validateUrl ::: ",err.message)
    }
}

async function getUserInformation(){
    try{
        let tab = await chrome.tabs.query(params)
       let profileUrl = tab[0]?.url
       let validUrl = await validateUrl(profileUrl)
       if(validUrl){
        let userResponse = await getUserData(profileUrl)
        if(userResponse.found){
             let calculatedData = reformData(userResponse.userData)
             await feedDataInPopup(calculatedData)
        }
       }
    }
    catch(err){
        console.log("error in getUserInformation ::: ",err.message)
    }
}


main()