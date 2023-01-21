import React, { useState } from "react";
import UsernameInput from "./UsernameInput";
import PasswordInput from "./PasswordInput";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Scrollbars } from "rc-scrollbars";
import forge from "node-forge";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WebAssetIcon from "@mui/icons-material/WebAsset";

import "./App.css";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material/";

function App() {
  const [data, setData] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loadingTable, setLoadingTable] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [LoadingButtonColor, setLoadingButtonColor] = useState({
    backgroundColor: "#512682",
    color: "white",
  });
  const [DownloadButtonColor, setDownloadButtonColor] = useState({
    backgroundColor: "#512682",
    color: "white",
  });

  const [previewText, setPreviewText] = useState("Preview Schedule");
  const [downloadText, setDownloadText] = useState("Download");

  const [displayTitle, setDisplayTitle] = useState({
    display: "flex",
  });

  let status;

  async function handleSubmit(event) {
    event.preventDefault();
    setPreviewText("Preview Schedule");
    setLoadingButtonColor({
      backgroundColor: "#512682",
      color: "white",
    });
    setLoadingTable(true);
    const url = new URL("https://flask-production-9caa.up.railway.app/csv");

    const publicKeyResponse = await fetch(
      "https://flask-production-9caa.up.railway.app/public_key"
    );
    const public_pem = await publicKeyResponse.text();
    const publicKey = forge.pki.publicKeyFromPem(public_pem);
    const encryptedUsername = publicKey.encrypt(username, "RSA-OAEP", {
      md: forge.md.sha256.create(),
    });
    const encryptedPassword = publicKey.encrypt(password, "RSA-OAEP", {
      md: forge.md.sha256.create(),
    });

    const encodedUsername = forge.util.encode64(encryptedUsername);
    const encodedPassword = forge.util.encode64(encryptedPassword);
    url.searchParams.append("username", encodedUsername);
    url.searchParams.append("password", encodedPassword);

    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=data.csv",
      },
    })
      .then((response) => response.text())
      .then((text) => {
        const arrayOfData = [];
        const lines = text.split("\n");
        for (const line of lines) {
          arrayOfData.push(line.split(","));
        }
        for (let i = 1; i < arrayOfData.length; i++) {
          arrayOfData[i].pop();
        }
        setData(arrayOfData);
        console.table(arrayOfData);

        if (
          arrayOfData[0][0].includes("Error occurred while trying to proxy")
        ) {
          setLoadingTable(false);
          setLoadingButtonColor({
            backgroundColor: "#512682",
            color: "white",
          });
          setPreviewText("Something Went Wrong");
        } else {
          setLoadingTable(false);
          const add = document.querySelector("#tablepage");
          const remove = document.querySelector("#mainpage");

          addCSS(add, "activeblock");
          removeCSS(remove, "activeflex");
          setDisplayTitle({
            display: "none",
          });
        }

        // if(arrayOfData[])
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  async function handleDownload(event) {
    event.preventDefault();
    setDownloadText("Download");
    setDownloadButtonColor({
      backgroundColor: "#512682",
      color: "white",
    });
    setLoadingDownload(true);
    const url = new URL(
      "https://flask-production-9caa.up.railway.app/download"
    );
    const publicKeyResponse = await fetch(
      "https://flask-production-9caa.up.railway.app/public_key"
    );
    const public_pem = await publicKeyResponse.text();
    const publicKey = forge.pki.publicKeyFromPem(public_pem);
    const encryptedUsername = publicKey.encrypt(username, "RSA-OAEP", {
      md: forge.md.sha256.create(),
    });
    const encryptedPassword = publicKey.encrypt(password, "RSA-OAEP", {
      md: forge.md.sha256.create(),
    });

    const encodedUsername = forge.util.encode64(encryptedUsername);
    const encodedPassword = forge.util.encode64(encryptedPassword);
    url.searchParams.append("username", encodedUsername);
    url.searchParams.append("password", encodedPassword);

    fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:108.0) Gecko/20100101 Firefox/108.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
      },
    })
      .then((response) => {
        if (response.status !== 200) {
          status = response.status;
          setLoadingDownload(false);
          setDownloadButtonColor({
            backgroundColor: "#F44336",
            color: "white",
          });
          setDownloadText("Something Went Wrong");
          return;
        }
        status = response.status;
        return response.text();
      })
      .then((responseText) => {
        setLoadingDownload(false);
        const date = new Date();
        const dateString = date
          .toISOString()
          .slice(0, -5)
          .replace(/[-T:]/g, "-");
        const downloadName = `${dateString}.csv`;
        const a = document.createElement("a");
        a.style.display = "none";

        if (status === 200) {
          a.href = URL.createObjectURL(new Blob([responseText]));
          a.download = downloadName;
          document.body.appendChild(a);
          a.click();
        }

        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        setLoadingDownload(false);
        console.error("Error:", error);
      });
  }

  function addCSS(element, className) {
    element.classList.add(className);
  }

  function removeCSS(element, className) {
    element.classList.remove(className);
  }

  function goBack() {
    const remove = document.querySelector("#tablepage");
    const add = document.querySelector("#mainpage");

    addCSS(add, "activeflex");
    removeCSS(remove, "activeblock");
    setDisplayTitle({
      display: "flex",
    });
  }

  return (
    <div className="maindiv" style={{ overflow: "hidden" }}>
      <div className="maintextcontainer" style={displayTitle}>
        <p className="maintext"> Western Schedule Exporter </p>
      </div>
      <div className="mainpage activeflex" id="mainpage">
        <div className="loginsection">
          <div className="usernameinputfield">
            <UsernameInput value={username} setValue={setUsername} />
          </div>
          <div className="passwordinputfield">
            <PasswordInput value={password} setValue={setPassword} />
          </div>
          <div className="actionbuttons">
            <LoadingButton
              loading={loadingTable}
              loadingPosition="end"
              variant="contained"
              endIcon={<VisibilityIcon />}
              onClick={handleSubmit}
              style={LoadingButtonColor}
            >
              {previewText}
            </LoadingButton>
            <div className="separation"> </div>
            <LoadingButton
              loading={loadingDownload}
              loadingPosition="end"
              variant="contained"
              endIcon={<DownloadIcon />}
              onClick={handleDownload}
              style={DownloadButtonColor}
            >
              {downloadText}
            </LoadingButton>
          </div>
        </div>
      </div>
      <div className="contacticonscontainer" style={displayTitle}>
        <div className="grid-item">
          <a href="https://github.com/ameenalasady" className="contacticon">
            <GitHubIcon />
          </a>
        </div>
        <div className="grid-item">
          <a
            href="https://www.linkedin.com/in/ameenalasady/"
            className="contacticon"
          >
            <LinkedInIcon />
          </a>
        </div>
        <div className="grid-item">
          <a
            href="https://ameenalasady.github.io/Personal-Website/"
            className="contacticon"
          >
            <WebAssetIcon />
          </a>
        </div>
      </div>
      <div className="tablepage" id="tablepage">
        <div className="table">
          <Scrollbars
            className="tableContents"
            autoHide
            style={{ width: "80vw", height: "80vh" }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {data[0] &&
                    data[0].map((header, index) => (
                      <TableCell className="tablecells" key={index}>
                        {header}
                      </TableCell>
                    ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.slice(1).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell className="tablecells" key={cellIndex}>
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Scrollbars>
        </div>
        <div className="backbutton">
          <Button
            onClick={goBack}
            variant="contained"
            startIcon={<ArrowBackIosIcon />}
            style={{ backgroundColor: "#512682", color: "white" }}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
