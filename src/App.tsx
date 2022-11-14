import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { parseCSVFile } from "./parser";

let rows = [];
let startTime = 0;

function App() {
  const [isLoading, setisLoading] = useState(false);
  const [currentRow, setcurrentRow] = useState([] as (string | number)[]);
  const [rowCount, setrowCount] = useState(0);

  const rowcountInc = () => {
    setrowCount(rowCount + 1);
  };

  useEffect(() => {
    if (isLoading) {
      setrowCount(0);
      startTime = Date.now();
      rows = [];
      return;
    }
    console.log(rows.length / 2, "rows parsed");
    console.log((Date.now() - startTime) / 1000, "seconds taken");
  }, [isLoading]);

  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    window.addEventListener("dragover", preventDefault, false);
    window.addEventListener("drop", preventDefault, false);
    return () => {
      window.removeEventListener("dragover", preventDefault, false);
      window.removeEventListener("drop", preventDefault, false);
    };
  }, []);

  useEffect(rowcountInc, [currentRow]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
      className="App"
    >
      <div
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (!file) return;
          parseCSVFile(file, setisLoading, (row) => {
            setcurrentRow(row);
            rows.push(row);
          });
        }}
        style={{
          width: "20rem",
          height: "10rem",
          border: "2px dashed gray",
          borderRadius: "2rem",
        }}
      />{" "}
      <br />
      <h4>Loading: {isLoading + ""}</h4>
      <h4>
        Current Row: {rowCount}
        <br />
        <br />
        {currentRow.map((el, id) => (
          <span key={id}>
            {el},<br />
          </span>
        ))}
      </h4>
    </div>
  );
}

export default App;
