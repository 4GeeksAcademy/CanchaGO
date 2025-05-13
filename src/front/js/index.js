//import react into the bundle
import React from "react";
import ReactDOM from "react-dom/client";
// index.js o App.jsx
import "leaflet/dist/leaflet.css";

//include your index.scss file into the bundle

//import your own components
import App from "./App.jsx";

const container = document.getElementById("app");

const root = ReactDOM.createRoot(container);

root.render(<App />);
