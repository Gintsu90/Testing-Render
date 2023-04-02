import dotenv from "dotenv";
dotenv.config();
import express from "express";
import morgan from "morgan";
import cors from "cors";
import Person from "./models/person.js";


const app = express();
const PORT = process.env.PORT || 3001;

morgan.token("person", (req, res) => {
    return JSON.stringify(req.body);
});

const unknownEndpoint = (req, res) => {
    res.status(404).send({error: "unknown endpont"})
}

const errorHandler = (error, req, res, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return res.status(400).send({ error: 'malformatted id' })
    }
  
    next(error)
  }

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :person"));


app.get("/api/names", (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
});

app.get("/api/names/:id", (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if(person) {
                res.json(person);
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
});

app.post("/api/names", (req, res) => {
    const body = req.body
    const person = new Person ({
        name: body.name,
        number: body.number,
    });
    
    if (!body.name || !body.number) {
        return res.status(400).json({
            error: "name or number missing"
        })
    };

    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
});

app.put("/api/names/:id", (req, res, next) => {
    const body = req.body;

    const person = {
        name: body.content,
        number: body.number,
    };

    Person.findByIdAndUpdate(req.params.id, person, { new:true })
        .then(updatedPerson => {
            res.json(updatedPerson)
        })
        .catch(error => next(error))
});

app.delete("/api/names/:id", (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))
});

app.use(unknownEndpoint);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});

