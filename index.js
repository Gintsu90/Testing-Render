import dotenv from "dotenv";
dotenv.config();
import express from "express";
import morgan from "morgan";
import cors from "cors";
import Person from "./models/person.js";


const app = express();
const PORT = process.env.PORT || 3001;


app.use(express.json());
app.use(cors());
app.use(express.static("build"));

morgan.token("person", (req, res) => {
    return JSON.stringify(req.body);
});
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :person"));


let names = [
    {
        name: "Toni",
        number: "202-123123",
        id: 1
    },
    {
        name: "Apina",
        number: "202-143432423",
        id: 2
    },
    {
        name: "Pena",
        number: "234242423",
        id: 3
    },
    {
        name: "Jope",
        number: "234024923",
        id: 4
    },
];

morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms'
    ].join(' ')
  })

const generateId = () => {
    const randomId = Math.floor(Math.random() * 10000 + 1)
    return randomId 
};


app.get("/api/names", (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
});

app.get("/api/names/:id", (req, res) => {
    const id = Number(req.params.id);
    const name = names.find(name => name.id === id)
    if (name) {
        res.json(name);
    } else {
        res.status(404).end()
    }
});

app.get("/info", (req, res) => {
    res.send(`Phonebook has info for ${names.length} people<br>${new Date()}`);
});

app.post("/api/names", (req, res) => {
    const body = req.body
    const newName = {
        name: body.name,
        number: body.number,
        id: generateId()
    };
    const nameExist = names.some(n => n.name === newName.name);

    if (!body.name || !body.number) {
        return res.status(400).json({
            error: "name or number missing"
        })
    };

    if (nameExist) {
        return res.status(400).json({
            error: "Name must be unique"
        })
    };
    
    names = names.concat(newName)
    res.json(newName)
    console.log(names)
});

app.delete("/api/names/:id", (req, res) => {
    const id = Number(req.params.id)
    names = names.filter(name => name.id != id)
    console.log(names)
    res.status(204).end()
})

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});

