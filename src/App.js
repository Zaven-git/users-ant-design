import './App.scss'
import ErrorBoundary from './components/ErrorBoundary';
import {UserTable} from './components/UserTable';

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <UserTable/>
      </ErrorBoundary>
    </div>
  );
}

export default App;
