var express = require('express');
var router = express.Router();
var sg = require('../utils/sendgrid/email')

/* GET home page. */
router.get('/', function(req, res, next) {
	let { first_name, last_name, user_email, working_on, service_type, service_description, redirect_url } = req.query
	
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

	// Sending Care Page Email
	sg.sendEmailByTemplate(user_email, 'd-0290ae52590a44e79f06c2be4b07f963', {
		first_name, 
		working_on, 
		service_type, 
		service_description
	})
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

});

router.post('/reshape', function(req, res, next) {
	if(!req.body.inputImage) {
		res.send({status:false, message: "inputImage is required"})
		return
	}

	if(!req.body.convertToShape) {
		res.send({status:false, message: "convertToShape is required"})
		return
	}

	/**
	* 1: Getting image from request body it can be base64 or image url
	**/
	let base64Image = getBase64FromString( req.body.inputImage )

	/**
	* 2: Getting image from request body it can be base64 or image url
	**/
	convertImageShape( base64Image, req.body.convertToShape)	
	.then(function(jimpInstance) {
		jimpInstance.getBase64(Jimp.AUTO, function(error, reShapedImage) {
			if (error) {
				res.send({status:false, error})				
			} else {
				res.send({status:true, templateData: reShapedImage})			
			}
		});
	})
	.catch(function(error) {
		res.send({status:false, error})		
	})
})

