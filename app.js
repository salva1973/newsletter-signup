import express from "express"
import https from "https"
import chalk from "chalk"
import path from "path"
import dotenv from 'dotenv'

const __dirname = path.resolve()

dotenv.config()
const PORT = process.env.PORT
const DC = process.env.MAILCHIMP_DC
const LIST_ID = process.env.MAILCHIMP_LIST_ID
const USER = process.env.MAILCHIMP_USER
const API_KEY = process.env.MAILCHIMP_API_KEY

const app = express()
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '/signup.html'))
})

app.post('/', (req, res) => {
    const firstName = req.body.fName
    const lastName = req.body.lName
    const email = req.body.email

    const data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }
            }            
        ]
    }

    const jsonData = JSON.stringify(data)   

    const url = `https://${DC}.api.mailchimp.com/3.0/lists/${LIST_ID}`

    const options = {
        method: "POST",
        auth: `${USER}:${API_KEY}`
    }

    const request = https.request(url, options, (response) => {

        if (response.statusCode === 200) {
            res.sendFile(path.join(__dirname, '/success.html'))            
        } else {
            res.sendFile(path.join(__dirname, '/failure.html'))            
        }

        response.on("data", (data) => {
            console.log(JSON.parse(data))
        })
    })    

    request.write(jsonData)
    request.end()
})


app.post('/failure', (req, res) => {
    res.redirect("/")
})

app.listen(PORT, () => {
    console.log(chalk.blue(`Server is listening on port: ${PORT}`))
})