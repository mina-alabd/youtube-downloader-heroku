import React, { useState } from "react";
import "./App.css";
import TextField from "@material-ui/core/TextField";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import axios from "axios";
import { saveAs } from "file-saver";
import { Button } from "@material-ui/core";
//import { ScaleLoader } from "react-spinners";
import CircularProgress from "@material-ui/core/CircularProgress";

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
  const [disablebtn, setdisablebtn] = useState(false);
  const [songtitle, setsongtitle] = useState("downloading ");
  const [err, seterr] = useState(false);
  const [progress, setprogress] = useState(0);
  const [errmsg, seterrmsg] = useState("");
  const [totalsize, settotalsize] = useState(0);
  let title = "download";

  const download = () => {
    //const url = "https://youtu.be/IGQBtbKSVhY";
    const url = data;
    // const audioOutput = path.resolve(__dirname, "sound.mp4");
    // const mainOutput = path.resolve(__dirname, "output.mp4");
    //console.log("downloading audio track");
    if (data === "") {
      seterrmsg("field empty");
      seterr(true);
      setdisablebtn(false);
      return;
    }
    axios
      .get("/info", {
        params: {
          videoId: url
        }
      })
      .then(info => {
        //console.log(info);
        setsongtitle("downloading " + info.data.title);
        title = info.data.title;
        const formats = info.data.formats;
        formats.map(i => {
          if (
            i.container === "m4a" &&
            !i.encoding
            //&& i.quality == "highestaudio"
          ) {
            //console.log(i);
            //totalsize = parseFloat(i.clen) / 1024 / 1024;
            settotalsize((parseFloat(i.clen) / 1024 / 1024).toFixed(3));
            return i.clen;
          } else {
            return null;
          }
        });

        axios
          .get(`/download`, {
            onDownloadProgress: progressEvent => {
              //console.log(progressEvent);

              setprogress(parseFloat(progressEvent.loaded) / 1024 / 1024);
            },
            params: {
              videoId: url
            },
            method: "GET",
            responseType: "blob"
          })
          .then(stream => {
            //console.log(stream);
            const file = new Blob([stream.data], { type: "audio/mpeg" });
            //Build a URL from the file

            saveAs(file, title);
            setdisablebtn(false);
          })
          .catch(error => {
            //console.log(error.response.data.message);

            setdisablebtn(false);
            seterr(true);
            seterrmsg(error.response.data.message);
            return;
          });
      })
      .catch(error => {
        //console.log(error.response.data.message);

        setdisablebtn(false);
        seterr(true);
        seterrmsg(error.response.data.message);
        return;
      });

    //})
    // .catch(err => {
    //   console.log("ERROR", err);
    // });
  };
  return (
    <div className="main">
      {/* <ScaleLoader loading={disablebtn} color={"#3f51b5"}></ScaleLoader> */}

      <MuiThemeProvider theme={theme}>
        <TextField
          autoFocus={true}
          autoComplete="off"
          disabled={disablebtn}
          onChange={e => {
            setdata(e.target.value);
          }}
          error={err}
          fullWidth
          id="standard-name"
          label="Enter Youtube Video URL"
          margin="normal"
          style={{ margin: 30 }}
          helperText={errmsg}
          onKeyPress={e => {
            if (e.key === "Enter") {
              seterr(false);
              setdisablebtn(true);
              download();
            }
          }}
        />
      </MuiThemeProvider>

      {disablebtn ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 15,
            color: "white"
          }}
        >
          <p>
            {songtitle +
              ` ( ${progress.toFixed(3)} MB of ${totalsize} MB Done)`}
          </p>
          <CircularProgress
            variant="static"
            value={parseInt((progress / totalsize) * 100)}
          />
        </div>
      ) : (
        <span></span>
      )}

      <Button
        variant="contained"
        color="primary"
        disabled={disablebtn}
        onClick={e => {
          seterr(false);
          setdisablebtn(true);
          download();
        }}
      >
        Download
      </Button>
    </div>
  );
}

export default App;
// axios
//   .get("/info", {
//     params: {
//       videoId: url
//     },
//     method: "GET"
//   })
//   .then(response => {
//     console.log(response.data);

//     const file = new Blob([stream.data], { type: "audio/mpeg" });
//     //Build a URL from the file

//     saveAs(file, response.data);
//     setdisablebtn(false);
//   });
