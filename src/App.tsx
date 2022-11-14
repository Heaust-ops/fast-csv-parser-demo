import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { parseCSVFile } from "./parser";
import { Button } from "@mui/material";

let rows = [];
let startTime = 0;

const isNumeric = (str: string | number) => {
  if (typeof str != "string") return false;
  return !isNaN(str as unknown as number) && !isNaN(parseFloat(str));
};

function App() {
  const [isLoading, setisLoading] = useState(false);
  const [currentRow, setcurrentRow] = useState([] as (string | number)[]);
  const [rowCount, setrowCount] = useState(0);
  const [isAccel, setisAccel] = useState(true);

  const rowcountInc = () => {
    setrowCount(rowCount + 1);
  };

  useEffect(() => {
    if (isLoading) {
      setrowCount(0);
      startTime = Date.now();
      // rows = [];
      return;
    }
    setTimeout(() => setrowCount(rows.length), 200);
    console.log(rows.length, "rows parsed");
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

  const normalCSVParse = (file: File) => {
    setisLoading(true);
    const reader = new FileReader();

    /** Delegate task to worker after the file is read */
    reader.onload = function (event) {
      const content = event?.target?.result as string;
      if (!content) {
        setisLoading(false);
        return;
      }
      console.time("normal");
      const data = content.split("\n").map((el) => el.split(","));
      setrowCount(data.length);
      setcurrentRow(data[data.length - 10]);
      console.timeEnd("normal");
    };

    /** read the file */
    reader.readAsText(file);
  };

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
      <Button
        onClick={() => {
          setrowCount(0);
          setcurrentRow([]);
          setisAccel(!isAccel);
        }}
        style={{ outline: "none" }}
      >
        Use {isAccel ? "Normal" : "Accelerated"}
      </Button>
      <br />
      <div
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (!file) return;
          if (isAccel)
            parseCSVFile(file, setisLoading, (row) => {
              setcurrentRow(row);
              rows.push(row);
            });
          else normalCSVParse(file);
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
