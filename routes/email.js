var express = require('express');
var router = express.Router();
var utils = require('./utils');
var sg = require('../utils/sendgrid/email');

router.get('/', function(req, res, next) {
  	res.send({ 
		status: true, 
		message: `first_name, last_name, user_email, working_on, service_type, service_description, redirect_url` 
	})
})

router.post('/', function(req, res, next) {
	let { first_name, last_name, user_email, working_on, service_type, service_description, redirect_url, uploadedImages } = req.body
	
	if (!first_name) {
		res.send({ status: false, message:"first_name required" })
		return
	}

	if (!working_on) {
		res.send({ status: false, message:"working_on required" })
		return
	}

	if (!service_type) {
		res.send({ status: false, message:"service_type required" })
		return
	}

	if (!service_description) {
		res.send({ status: false, message:"service_description required" })
		return
	}

	if (!user_email) {
		res.send({ status: false, message:"user_email required" })
		return
	}

	let attachments = []
	// uploaded_image
	if ( Array.isArray(uploadedImages) && uploadedImages.length > 0 ) {
		uploadedImages.map(function(imageData, i) {
			let imagewithbase64 = imageData.split(",")
			// let uploadedImage = utils.getBase64FromString(imageData)
			attachments.push({
				content: imagewithbase64[1],
				filename: `uploadedImage_${i}.png`,
				type: "image/png",
				disposition: "attachment",
			})
		})		
	}
	else {
		console.log(uploadedImages, "+uploadedImages+are+not+present")
	}
	
	// Sending Care Page Email
	sg.sendEmailByTemplate(user_email, 'd-0290ae52590a44e79f06c2be4b07f963', {
		first_name, 
		working_on, 
		service_type, 
		service_description
	}, null, attachments)
	.then(function(data) {
		if (!redirect_url) {
	  		res.send({ status: true, data })
		} 
		else {
			res.redirect(301, redirect_url);
			response.end();
		}
	})
	.catch(function(error) {
	  	res.send({ status: false, error })		
	})	
})

module.exports = router;