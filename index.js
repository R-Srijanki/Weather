//declare variable names for all elements in html
const cityname = document.getElementById("city");
const track = document.getElementById("locationbtn");
const search = document.getElementById("searchbtn");
const his = document.getElementById("searched");
const pre = document.getElementById("current");
const day1 = document.getElementById("day1");
const day2 = document.getElementById("day2");
const day3 = document.getElementById("day3");
const day4 = document.getElementById("day4");
const day5 = document.getElementById("day5");
const api = "e7a563e8d10e65b9e7de4f87d478bb54";
const errormsg = document.getElementById("error-msg");
const check = document.getElementById("toggle");
const page = document.getElementById("main");
const ball = document.getElementById("ball");
const currhead = document.getElementById("currhead");
const forehead = document.getElementById("forehead");
const weathercard = document.querySelectorAll(".weathercard");
const formid = document.getElementById("formid");
const h1tag = document.querySelector(".h1tag");
const formlabel = document.querySelectorAll(".labels");
//map for all weathers using icons
const iconMap = {
  "clear sky": "fas fa-sun",
  "few clouds": "fas fa-cloud-sun",
  "scattered clouds": "fas fa-cloud",
  "broken clouds": "fas fa-cloud",
  "overcast clouds": "fas fa-cloud",
  "shower rain": "fas fa-cloud-showers-heavy",
  "light rain": "fas fa-cloud-rain",
  "moderate rain": "fas fa-cloud-rain",
  "heavy intensity rain": "fas fa-cloud-showers-heavy",
  "thunderstorm": "fas fa-bolt",
  "snow": "fas fa-snowflake",
  "light snow": "fas fa-snowflake",
  "mist": "fas fa-smog",
  "haze": "fas fa-smog",
  "fog": "fas fa-smog",
  "smoke": "fas fa-smog",
  "drizzle": "fas fa-cloud-rain",
  "light intensity drizzle": "fas fa-cloud-rain",
  "heavy intensity drizzle": "fas fa-cloud-showers-heavy",
  "rain": "fas fa-cloud-rain",
  "thunderstorm with rain": "fas fa-bolt",
  "thunderstorm with light rain": "fas fa-bolt",
  "thunderstorm with heavy rain": "fas fa-bolt",
  "freezing rain": "fas fa-snowflake",
  "sleet": "fas fa-cloud-meatball", // closest match
  "tornado": "fas fa-wind",
  "sand": "fas fa-smog",
  "dust": "fas fa-smog",
  "squalls": "fas fa-wind",
  "ash": "fas fa-smog"
};

let lat, lon;//latitude and longitude variable declare
//on using enter key on keyboard it will go into find function
cityname.addEventListener("keydown", function (event) {
    if (event.key == "Enter") { event.preventDefault(); find(); }
});
//on clicking on search button it will go into find function
search.addEventListener("click", find);
//this will help us get current location's coordinates
track.addEventListener("click", getLocation);

//This changes styles of elements in dark and light mode 
check.addEventListener("change", function () {
    if (!check.checked) {
        page.style.backgroundImage = "url('./images/pexels-pixabay-355887.jpg')";
        ball.style.transform = "translateX(22px)";
        currhead.style.color = "white";
        forehead.style.color = "white";
        h1tag.style.color = "white";
        weathercard.forEach(card => {
            card.style.background = "#229799";
            card.style.color = "white";
        });
        formid.style.background = "#229799";
        formlabel.forEach(element => element.style.color = "white");
    }
    else {
        page.style.backgroundImage = "url('./images/field-with-clouds.jpg')";
        ball.style.transform = "translateX(0)";
        currhead.style.color = "black";
        forehead.style.color = "black";
        h1tag.style.color = "black";
        weathercard.forEach(card => {
            card.style.background = "rgb(253 230 138)"; // Equivalent to bg-amber-200
            card.style.color = "black";
        });
        formid.style.background = "rgb(253 230 138)";
        formlabel.forEach(element => element.style.color = "black");
    }
})


