import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import OpacityIcon from "@mui/icons-material/Opacity";
import AirIcon from "@mui/icons-material/Air";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
// Cloud + Moon image (save this image to your project or use online link)
import moonCloud from "./assets/half-moonbg.png"; // replace with your actual image path
import sun from "./assets/sunbg.png"; // replace with your actual image path
const API_KEY = "2147c82d41308b359c0c923d2324d13c"; // Replace with your OpenWeatherMap API key

const App = () => {
  const [searchInput, setSearchInput] = useState("Toronto");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [temperature, setTemperature] = useState(null);
  const [feelsLike, setFeelsLike] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [wind, setWind] = useState(null);
  const [condition, setCondition] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [isDayTime, setIsDayTime] = useState(true);
  const [icon, setIcon] = useState("");
  // const [weatherData, setDateTime] = useState(null);
  const [forecastData, setForecastData] = useState([]);

  const fetchWeatherData = async (cityName) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
  
      const current = data.list[0];
      const lat = data.city.coord.lat;
      const lon = data.city.coord.lon;
  
      // Get local time directly
      const tzRes = await fetch(`https://api.bigdatacloud.net/data/timezone-by-location?latitude=${lat}&longitude=${lon}&key=bdc_048c4c4e9cd041fc81df5cefccaac161`);
      const tzData = await tzRes.json();
  
      const localTimeString = tzData.localTime;
      const localTime = new Date(localTimeString);
  
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
  
      const formattedTime = localTime.toLocaleString("en-US", options).replace(" at ", " | ");
      const hour = localTime.getHours();
      setIsDayTime(hour >= 6 && hour < 18);
  
      setCity(data.city.name);
      setCountry(data.city.country);
      setTemperature(Math.round(current.main.temp));
      setFeelsLike(Math.round(current.main.feels_like));
      setHumidity(current.main.humidity);
      setWind(current.wind.speed);
      setCondition(current.weather[0].description);
      setDateTime(formattedTime);
      setIcon(`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`);
  
      // 5-day Forecast (every 8th entry)
      const filtered = data.list.filter((_, idx) => idx % 8 === 0);
  
      const formatted = filtered.map((item) => {
        const utcDate = new Date(item.dt * 1000);
        const dayName = utcDate.toLocaleDateString("en-US", {
          weekday: "long",
          timeZone: tzData.timezone || "UTC",
        });
  
        return {
          day: dayName,
          temp: `${Math.round(item.main.temp_max)}° - ${Math.round(item.main.temp_min)}°`,
          condition: item.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
        };
      });
  
      setForecastData(formatted);
  
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };
  
  useEffect(() => {
    fetchWeatherData(searchInput); // Load default city on mount
  }, []);

  const handleSearch = () => {
    fetchWeatherData(searchInput);
  };

  return (
    <Box
      sx={{
        background: isDayTime
      ? "linear-gradient(to bottom, #87cefa, #b0e0e6)" // light blue gradient
      : "linear-gradient(to bottom, #0b1b3f, #0b2b3f)", // night mode
        minHeight: "100vh",
        color: "#fff",
        p: 4,
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Search Bar */}
      <Box sx={{ maxWidth: 400, mb: 4, ml:"auto" }}>
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Search city..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          InputProps={{
            sx: { backgroundColor: isDayTime? "#87cefa":"#172a46", color: "#fff", borderRadius: 2 },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch}>
                  <SearchIcon sx={{ color: "#fff" }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <br></br>

      {/* Main Weather Section */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h2" fontWeight={600}>
          {city} ({country})
        </Typography>
        <br></br>
        <Typography variant="h5" gutterBottom>
          {dateTime}
        </Typography>

        <Grid container spacing={45} alignItems="center" sx={{ mt: 2 }}>
          <Grid item>
            <Stack spacing={1}>
              <Typography variant="h2" sx={{ fontWeight: 300 }}>
                {temperature}°C
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                {condition}
              </Typography>
            </Stack>
          </Grid>

          <Grid item>
            <Box
              component="img"
              src={isDayTime?sun:moonCloud}
              alt={isDayTime?"sun":"moon with cloud"}
              sx={{ width: 120, height: 120 }}
            />
          </Grid>

          <Grid item>
            <Stack spacing={1}>
              <Typography variant="h5">
                <DeviceThermostatIcon sx={{ color: "orange", mr: 1 }} />
                Feels like: {feelsLike}°C
              </Typography>
              <Typography variant="h5">
                <OpacityIcon sx={{ color: "#00bcd4", mr: 1 }} />
                Humidity: {humidity}%
              </Typography>
              <Typography variant="h5">
                <AirIcon sx={{ color: isDayTime?"#fff":"#ccc", mr: 1 }} />
                Wind: {wind} km/h
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Box>
      <br></br>

      {/* Forecast Cards */}
      <Grid container spacing={3} justifyContent="center">
        {forecastData.map((day, idx) => (
          <Grid item key={idx}>
            <Card
              sx={{
                backgroundColor: isDayTime?"#FAF9F6":"#cfd8dc", // same color, 80% opacity
                color: isDayTime?"#90caf9":"#0b1b3f",
                borderRadius: 3,
                width: 160,
                minHeight: 180,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
              }}
            >
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontSize: "1.2rem", fontWeight: 600 }}>
                  {day.day}
                </Typography>
                <img src={day.icon} alt="forecast icon" width={40} />
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {day.temp}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "1.0rem", mt: 0.5 }}>
                  {day.condition}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default App;
