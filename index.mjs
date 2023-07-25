import express from "express";
import hbs from "hbs";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";
import https from "https";
 




//recuperar ruta raiz
import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
app.set("view engine", "hbs");
app.use(express.static("public"));
hbs.registerPartials(__dirname + "/views/partials");
// Middleware para analizar el cuerpo de la solicitud
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true}));

app.get("/", (req, res) => {
  res.render("index");

});

app.post("/enviar-mail", (req, res)=>{
    const asunto = req.body.asunto;
    const mensaje = req.body.mensaje;
    const destinatarios = req.body.correos;
    let correos = destinatarios.split(",");
   consultarApi();
      
    
    //enviarMail(asunto, mensaje, correos);

});

 app.listen(3000, () => {
    console.log("Server on port 3000");
 });




  function consultarApi() {
  https
    .get("https://mindicador.cl/api",  function (res) {
      res.setEncoding("utf-8");
      //console.log(res);
      var data = "";

      res.on("data", function (chunk) {
        data += chunk;
      });
      res.on("end",  function () {
        var dailyIndicators = JSON.parse(data);
        console.log(dailyIndicators);
        return dailyIndicators;
      });
    })
    .on("error", function (err) {
      console.log("Error al consumir la API!");
    });
}




const enviarMail =  (asunto, mensaje, correos) => {

    
  console.log(data);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "davidtorresim@gmail.com",
      pass: "nmacuzmcmgntcypr",
    },
  });


  correos.forEach((correo) => {
    const mailOptions = {
      from: "davidtorresim@gmail.com",
      to: correo,
      subject: asunto,
      html: `<div class="">${mensaje} <br> <br>
      <p>El valor de la UF es: ${data}</p></div>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email enviado a " + correo + ": " + info.response);
      }
    });
  });
};