//this function is used to display error message on screen to users
function showError(message) {
    const errorBox = document.getElementById("error-box");
    const errorMsg = document.getElementById("error-msg");

    errorBox.classList.remove("hidden");
    errorMsg.innerText = message;

}
// hides the error msg box
function hideErrorBox() {
    const errorBox = document.getElementById("error-box");
    const errorMsg = document.getElementById("error-msg");
    if (errorBox) {
        errorBox.classList.add("hidden"); if (errorMsg) errorMsg.innerText = "";
    }
}
// After clicking on search button
async function find() {
    hideErrorBox();
    const city = cityname.value.trim();
    if (!city) { //if no city entered it will display msg on screen
        showError("Please enter a city name");
        return;
    }
    if (city.length < 2) {
        showError("Please enter valid city name");
        return;
    }
    //valid city name 
    if (!/^[a-zA-Z\s]+$/.test(city)) {
        showError("Please enter letters only");
        return;
    }// try and catch on lat and long values using cityname given through api call
    try {
        const loc = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${(cityname.value).trim()}&limit=1&appid=${api}`);
        const locdata = await loc.json();
        if (locdata.length == 0) {
            showError("Location Not Found");
            return;
        }
        lat = locdata[0].lat;
        lon = locdata[0].lon;

        history(cityname.value);  //adds searched data into dropdown

        currcard(); //creates current weather card
        cityname.value = "";
    }
    catch (error) {
        console.error(error);
        showError("An error occurred while fetching location");
    }
}

//this will execute when we select from dropdown of previous searched cities 
his.addEventListener("change", async function () {
    hideErrorBox();
    const selectedCity = his.value;
    if (!selectedCity) return;

    try {
        const loc = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${selectedCity}&limit=1&appid=${api}`);
        const locdata = await loc.json();
        if (locdata.length === 0) {
            showError("Location Not Found");
            return;
        }

        lat = locdata[0].lat;
        lon = locdata[0].lon;
        currcard();
    } catch (error) {
        showError("An error occurred while fetching location.");
    }
    his.value = "";
});

// this is used to get current location 
function getLocation() {
    hideErrorBox();
    if (navigator.geolocation)
        navigator.geolocation.getCurrentPosition(success, error);
    else
        showError("Geolocation is not supported by this browser.");
}

// if success then with lat and lon values we will display cards of weather data
async function success(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;

    const city = await getCityNameFromCoords(lat, lon);
    if (city) {
        history(city);     // Assuming 'history' is your function to store/show city
        currcard();        // Your function to show current weather
        cityname.value = "";
    }
}

