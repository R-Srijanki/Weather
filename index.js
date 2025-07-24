const cityname=document.getElementById("city");
const track=document.getElementById("locationbtn");
const search=document.getElementById("searchbtn");
const his=document.getElementById("searched");
const pre=document.getElementById("current");
const day1=document.getElementById("day1");
const day2=document.getElementById("day2");
const day3=document.getElementById("day3");
const day4=document.getElementById("day4");
const day5=document.getElementById("day5");
const api="e7a563e8d10e65b9e7de4f87d478bb54"; 
const errormsg=document.getElementById("error-msg");


let lat,lon;
search.addEventListener("click",find);
function showError(message) {
    const errorBox = document.getElementById("error-box");
    const errorMsg = document.getElementById("error-msg");

    errorMsg.innerText = message;
    errorBox.classList.remove("hidden");
}

function hideErrorBox() {
   const errorBox = document.getElementById("error-box");
   const errorMsg=document.getElementById("error-msg");
if (errorBox) {
    errorBox.classList.add("hidden");if (errorMsg) errorMsg.innerText = "";
}
} 
async function find(){
    hideErrorBox();
    if (!cityname.value.trim()) {
    showError("Please enter a city name");
    return;
    }
    try{
        const loc= await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${(cityname.value).trim()}&limit=1&appid=${api}`);
        const locdata=await loc.json();
        if(locdata.length==0){
            showError("Location Not Found");
            return;
        }
        lat=locdata[0].lat;
        lon=locdata[0].lon;
        
        history(cityname.value);
        currcard();
        cityname.value="";
    }
    catch(error){
        console.error(error);
        showError("An error occurred while fetching location");
    }
}
track.addEventListener("click",getLocation);

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
    his.value="";
});

function getLocation(){
    hideErrorBox();
    if(navigator.geolocation)
        navigator.geolocation.getCurrentPosition(success,error);
    else
        showError("Geolocation is not supported by this browser.");
}
function success(position){
    lat=position.coords.latitude;
    lon=position.coords.longitude;
    
    history(getCityNameFromCoords(lat, lon));
    currcard();
    cityname.value="";
}
function error(error){
    switch(error.code){
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

async function getCityNameFromCoords(lat, lon) {
  const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${api}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.length ? data[0].name : null;   // e.g. "Mumbai"
}

async function currcard(){
    try{
        const currweather=await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api}&units=metric`);
        if (!currweather.ok) {
            throw new Error(`HTTP error! Status: ${currweather.status} - ${currweather.statusText}`);
        }
        const currweatherdata=await currweather.json();

        const date=document.createElement("time");
        const temp=document.createElement("span");
        const humidity=document.createElement("span");
        const wind_speed=document.createElement("span");
        const img=document.createElement("img");
        // first converts to milliseconds and then Human-readable date
        const readabledate = new Date(currweatherdata.dt * 1000).toLocaleDateString();

        date.innerText=`Date: ${readabledate}`;
        temp.innerText=`Temperature: ${currweatherdata.main.temp}°C`;
        humidity.innerText=`Humidity: ${currweatherdata.main.humidity}%`;
        wind_speed.innerText=`Wind: ${currweatherdata.wind.speed} m/s`;
        // Icon fix: get from data
        const iconcode= currweatherdata.weather[0].icon;
        img.src=`https://openweathermap.org/img/wn/${iconcode}@2x.png`;
        img.alt="Weather icon";
       //clear previous content
        pre.innerHTML = "";
        //Append to container
        pre.append(date,temp,humidity,wind_speed,img);
        cards();
    }
    catch(error){
        showError(error);
    }
}

async function cards(){
    try{
        const weather=await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api}&units=metric`);
         if (!weather.ok) {
            throw new Error(`HTTP error! Status: ${weather.status} - ${weather.statusText}`);
        }
        const weatherdata=await weather.json();

        const weatherdata1 = weatherdata.list.filter(item=>item.dt_txt.includes("12:00:00"));

        weatherdata1.forEach((element,index) => {
            const date=document.createElement("time");
            const temp=document.createElement("span");
            const humidity=document.createElement("span");
            const wind_speed=document.createElement("span");
            const img=document.createElement("img");

            const readabledate = new Date(element.dt * 1000).toLocaleDateString();

            date.innerText=`Date: ${readabledate}`;
            temp.innerText=`Temperature: ${element.main.temp}°C`;
            humidity.innerText=`Humidity: ${element.main.humidity}%`;
            wind_speed.innerText=`Wind: ${element.wind.speed} m/s`;
            // Icon fix: get from data
            const iconcode= element.weather[0].icon;
            img.src=`https://openweathermap.org/img/wn/${iconcode}@2x.png`;
            img.alt="Weather icon";

            switch(index){
                case 0:{
                    day1.innerHTML = "";
                    day1.append(date,temp,humidity,wind_speed,img); break;}
                case 1:{
                    day2.innerHTML = "";
                    day2.append(date,temp,humidity,wind_speed,img); break;}
                case 2:{
                    day3.innerHTML = "";
                    day3.append(date,temp,humidity,wind_speed,img); break;}
                case 3:{
                    day4.innerHTML = "";
                    day4.append(date,temp,humidity,wind_speed,img); break;}
                case 4:{
                    day5.innerHTML = "";
                    day5.append(date,temp,humidity,wind_speed,img); break;}
            }
        });


    }
    catch(error){
        showError(error);
    }
}

function history(cityname){
    const citytext=cityname.trim();
    if(!citytext) return;
    let cities=JSON.parse(localStorage.getItem("cities"))||[];
    
    const exist=cities.some(function(c){
        return(c.cityname.toLowerCase()===citytext.toLowerCase());
    });
    if(!exist){
        const city={
            cityname: citytext,
        };
        cities.push(city);
        localStorage.setItem("cities",JSON.stringify(cities));
        const opt=document.createElement("option");
        opt.innerText=citytext;
        opt.value=citytext;
        his.append(opt);
    }

}

document.addEventListener("DOMContentLoaded", () => {
    const cities=JSON.parse(localStorage.getItem("cities")) || [];
    cities.forEach((element)=>{
        const opt=document.createElement("option");
        opt.innerText=element.cityname;
        opt.value=element.cityname;
        his.append(opt);
    });
});