/* Generate greeting api. */
/**
* This is the post method and required 2 parameters
*
* inputImage = base64 string of the image
*
* template_name = Name of the base template on which image will be appended
**/
router.post('/generate', function(req, res, next) {
	if(!req.body.inputImage) {
		res.send({status:false, message: "inputImage is required"})
		return
	}

	if(!req.body.base_image) {
		res.send({status:false, message: "base_image is required"})
		return
	}

	if(!req.body.jimp_mode) {
		res.send({status:false, message: "jimp_mode is required"})
		return
	}

	/**
	* 1: Getting params from request data
	**/	
	let {inputImage, base_image, convertToShape, jimp_mode} = req.body
	let imgToReplaceX = 0, imgToReplaceY = 0, opacitySource = 0, opacityDest = 0, requiredWidth = 0, requiredHeight = 0, inputFileRotateDeg = 0

	if( !req.body.imgToReplaceX ) {
		res.send({status:false, message: "imgToReplaceX is required"})
		return
	} 
	else {
		imgToReplaceX = parseInt( req.body.imgToReplaceX )
	}

	if( !req.body.imgToReplaceY ) {
		res.send({status:false, message: "imgToReplaceY is required"})
		return
	}
	else {
		imgToReplaceY = parseInt( req.body.imgToReplaceY )
	}

	if( !req.body.opacitySource ) {
		res.send({status:false, message: "opacitySource is required"})
		return
	}
	else {
		opacitySource = parseFloat( req.body.opacitySource )
	}

	if( !req.body.opacityDest ) {
		res.send({status:false, message: "opacityDest is required"})
		return
	}
	else {
		opacityDest = parseFloat( req.body.opacityDest )		
	}

	if( !req.body.requiredWidth ) {
		res.send({status:false, message: "requiredWidth is required"})
		return
	}
	else {
		requiredWidth = parseInt( req.body.requiredWidth )
	}

	if( !req.body.requiredHeight ) {
		res.send({status:false, message: "requiredHeight is required"})
		return
	}
	else {
		requiredHeight = parseInt( req.body.requiredHeight )
	}

	if( !req.body.inputFileRotateDeg ) {
		res.send({status:false, message: "inputFileRotateDeg is required"})
		return
	}
	else {
		inputFileRotateDeg = parseInt( req.body.inputFileRotateDeg )
	}		

	/**
	* 2: Getting the text written by user
	**/
	let templateMessage = req.body.template_message ? req.body.template_message : null

	/**
	* 3: Getting the user uploade image
	**/
	let base64Image = getBase64FromString( inputImage )

	/**
	* 5: Setting the output folder path
	**/
	let outputFile = '../templates/output/kamehameha.png'

	/**
	* 6: Setting the mode
	**/
	let mode = Jimp.BLEND_SOURCE_OVER
	if( jimp_mode == "BLEND_SOURCE_OVER" ) {
		mode = Jimp.BLEND_SOURCE_OVER
	}
	else if( jimp_mode == "BLEND_DESTINATION_OVER" ) {
		mode = Jimp.BLEND_DESTINATION_OVER
	}
	else if(  jimp_mode == "BLEND_MULTIPLY" ) {
		mode = Jimp.BLEND_MULTIPLY
	}
	else if(  jimp_mode == "BLEND_ADD" ) {
		mode = Jimp.BLEND_ADD
	}
	else if(  jimp_mode == "BLEND_SCREEN" ) {
		mode = Jimp.BLEND_SCREEN
	}
	else if(  jimp_mode == "BLEND_OVERLAY" ) {
		mode = Jimp.BLEND_OVERLAY
	}
	else if(  jimp_mode == "BLEND_DARKEN" ) {
		mode = Jimp.BLEND_DARKEN
	}
	else if(  jimp_mode == "BLEND_LIGHTEN" ) {
		mode = Jimp.BLEND_LIGHTEN
	}
	else if(  jimp_mode == "BLEND_HARDLIGHT" ) {
		mode = Jimp.BLEND_HARDLIGHT
	}
	else if(  jimp_mode == "BLEND_DIFFERENCE" ) {
		mode = Jimp.BLEND_DIFFERENCE
	}
	else if(  jimp_mode == "BLEND_EXCLUSION" ) {
		mode = Jimp.BLEND_EXCLUSION
	}

	/**
	* 7: Starting the greetings generator process
	**/
	Jimp.read(base_image)
	.then(function(mainGreeting) {
		return mainGreeting
	})
	.then(function(greeting) {
		// Checking if convertToShape is valid and set
		if ( convertToShape && availableMasks.indexOf(convertToShape) !== -1 ) {
			// Converting the input image shape
			return convertImageShape( base64Image, convertToShape)
			.then(function(modifiedNooraImage) {
				// Appending the input image in the choosen greeting
				return greeting
				.composite(modifiedNooraImage, imgToReplaceX, imgToReplaceY, {
					mode: mode,
					opacitySource: opacitySource,
					opacityDest: opacityDest
				})
			})
		}
		else {
			return Jimp.read( base64Image )
			.then(nooraImage => {
				// Resizing the input image as per required in the template
				if (requiredWidth && requiredHeight) {
					if ( 0 == requiredWidth && 0 == requiredHeight ) {
						// Setting the width and height of input image equals to greeting image
						return nooraImage.resize(greeting.bitmap.width, greeting.bitmap.height)
					}
					else {
						return nooraImage.resize(requiredWidth, requiredHeight)
					}
				}
				else {
					return nooraImage
				}
			})
			.then(function(nooraImage) {
				/**
				* Rotating the input image as per required in the template
				**/
				if ( inputFileRotateDeg > 0 ) {
					return nooraImage.rotate( inputFileRotateDeg )
				}
				else {
					return nooraImage
				}
			})
			.then(function(modifiedNooraImage) {
				/**
				* Appending the input image in the choosen greeting
				**/
				if ( mode && mode != "none" ) {
					console.log({
						mode: mode,
						opacitySource: opacitySource,
						opacityDest: opacityDest
					}, "blend overlay response")
					
					return greeting
					.composite(modifiedNooraImage, imgToReplaceX, imgToReplaceY, {
						mode: mode,
						opacitySource: opacitySource,
						opacityDest: opacityDest
					})
				} else {
					return greeting
					.composite(modifiedNooraImage, imgToReplaceX, imgToReplaceY)
				}
			})
			.then(function(generatedTemplate) {
				if (templateMessage && templateMessage.length > 0) {
					/**
					* Appending the user message in the template
					**/
					return Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)
					.then(font => {
						return generatedTemplate.print(font, 0, 0, {
								text: templateMessage,
								alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
								alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
							},
							generatedTemplate.bitmap.width - 30, 
							generatedTemplate.bitmap.height - 30
						)
					})
				}
				else {
					return generatedTemplate
				}					
			})
		}
	})
	.then(function(generatedGreeting) {
		/**
		* Setting watermark at the center
		**/
		return Jimp.read('https://destatic.blob.core.windows.net/images/nodejs-logo.png')
		.then(function(watermark) {
			return generatedGreeting
			.composite(watermark, Jimp.HORIZONTAL_ALIGN_CENTER, Jimp.VERTICAL_ALIGN_MIDDLE, {
				mode: Jimp.BLEND_SOURCE_OVER,
				opacityDest: 1,
				opacitySource: 0.5
			})
		})			
	})
	.then(function(jimpInstance){
 		// return jimpInstance.writeAsync(outputFile);
  		return jimpInstance.getBase64Async(Jimp.AUTO);
	})
	.then(function(templateData) {
  		res.send({ status: true, templateData })
	})
	.catch(err => {
		console.error(err);
  		res.send({ status: false })
	})	
})

module.exports = router;