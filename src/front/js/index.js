//import react into the bundle
import React from "react";
import ReactDOM from "react-dom/client";

//include your index.scss file into the bundle


//import your own components
import App from "./App.jsx";

const container = document.getElementById('app');

const root = ReactDOM.createRoot(container);

root.render(<App />);

