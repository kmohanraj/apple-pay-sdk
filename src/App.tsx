import "./App.css";
import { useApplePay } from "./useApplePay";

function App() {
  const [handleOnApplePay, appleResponse] = useApplePay("60");
  return (
    <div className="App">
      <h1>Apple Pay </h1>
      <button onClick={() => handleOnApplePay()}>Pay $60</button>
    </div>
  );
}

export default App;
