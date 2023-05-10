import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Welcome from './Welcome';
import Login from './Login';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route path="/welcome">
          <Welcome />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;

