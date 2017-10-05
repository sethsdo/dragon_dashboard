"use strict"

const express = require('express')
const app = express();
const mongoose = require('mongoose');
const moment = require('moment');
const bodyParser = require('body-parser');
const path = require('path');
mongoose.connect('mongodb://localhost/dragon_mongoose');
const DragonSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 45, minlength: 3},
    about: { type: String, required: true, maxlength: 255, minlength: 3 },
    species: { type: String, required: true, maxlength: 100, minlength: 3 }
}, { timestamps: true });

mongoose.model('Pack', DragonSchema);
const Pack = mongoose.model('Pack');
const session = require('express-session');

app.use(session({ secret: 'expresspasskey' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

mongoose.Promise = global.Promise;


app.get('/', function (req, res) {
    Pack.find({}, function (err, pack) {
        if (err) {
            console.log("something wen't wrong!")
        }
        //console.log(pack)
        const context = {
            "pack": pack,
        }
        //console.log(context)
        res.render('index', context);
    });
});

app.get('/add', function (req, res) {
    if (!req.session.errors) {
        req.session.errors = [];
    }
    //console.log(req.session.errors)
    const context = {
        "errors": req.session.errors,
    }
    //console.log(context);
    res.render("new_dragon", context)
});


app.post('/addDragon', function (req, res) {
    var pack = new Pack({ name: req.body.name, about: req.body.about, species: req.body.species });
    pack.save(function (err) {
        if (err) {
            req.session.errors = pack.errors;
            res.redirect('/add')
        }
        else {
            res.redirect('/');
        }
    })
})

app.get('/pack/edit/:id', function (req, res) {
    if (!req.session.errors) {
        req.session.errors = [];
    }
    //console.log(req.session.errors)
    const context = {
        "errors": req.session.errors,
        "id": req.params.id,
    }
    //console.log(context);
    res.render("edit_dragon", context)
});

app.post('/edit/:id', function (req, res) {
    Pack.findById({_id: req.params.id}, function (err, dragon) {
        console.log(dragon);
        if (err) {
            console.log("something wen't wrong!")
        }
        else {
            dragon.name = req.body.name || dragon.name;
            dragon.about = req.body.about || dragon.about;
            dragon.species = req.body.about || dragon.species;

            dragon.save((er, dragon) => {
                if (err) {
                    console.log("something wen't wrong!")
                }
                console.log("Success!")
                res.redirect("/")
            })
        }
    })
})

app.get('/delete/:id', function (req, res) {
    console.log("hello")
    Pack.findByIdAndRemove({_id: req.params.id}, function (err, dragon) {
        if (err) {
            console.log("something wen't wrong!")
        }
        const response ={
            "message": "dragon deleted",
        }
        res.redirect("/")
    })
})

app.get('/back', function (req, res) {
    req.session.destroy();
    res.redirect('/')
});

app.listen(8000, function () {
    console.log("listening on port 8000");
})