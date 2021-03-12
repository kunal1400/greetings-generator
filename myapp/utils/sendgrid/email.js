const dotenv = require('dotenv').config()
let mg2 = require('@sendgrid/mail')
const fs = require("fs")
mg2.setApiKey(process.env.SENDGRID_APIKEY)

const sendGeneralEmail = (body) => {
  const sendData = {
    from: process.env.SENDER_EMAIL,
    bcc: [process.env.DIAMOND_REPORT_BCC_SEND],
    to: body.Destination.ToAddresses,
    subject: body.Message.Subject.Data,
    html: body.Message.Body.Html.Data
  }
  mg2.send(sendData)
  .then(m => {
    console.log('Mail sent')
  })
  .catch(error => {
    console.error(error.toString())
  })
}

const sendRawEmail = (to, subject, html) => {
  const sendData = {
    from: process.env.SENDER_EMAIL,
    to,
    subject,
    html
  }
  mg2.send(sendData)
  .then(m => {
    console.log('Mail sent')
  })
  .catch(error => {
    console.error(error.toString())
  })
}

/**
* @params
*
* to can be array of max 10 values
* bcc can be array if set then email will go to bcc also
*
**/
const sendEmailByTemplate = (to, templateId, dynamic_template_data, bcc=null) => {

  // Generating the date to send
  let sendData = {
    from: process.env.SENDER_EMAIL,
    to,
    templateId,
    dynamic_template_data
  }

  // Checking if bcc is set
  if (bcc !== null) {
    sendData['bcc'] = bcc
  }

  // Calling sendgrid api
  return mg2.send(sendData)
  .then(m => {
    console.log("SUCCESS: sendEmailByTemplate method called", JSON.stringify(m))
    return m
  })
  .catch(error => {
    console.log("ERROR: sendEmailByTemplate method called", JSON.stringify(error))
    return error
  })

}

// const sendDiamondFeedProcessingEmail = (dynamic_template_data, filePath, logPath) => {
//   let attachments = []
//   if (filePath && logPath) {
//     let fName = getShortVendorName(dynamic_template_data.FirstName)
//     // if (dynamic_template_data.FirstName === 'Ryan & Rodney') {
//     //   fName = 'RR'
//     // } else if (dynamic_template_data.FirstName === 'Jack Reiss') {
//     //   fName = 'JR'
//     // } else if (dynamic_template_data.FirstName === 'RDI Diamonds') {
//     //   fName = 'RDI Diamonds'
//     // } else if (dynamic_template_data.FirstName === 'Horizon') {
//     //   fName = 'Horizon'
//     // } else if (dynamic_template_data.FirstName === 'Ring Concierge') {
//     //   fName = 'RC'
//     // } else if (dynamic_template_data.FirstName === 'Ofer Mizrahi') {
//     //   fName = 'OM'
//     // } else if(dynamic_template_data.FirstName === 'David Rovinsky') {
//     //   fName = 'DR'
//     // }

//     let csvFile = fs.readFileSync(filePath).toString("base64")
//     let logFile = fs.readFileSync(logPath).toString("base64")
//     attachments.push(
//       {
//         content: csvFile,
//         filename: filePath && filePath.indexOf('.csv') !== -1 ? `${fName}.csv` :  `${fName}.xls`,
//         type: filePath && filePath.indexOf('.csv') !== -1 ? "application/csv" : "application/xls",
//         disposition: "attachment",
//         contentId: 'file'
//       }
//     )
//     attachments.push(
//       {
//         content: logFile,
//         filename: `${fName}_LOG.txt`,
//         type: "text/plain",
//         disposition: "attachment",
//         contentId: 'txtlog'
//       }
//     )
//   }
  
