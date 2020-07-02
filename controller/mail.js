// var nodemailer = require('nodemailer');
// var EmailTemplate = require('email-templates').EmailTemplate;
// var mail_helper = {};

// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     tls: { rejectUnauthorized: false },
//     auth: {
//         user: "demo.narola@gmail.com",
//         pass: "narola@2019"
//     }
// });

// mail_helper.send = async (template_name, options, data) => {
//     console.log("template_name", template_name);
//     console.log("option", options);
//     console.log("data....", data);
//     // var template_sender = transporter.templateSender(new EmailTemplate('emails/' + template_name), {

//     // });
//     var transporter = nodemailer.createTransport({
//         service: 'gmail',
//         tls: { rejectUnauthorized: false },
//         auth: {
//             user: "demo.narola@gmail.com",
//             pass: "narola@2019"
//         }
//     });

//     var mailOptions = {
//         from: 'pbh@narola.email',
//         to: options.to,
//         subject: options.subject,
//         html: `Please click on the following link ${data.reset_link} to reset your password.`
//     };
//     transporter.sendMail(mailOptions, function (error, res) {

//         if (error) {
//             console.log("error", error)
//             return error
//         }
//         console.log("successs")
//         return res
//     });
//     // return template_sender({
//     //     from: "demo.narola@gmail.com",
//     //     to: options.to,
//     //     subject: options.subject,
//     // }, data).then(function (info) {
//     //     return { "status": 1, "message": info };
//     // }).catch(function (err) {
//     //     return { "status": 0, "error": err };
//     // });
// };

// module.exports = mail_helper;

var nodemailer = require("nodemailer");
var EmailTemplate = require("email-templates").EmailTemplate;
var mail_helper = {};

var transporter = nodemailer.createTransport({
  service: "gmail",
  tls: { rejectUnauthorized: false },
  auth: {
    // user: "demo.narola@gmail.com",
    // pass: "#N@r0L@21"
    user: "pbh.narola@gmail.com",
    pass: "password123#"
  }
});

mail_helper.send = async (template_name, options, data) => {
  var template_sender = transporter.templateSender(
    new EmailTemplate("emails/" + template_name),
    {
      from: "demo.narola@gmail.com"
    }
  );
  return template_sender(
    {
      to: options.to,
      subject: options.subject
    },
    data
  )
    .then(function(info) {
      return { status: 1, message: info };
    })
    .catch(function(err) {
      return { status: 0, error: err };
    });
};

module.exports = mail_helper;
