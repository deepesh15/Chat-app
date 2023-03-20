import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
	// <React.StrictMode> // disabling strict mode,because it renders twice
	<App />,
	// </React.StrictMode>,
);
