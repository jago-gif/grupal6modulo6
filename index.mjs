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

app.post("/enviar-mail", async (req, res) => {
  const asunto = req.body.asunto;
  const mensaje = req.body.mensaje;
  const destinatarios = req.body.correos;
  let correos = destinatarios.split(",");

  try {
    const data = await consultarApi();
    console.log(data);
    enviarMail(asunto, mensaje, correos, data);
    res.send("Correo enviado correctamente.");
  } catch (error) {
    console.error("Error al consultar la API o enviar el correo:", error);
    res.status(500).send("Error al enviar el correo.");
  }
});

 app.listen(3000, () => {
    console.log("Server on port 3000");
 });




 function consultarApi() {
  return new Promise((resolve, reject) => {
    https.get("https://mindicador.cl/api", function (res) {
      res.setEncoding("utf-8");
      let data = "";

      res.on("data", function (chunk) {
        data += chunk;
      });

      res.on("end", function () {
        try {
          const dailyIndicators = JSON.parse(data);
          resolve(dailyIndicators);
        } catch (error) {
          reject("Error al parsear la respuesta de la API.");
        }
      });
    }).on("error", function (err) {
      reject("Error al consumir la API.");
    });
  });
}




const enviarMail = (asunto, mensaje, correos, data) => {
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
      <p>El valor del dolar es: ${data.dolar.valor}</p><br>
      <p>El valor del euro es: ${data.euro.valor}</p><br>
      <p>El valor del uf de hoy es: ${data.uf.valor}</p><br>
      <p>El valor de la UTM es: ${data.utm.valor}</p></div>`,
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

