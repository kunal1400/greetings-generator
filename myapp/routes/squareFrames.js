var express = require('express');
var router = express.Router();
var Jimp = require('jimp');
var utils = require('./utils')

/**
* This is the post method and required 2 parameters
*
* inputImage = base64 string of the image
*
* template_name = Name of the base template on which image will be appended
**/
router.post('/', function(req, res, next) {
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

	if( !req.body.frameResizePixelsToAdd ) {
		res.send({status:false, message: "frameResizePixelsToAdd is required"})
		return
	}
	else {
		frameResizePixelsToAdd = parseInt( req.body.frameResizePixelsToAdd )
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
	let dateStri = Math.floor(Date.now() / 1000);
	let inputfileName = "input"+dateStri+".png"
	let generatedfileName = "generted"+dateStri+".png"

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
	let inputImageInstance = Jimp.read( base64Image )
	// Checking if convertToShape is valid and set
	if ( convertToShape ) {
		if (utils.availableMasks.indexOf(convertToShape) !== -1) {
			// Converting the input image shape
			inputImageInstance = utils.convertImageShape( base64Image, convertToShape)
		}
		else {
			console.log(convertToShape, utils.availableMasks.indexOf(convertToShape), "converted image")
			res.send({status:false, message: `${convertToShape} is invalid`})
			return
		}		
	}	

	Jimp.read(base_image)
	.then(function(mainGreeting) {
		return new Promise(function(resolve, reject) {
			inputImageInstance
			.then(function(iii){
 				return iii.writeAsync( utils.outputFile + inputfileName );
			})
			.then(function(iii) {
				console.log(iii.bitmap.width + frameResizePixelsToAdd, iii.bitmap.height + frameResizePixelsToAdd, "resize")
				mainGreeting
				.resize(iii.bitmap.width + frameResizePixelsToAdd, iii.bitmap.height + frameResizePixelsToAdd)
				.getBuffer(Jimp.AUTO, function(e, d) {
					if (!e) { resolve(d) } 
					else { reject(e) }
				})
			})			
		})
		.then(function(bufferedData) {
			return mainGreeting
		})		
	})
	.then(function(greeting) {		
		return inputImageInstance		
		.then(function(modifiedNooraImage) {
			/**
			* Appending the input image in the choosen greeting
			**/
			if ( mode && mode != "none" ) {
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
	})
	// .then(function(generatedGreeting) {
	// 	/**
	// 	* Setting watermark at the center
	// 	**/
	// 	return Jimp.read( utils.waterMarkImage )
	// 	.then(function(watermark) {
	// 		return generatedGreeting
	// 		.composite(watermark, Jimp.HORIZONTAL_ALIGN_CENTER, Jimp.VERTICAL_ALIGN_MIDDLE, {
	// 			mode: Jimp.BLEND_SOURCE_OVER,
	// 			opacityDest: 1,
	// 			opacitySource: 0.5
	// 		})
	// 	})			
	// })
	.then(function(jimpInstance){
 		return jimpInstance.writeAsync( utils.outputFile + generatedfileName );
 		// return jimpInstance.getBase64Async(Jimp.AUTO);
	})
	.then(function(templateDataa) {
  		res.send({ 
 			status: true, 
 			templateData: utils.outputFileUrl + generatedfileName,
 			uploadedImage: utils.outputFileUrl + inputfileName 
 		})
	})
	.catch(err => {
		console.error(err);
  		res.send({ status: false })
	})	
})

const getBase64FromString = ( inputImage ) => {	
	// Removing `data:image/png;base64,` from string so it will be original base 64 image
	let imageData = inputImage.split(",")

	if (typeof Buffer.from === "function") {
		// Node 5.10+
		return Buffer.from(imageData[1], 'base64'); // Ta-da
	} else {
		// older Node versions, now deprecated
		return new Buffer(imageData[1], 'base64'); // Ta-da
	}
}

module.exports = router;