import { useState } from "react";
import "./App.css";

function App() {
    const [_count, setCount] = useState(0);

    return (
        <h1 className=" font-bold underline text-center text-orange-700 text-4xl">
            Hello world!
        </h1>
    );
}

export default App;
