const express = require("express")
const expressLayout = require("express-ejs-layouts")
const methodOverride = require("method-override")
const bodyParser = require("body-parser")
const bcrypt = require("bcryptjs")
const LocalStorage = require("node-localstorage").LocalStorage

var localStorage = new LocalStorage("./scratch")

require("./utils/db")
const Note = require("./model/note")
const User = require("./model/user")

const session = require("express-session")
const cookieParser = require("cookie-parser")
const flash = require("connect-flash")

const app = express()
const port = 3000

// Template Engine
app.set("view engine", "ejs")
app.use(expressLayout)

// config flash()
app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true,
        cookie: { maxAge: 6000 },
    })
)
app.use(cookieParser("secret"))
app.use(flash())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(methodOverride("_method"))

app.get("/", async (req, res) => {
    const user_id = localStorage.getItem("user_id")
    if (!user_id) res.redirect("/login-form")

    const notes = await Note.find({ user_id: user_id })

    res.render("index", {
        title: "Home",
        layout: "layouts/main-layout",
        notes,
        msg: req.flash("msg"),
    })
})

app.get("/add-note", (req, res) => {
    res.render("add-note", {
        title: "Add Note Form",
        layout: "layouts/main-layout",
    })
})

app.post("/add-note", (req, res) => {
    const { title, note } = req.body
    const user_id = localStorage.getItem("user_id")
    const date = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    })

    Note.insertMany({
        user_id,
        title,
        date,
        note,
    }).then(() => {
        req.flash("msg", "Note added!")
        res.redirect("/")
    })
})

app.get("/note/edit/:_id", async (req, res) => {
    const note = await Note.findOne({ _id: req.params._id })
    res.render("edit-note", {
        title: "Edit Note Form",
        layout: "layouts/main-layout",
        note,
    })
})

app.get("/register-form", (req, res) => {
    res.render("register-form", {
        title: "Form Login & SignUp",
        layout: "layouts/main-layout",
    })
})

app.get("/login-form", (req, res) => {
    res.render("login-form", {
        title: "Form Login & SignUp",
        layout: "layouts/main-layout",
        msg: req.flash("msg"),
    })
})

app.post("/register", async (req, res) => {
    try {
        const { username, password, confirmPassword } = req.body
        if (password !== confirmPassword) {
            res.status(400).json({ err: "Passwod not match" })
        }
        const duplicated = await User.findOne({ username })
        if (duplicated) {
            return res.status(400).json({ err: "Username is already used!" })
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const newUser = {
            username,
            password: hashPassword,
        }

        User.insertMany(newUser, (err, result) => {
            if (err) throw err
            req.flash("msg", "Success ")
            res.redirect("/login-form")
        })
    } catch (err) {
        res.status(400).json(err)
    }
})

app.post("/login", (req, res) => {
    try {
        const { username, password } = req.body
        if (!username || !password)
            throw (err = { status: 400, msg: "Bad Request" })

        User.findOne({ username }, async (err, result) => {
            if (err) throw err

            bcrypt.compare(password, result.password, (err, data) => {
                if (err) throw err

                if (data) {
                    localStorage.setItem("user_id", result._id)
                    res.redirect("/")
                } else {
                    req.flash("msg", "Invalid Username or Password")
                    res.redirect("/login-form")
                }
            })
        })
    } catch (err) {
        res.status(err.status).json(err.msg)
    }
})

app.get("/logout", (req, res) => {
    localStorage.clear()
    res.redirect("/login-form")
})

app.get("/note/:_id", async (req, res) => {
    const note = await Note.findById(req.params._id)
    res.render("detail", {
        title: "Detail Note",
        layout: "layouts/main-layout",
        note,
    })
})

app.put("/update_note", (req, res) => {
    const { _id, title, note } = req.body
    Note.updateOne(
        { _id },
        {
            title,
            note,
        }
    ).then(() => {
        req.flash("msg", "Note updated!")
        res.redirect("/")
    })
})

app.delete("/delete_note", (req, res) => {
    Note.deleteOne({ _id: req.body._id }).then(() => {
        req.flash("msg", "Note Deleted!")
        res.redirect("/")
    })
})

app.listen(port, () => {
    console.log(`NoteApp || http://localhost:${port}`)
})
