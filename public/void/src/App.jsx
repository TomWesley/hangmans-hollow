import TitlePage from './components/TitlePage';
import RulesOfEngagement from './components/RulesOfEngagement';
import BoardDesigns from './components/BoardDesigns';
import BoardGrid from './components/BoardGrid';

import './styles/global.css';

function App() {
  return (
    <div className="App">
      <TitlePage />
      <RulesOfEngagement />
      <BoardDesigns />
      <BoardGrid />
    </div>
  );
}

export default App;