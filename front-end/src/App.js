import React, { useState } from "react";
import "./App.css";
import TextField from "@material-ui/core/TextField";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import axios from "axios";
import { saveAs } from "file-saver";
import { Button } from "@material-ui/core";

//const ffmpeg = require("fluent-ffmpeg");

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#2196f3"
    }
  }
});

function App() {
  const [data, setdata] = useState("");
  const download = () => {
    //const url = "https://youtu.be/IGQBtbKSVhY";
    const url = data;
    // const audioOutput = path.resolve(__dirname, "sound.mp4");
    // const mainOutput = path.resolve(__dirname, "output.mp4");
    console.log("downloading audio track");

    // axios
    //   .post("/create-pdf")
    //   .then(() => axios.get("fetch-pdf", { responseType: "blob" }))
    //   .then(res => {
    //     const pdfBlob = new Blob([res.data], { type: "application/pdf" });

    //     saveAs(pdfBlob, "newPdf.mp3");
    //   });
    // axios
    //   .get(url)
    //   .then(res => {
    axios
      .get(`/download`, {
        params: {
          videoId: url
        },
        method: "GET",
        responseType: "blob"
      })
      .then(stream => {
        console.log(stream);
        axios
          .get("/info", {
            params: {
              videoId: url
            },
            method: "GET"
          })
          .then(response => {
            console.log(response.data);

            const file = new Blob([stream.data], { type: "audio/mpeg" });
            //Build a URL from the file
            const fileURL = URL.createObjectURL(file);
            saveAs(file, response.data);
          });
      })
      .catch(err => {
        console.log("ERROR", err);
      });
    //})
    // .catch(err => {
    //   console.log("ERROR", err);
    // });
  };
  return (
    <div className="main">
      <MuiThemeProvider theme={theme}>
        <TextField
          onChange={e => {
            setdata(e.target.value);
          }}
          fullWidth
          id="standard-name"
          label="Name"
          margin="normal"
          style={{ margin: 30 }}
        />
      </MuiThemeProvider>
      <Button variant="contained" color="primary" onClick={download}>
        Download
      </Button>
    </div>
  );
}

export default App;
