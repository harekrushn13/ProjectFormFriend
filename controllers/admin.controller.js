const batchModel = require("../models/batch.model")
const xlsx = require("xlsx");
const path = require("node:path");
async function adminMiddleware(req, res, next) {
    if(req.session.admin) {
        res.locals.loggedIn = true;
        return next();
    }
    res.redirect("/admin/login");
}

async function adminLogin(req, res, next) {
    const userError = req.session.error;
    req.session.error = undefined;
    if (req.session.admin) {
        res.redirect("/admin");
        return;
    }
    res.render("admin/login", {userError});
}

async function adminLoginPost(req, res, next) {
    const {username, password} = req.body;
    if (username === "admin" && password === "123") {
        req.session.admin = true;
        res.redirect("/admin");
        return;
    }
    req.session.error = "Invalid Username or Password";
    res.redirect("/admin/login");
}

async function adminHome(req, res, next){
    const batches = await batchModel.countDocuments({});
    console.log(batches);
    res.render("admin/home", {batches});
}


async function adminBatches(req, res, next) {
    const batches = await batchModel.find({}).sort({createdAt: -1});
    res.render("admin/batches", {batches});
}

async function adminBatchesPost(req, res, next) {
    console.log(req.file);
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const arr = xlsx.utils.sheet_to_json(worksheet);
    console.log(arr)
    res.redirect("/admin/batches");
}

module.exports = {adminLogin, adminLoginPost, adminHome, adminMiddleware, adminBatches, adminBatchesPost };
