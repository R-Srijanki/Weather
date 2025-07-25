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
const check=document.getElementById("toggle");
const page=document.getElementById("main");
const ball=document.getElementById("ball");
const currhead=document.getElementById("currhead");
const forehead=document.getElementById("forehead");

let lat,lon;
search.addEventListener("click",find);
track.addEventListener("click",getLocation);


check.addEventListener("change",function(){
    if(check.checked){
        page.style.backgroundImage="url('./images/pexels-pixabay-355887.jpg')";
        ball.style.transform="translateX(22px)";
        currhead.style.color="white";
        forehead.style.color="white";
    }
    else{
        page.style.backgroundImage="url('./images/field-with-clouds.jpg')";
        ball.style.transform="translateX(0)";
        currhead.style.color="black";
        forehead.style.color="black";
    }
})



function showError(message) {
    const errorBox = document.getElementById("error-box");
    const errorMsg = document.getElementById("error-msg");

    errorBox.classList.remove("hidden");
    errorMsg.innerText = message;
    
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
    const city=cityname.value.trim();
    if (!city) {
    showError("Please enter a city name");
    return;
    }
    if(city.length<2){
        showError("Please enter valid city name");
    return;
    }
    if(!/^[a-zA-Z\s]+$/.test(city)){
        showError("Please enter letters only");
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


async function success(position){
    lat=position.coords.latitude;
    lon=position.coords.longitude;
    
    const city=await getCityNameFromCoords(lat, lon);
    if (city) {
    history(city);     // Assuming 'history' is your function to store/show city
    currcard();        // Your function to show current weather
    cityname.value = "";
  }
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
  try{
  const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${api}`);
  if (!res.ok) {
      throw new Error("Failed to fetch location");
    }
  const data = await res.json();
  return data.length ? data[0].name : null;  // e.g. "Mumbai" 
  }
  catch(error){
    showError("An error occurred while fetching location name.");
    return null;
  }
   
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
        const store=document.createElement("div");
        store.classList.add("currcard");
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
        
        store.append(date,temp,humidity,wind_speed);
        currhead.classList.remove("hidden");
        pre.append(store,img);
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
            const store=document.createElement("div");
            store.classList.add("forecards");
            
            const readabledate = new Date(element.dt * 1000).toLocaleDateString();

            date.innerText=`Date: ${readabledate}`;
            temp.innerText=`Temperature: ${element.main.temp}°C`;
            humidity.innerText=`Humidity: ${element.main.humidity}%`;
            wind_speed.innerText=`Wind: ${element.wind.speed} m/s`;
            // Icon fix: get from data
            const iconcode= element.weather[0].icon;
            img.src=`https://openweathermap.org/img/wn/${iconcode}@2x.png`;
            img.alt="Weather icon";
            store.append(date,temp,humidity,wind_speed);
            forehead.classList.remove("hidden");
            switch(index){
                case 0:{
                    day1.innerHTML = "";
                    day1.append(store,img); break;}
                case 1:{
                    day2.innerHTML = "";
                    day2.append(store,img); break;}
                case 2:{
                    day3.innerHTML = "";
                    day3.append(store,img); break;}
                case 3:{
                    day4.innerHTML = "";
                    day4.append(store,img); break;}
                case 4:{
                    day5.innerHTML = "";
                    day5.append(store,img); break;}
            }
        });
        

    }
    catch(error){
        showError(error);
    }
}

function history(cityname){
    const citytext=cityname.trim();
    let limit=5;
    if(!citytext) return;
    let cities=JSON.parse(localStorage.getItem("cities"))||[];
    
    cities=cities.filter(function(c){
        return(c.cityname.toLowerCase()!==citytext.toLowerCase());
    });
     const city={
            cityname: citytext,
        };
    cities.unshift(city);
    if(cities.length>limit)
        cities=cities.slice(0,limit);
    localStorage.setItem("cities",JSON.stringify(cities));
    updatedropdown();
}
function updatedropdown(){
     his.innerHTML = '<option value="">Select a previous city</option>'; 
    const cities=JSON.parse(localStorage.getItem("cities")) || [];
    cities.forEach((element)=>{
        const opt=document.createElement("option");
        opt.innerText=element.cityname;
        opt.value=element.cityname;
        his.append(opt);
    });
}
document.addEventListener("DOMContentLoaded", () => {
   updatedropdown();
});

