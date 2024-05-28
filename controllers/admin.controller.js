const batchModel = require("../models/batch.model")
const xlsx = require("xlsx");
const path = require("node:path");
const fs = require("fs")

async function adminMiddleware(req, res, next) {
    if (req.session.admin) {
        res.locals.loggedIn = true;
        return next();
    }
    res.redirect("/admin/login");
}

async function adminLogin(req, res, next) {
    if (req.session.admin) {
        res.redirect("/admin");
        return;
    }
    res.render("admin/login");
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

async function adminHome(req, res, next) {
    const batches = await batchModel.countDocuments({});
    console.log(batches);
    res.render("admin/home", {batches});
}


async function adminBatches(req, res, next) {
    const batches = await batchModel.find({}).sort({createdAt: -1});
    res.render("admin/batches", {batches});
}

async function adminBatchesPost(req, res, next) {
    const {name} = req.body;
    if (!name) {
        req.session.error = "Batch name is required!";
        res.redirect("/admin/batches");
        return;
    }
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    const emailRegexPattern = /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;
    const enrollmentPattern = /^[0-9]+$/;
    const details = [];

    fs.rmSync(req.file.path);

    for (let i = 0; i < data.length; i++) {
        const ele = data[i];
        if (!ele["enrollment"] || !enrollmentPattern.test(ele["enrollment"] + "")) {
            console.log(ele)
            req.session.error = "Invalid / Missing enrollment field!";
            res.redirect("/admin/batches");
            return;
        }
        if (!ele["email"] || !emailRegexPattern.test(ele["email"] + "")) {
            req.session.error = "Invalid / Missing email field!";
            res.redirect("/admin/batches");
            return;
        }
        if (!ele["name"]) {
            req.session.error = "Missing name field!";
            res.redirect("/admin/batches");
            return;
        }
        details.push({enrollment: ele["enrollment"], email: ele["email"], name: ele["name"]});
    }
    const batch = new batchModel({batch:name, details});
    await batch.save();
    req.session.success = "Batch added successfully!";
    res.redirect("/admin/batches");
}

module.exports = {adminLogin, adminLoginPost, adminHome, adminMiddleware, adminBatches, adminBatchesPost};
