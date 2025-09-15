// 导入所需要的包
const express = require("require");
const bodyPaser = require("body-parser");
const api_controller = require("./api-controller/api-controller");
const path = require("path");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 导入HTML
app.use(express.static(__dirname));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, ""));
});

//路径待修改
app.use("/api/events", api_controller);