//if we error occurs while fetching location data values this function will display error message on screen
function error(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            showError("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            showError("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            showError("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            showError("An unknown error occurred.");
            break;
    }
}
//using lat and lon we will get cityname so we can store location searched into dropdown
async function getCityNameFromCoords(lat, lon) {
    try {
        const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${api}`);
        if (!res.ok) {
            throw new Error("Failed to fetch location");
        }
        const data = await res.json();
        return data.length ? data[0].name : null;  // e.g. "Mumbai" 
    }
    catch (error) {
        showError("An error occurred while fetching location name.");
        return null;
    }

}
//this will create current weathercard using api call for it.
async function currcard() {
    try {
        const currweather = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api}&units=metric`);
        if (!currweather.ok) {
            throw new Error(`HTTP error! Status: ${currweather.status} - ${currweather.statusText}`);
        }
        const currweatherdata = await currweather.json();
        //create new elements to add data from api call to it and display on screen
        const date = document.createElement("time");
        const temp = document.createElement("span");
        const humidity = document.createElement("span");
        const wind_speed = document.createElement("span");
        
        const store = document.createElement("div");
        store.classList.add("flex", "flex-col", "gap-5"); //add tailwindCss directly on div
        // first converts to milliseconds and then Human-readable date 
        const readabledate = new Date(currweatherdata.dt * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

        date.innerText = `${readabledate}`;//like monday july 30
        temp.innerText = `Temperature: ${currweatherdata.main.temp}°C`;
        humidity.innerText = `Humidity: ${currweatherdata.main.humidity}%`;
        wind_speed.innerText = `Wind: ${currweatherdata.wind.speed} m/s`;
        // Icon fix: get from data
        const iconcode = currweatherdata.weather[0].icon;
        const descri= currweatherdata.weather[0].description.toLowerCase();
        const iconClass=iconMap[descri] || "fas fa-question";
        const icon = document.createElement("i");
        icon.className = `${iconClass} text-3xl mb-1 md:text-4xl`;
        const type=document.createElement("div");
        const des=document.createElement("p");
        type.className=`self-center flex flex-col items-center`;
        
        des.innerText=`${descri}`;
        des.className = "text-sm capitalize text-black text-center";
        type.append(icon,des);
        //clear previous content
        pre.innerHTML = "";
        //Append to container

        store.append(date, temp, humidity, wind_speed);
        currhead.classList.remove("hidden");
        currhead.innerText=`${currweatherdata.name}'s Current Weather`;
        pre.append(store, type);//append store div and icon img into pre div container
        pre.style.padding = "20px 20px"; //add padding for card 

        cards(); //for forecast weather 
    }
    catch (error) {
        showError(error);
    }
}
//this give us data for next 5 days through api call
async function cards() {
    try {
        const weather = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api}&units=metric`);
        if (!weather.ok) {
            throw new Error(`HTTP error! Status: ${weather.status} - ${weather.statusText}`);
        }
        const weatherdata = await weather.json();

        const weatherdata1 = weatherdata.list.filter(item => item.dt_txt.includes("12:00:00"));
        //create new elements to add data into it if successful in fetching data from call
        weatherdata1.forEach((element, index) => {
            const date = document.createElement("time");
            const temp = document.createElement("span");
            const humidity = document.createElement("span");
            const wind_speed = document.createElement("span");
            
            const store = document.createElement("div");
            store.classList.add("flex", "flex-col", "gap-5");//add tailwindCss directly on div

            const readabledate = new Date(element.dt * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

            date.innerText = `${readabledate}`;
            temp.innerText = `Temperature: ${element.main.temp}°C`;
            humidity.innerText = `Humidity: ${element.main.humidity}%`;
            wind_speed.innerText = `Wind: ${element.wind.speed} m/s`;
            // Icon fix: get from data
            const descri=element.weather[0].description.toLowerCase();
            const iconClass=iconMap[descri] || "fas fa-question";
            const icon=document.createElement("i");
            icon.className=`${iconClass} md:text-4xl self-center mb-1 text-3xl`;
            const type=document.createElement("div");
            const des=document.createElement("p");
            des.innerText=`${descri}`;
            des.className="text-sm capitalize text-black text-center";
            type.append(icon,des);
            type.className=`self-center flex flex-col items-center`;
            store.append(date, temp, humidity, wind_speed);
            forehead.classList.remove("hidden");
            //using switch add info for that card specified

            switch (index) {
                case 0: {
                    day1.innerHTML = "";
                    day1.append(store, type); day1.style.padding = "12px 20px"; break;
                }
                case 1: {
                    day2.innerHTML = "";
                    day2.append(store, type); day2.style.padding = "12px 20px"; break;
                }
                case 2: {
                    day3.innerHTML = "";
                    day3.append(store, type); day3.style.padding = "12px 20px"; break;
                }
                case 3: {
                    day4.innerHTML = "";
                    day4.append(store, type); day4.style.padding = "12px 20px"; break;
                }
                case 4: {
                    day5.innerHTML = "";
                    day5.append(store, type); day5.style.padding = "12px 20px"; break;
                }
            }
        });


    }
    catch (error) {
        showError(error);
    }
}
//this is used to filter searched data for dropdown
function history(cityname) {
    const citytext = cityname.trim();
    let limit = 5;//set limit 5 so it won't look crowded
    if (!citytext) return;
    let cities = JSON.parse(localStorage.getItem("cities")) || [];

    cities = cities.filter(function (c) {
        return (c.cityname.toLowerCase() !== citytext.toLowerCase());
    });//filter so we can recent search at start if exist already
    const city = {
        cityname: citytext,
    };
    cities.unshift(city);
    if (cities.length > limit)
        cities = cities.slice(0, limit);
    localStorage.setItem("cities", JSON.stringify(cities));
    updatedropdown();
}
// to add searched cities into dropdown
function updatedropdown() {
    his.innerHTML = '<option value="">Select a previous city</option>';
    const cities = JSON.parse(localStorage.getItem("cities")) || [];
    cities.forEach((element) => {
        const opt = document.createElement("option");
        opt.innerText = element.cityname;
        opt.value = element.cityname;
        his.append(opt);
    });
}
//data still in dropdown even after page loaded
document.addEventListener("DOMContentLoaded", () => {
    updatedropdown();
});

