import logo from './logo.svg';
import './App.css';
import ThreeTabs from "./ThreeTabs"
import { store } from './store';
import { Provider } from 'react-redux';


function App() {
  return (
    <Provider store={store}>
      <div className="App"  >
        <ThreeTabs />
        <footer style={{ position: "fixed", left: "40%", bottom: "10px" }}> © By Jaynee Rawal and Prashanth Vaidya </footer>
      </div>
    </Provider>
  );
}

export default App;
