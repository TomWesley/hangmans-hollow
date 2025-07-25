import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import HomePage from './HomePage';
import HangmansHollowGame from './HangmansHollowGame';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          {/* Main arcade homepage */}
          <Route exact path="/" component={HomePage} />
          
          {/* Hangman's Hollow game */}
          <Route path="/HangmansHollow" component={HangmansHollowGame} />
          
          {/* The Void game - redirect to the void subdirectory */}
          <Route path="/void">
            <Redirect to="/void/" />
          </Route>
          
          {/* Catch all other routes and redirect to homepage */}
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;