//   let sendData = {
//     from: process.env.SENDER_EMAIL,
//     //to: 'fullstack@relibit.com',
//     // bcc: ['projects@relibit.com'],
//     to: 'vow@ringconcierge.com',
//     // cc: ['alex@ringconcierge.com'],
//     bcc: ['fullstack@relibit.com'],
//     templateId: 'd-eef89105ed3c49cf99fe722daf97afc8',
//     dynamic_template_data
//   }
//   // for development
//   if (process.env.PROCESS_ENV_CONTROL !== 'production') {
//     sendData.to = 'fullstack@relibit.com'
//     delete sendData.bcc
//     // delete sendData.cc
//   }
//   if (attachments.length) {
//     sendData.attachments = attachments
//   }
//   mg2.send(sendData)
//   .then(m => {
//     console.log("diamond processing email + success")
//   })
//   .catch(error => {
//     console.log("diamond processing email + failure")
//   })
// }


// const sendDiamondFeedProcessedEmailWithFile = (dynamic_template_data, filePath, fName) => {
//   let sendData = {
//     from: process.env.SENDER_EMAIL,
//     //to: 'fullstack@relibit.com',
//     // bcc: ['projects@relibit.com'],
//     to: 'vow@ringconcierge.com',
//     cc: ['alex@ringconcierge.com'],
//     bcc: ['fullstack@relibit.com'],
//     templateId: 'd-408fa657dca64de3a9a46e84a0581101',
//     dynamic_template_data
//   }
//   const attachments = []
//   let xlsFile = fs.readFileSync(filePath).toString("base64")
//   attachments.push(
//     {
//       content: xlsFile,
//       filename: fName,
//       type: "application/xls",
//       disposition: "attachment",
//       contentId: 'file'
//     }
//   )
//   // for development
//   if (process.env.PROCESS_ENV_CONTROL !== 'production') {
//     sendData.to = 'fullstack@relibit.com'
//     delete sendData.bcc
//     delete sendData.cc
//   }
//   if (attachments.length) {
//     sendData.attachments = attachments
//   }
//   mg2.send(sendData)
//   .then(m => {
//     console.log("with video + success")
//     fs.unlink(filePath, function (err) {
//       if (err) {
//         console.log(err)
//       } else {
//         // if no error, file has been deleted successfully
//         console.log('File deleted!');
//       }
//     });
//   })
//   .catch(error => {
//     console.log("with video + failure")
//     fs.unlink(filePath, function (err) {
//       if (err) {
//         console.log(err)
//       } else {
//         // if no error, file has been deleted successfully
//         console.log('File deleted!');
//       }
//     });
//   })
// }

// const withoutVideoWithCsv = (dynamic_template_data, filePath, fName) => {
//   let sendData = {
//     from: process.env.SENDER_EMAIL,
//     //to: 'fullstack@relibit.com',
//     // bcc: ['projects@relibit.com'],
//     to: 'vow@ringconcierge.com',
//     cc: ['alex@ringconcierge.com'],
//     bcc: ['fullstack@relibit.com'],
//     templateId: 'd-4a54c09e985f4ec8afd8331838164ecf',//'d-24c8b9bda7d14841a7927f96661b4ec3',
//     dynamic_template_data
//   }
//   const attachments = []
//   let xlsFile = fs.readFileSync(filePath).toString("base64")
//   attachments.push(
//     {
//       content: xlsFile,
//       filename: fName,
//       type: "application/xls",
//       disposition: "attachment",
//       contentId: 'file'
//     }
//   )

//   // for development
//   if (process.env.PROCESS_ENV_CONTROL !== 'production') {
//     sendData.to = 'fullstack@relibit.com'
//     delete sendData.bcc
//     delete sendData.cc
//   }
//   if (attachments.length) {
//     sendData.attachments = attachments
//   }
//   mg2.send(sendData)
//   .then(m => {
//     console.log("without video with attachments + success")
//     fs.unlink(filePath, function (err) {
//       if (err) {
//         console.log(err)
//       } else {
//         // if no error, file has been deleted successfully
//         console.log('File deleted!');
//       }
//     });
//   })
//   .catch(error => {
//     console.log("without video with attachments + failure")
//     fs.unlink(filePath, function (err) {
//       if (err) {
//         console.log(err)
//       } else {
//         // if no error, file has been deleted successfully
//         console.log('File deleted!');
//       }
//     });
//   })
// }

module.exports = {
  send: sendGeneralEmail,
  sendRawEmail,
  sendEmailByTemplate  
}
