var express = require('express');
var router = express.Router();
var Jimp = require('jimp');
var outputDirectory = "../templates/output/"

/**
* COMPOSITION NOTES:
* 1. image.blit: Delete all secion under this image - ex- https://stackoverflow.com/questions/49556025/place-image-over-an-other-image-using-jimp
* 2. image.mask: Masks a source image on to this image using average pixel colour. A completely black pixel on the mask will turn a pixel in the image completely transparent.
*
* https://www.npmjs.com/package/replace-color
* - Remove a watermark
* - Change a background color from a green to a blue one
* - Change a background color from a green to a transparent one (using hex type)
* - Change a background color from a green to a 50% transparent green (using rgb type)
*
* https://codingshiksha.com/javascript/image-processing-in-node-js-using-jimp-library-coding-shiksha/
*
* https://blog.logrocket.com/image-processing-with-node-and-jimp - watermark and resize
*
**/

/* GET home page. */
router.get('/', function(req, res, next) {
	// Jimp.read(currentTemplate.inputFile)
	// // .then(greeting => {
	// // 	Jimp.loadFont(Jimp.FONT_SANS_8_WHITE)
	// // 	.then(font => {
	// // 		greeting.print(
	// // 			font,
	// // 			10,
	// // 			10,
	// // 			{
	// // 				text: 'Hello world!',
	// // 				alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
	// // 				alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
	// // 		    },
	// // 		    300,
	// // 		    300
	// // 		)
	// // 	})
	// // 	.then(function() {
	// // 		return greeting
	// // 	})
	// // 	.catch(function(e) {
	// // 		return e
	// // 	})
	// // })
	// .then(function(greeting) {
	// 	if (currentTemplate.name == "christmasHolidayTemplate") {
	// 		getCircularImage( inputImage, currentTemplate)
	// 		.then(function(modifiedNooraImage){
	// 			return greeting
	// 			.composite(modifiedNooraImage, currentTemplate.imgToReplaceX, currentTemplate.imgToReplaceY, {
	// 				mode: currentTemplate.mode,
	// 				opacitySource: currentTemplate.opacitySource,
	// 				opacityDest: currentTemplate.opacityDest
	// 			})
	// 			.writeAsync(currentTemplate.outputFile); // save
	// 		})
	// 		.catch(err => {
	// 			console.error(err);
	// 			return err
	// 		})
	// 	}
	// 	else {
	// 		var nooraImage = Jimp.read(inputImage)
	// 		.then(nooraImage => {
	// 			return nooraImage
	// 			.resize(currentTemplate.requiredWidth, currentTemplate.requiredHeight)
	// 			.rotate(currentTemplate.inputFileRotateDeg)
	// 		})
	// 		.then(function(modifiedNooraImage){
	// 			return greeting
	// 			.composite(modifiedNooraImage, currentTemplate.imgToReplaceX, currentTemplate.imgToReplaceY, {
	// 				mode: currentTemplate.mode,
	// 				opacitySource: currentTemplate.opacitySource,
	// 				opacityDest: currentTemplate.opacityDest
	// 			})
	// 			.writeAsync(currentTemplate.outputFile); // save
	// 		})
	// 		.catch(err => {
	// 			console.error(err);
	// 			return err
	// 		});
	// 	}
	// })
	// .then(function(){
 //  		res.send({ status: true })
	// })
	// .catch(err => {
	// 	console.error(err);
 //  		res.send({ status: false })
	// });
  	res.send({ status: true })
});

/* Generate greeting api. */
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

	if(!req.body.template_name) {
		res.send({status:false, message: "template_name is required"})
		return
	}

	let templateMessage = req.body.template_message

	/**
	* 1: Getting image from request body it can be base64 or image url
	**/
	let inputImage = req.body.inputImage
	// Removing `data:image/png;base64,` from string so it will be original base 64 image
	let imageData = inputImage.split(",")

	if (typeof Buffer.from === "function") {
		// Node 5.10+
		var base64Image = Buffer.from(imageData[1], 'base64'); // Ta-da
	} else {
		// older Node versions, now deprecated
		var base64Image = new Buffer(imageData[1], 'base64'); // Ta-da
	}

	// let base64Image = "../templates/Models/nora-fatehi.jpg"

	/**
	* 2: Getting template from data
	**/
	let currentTemplate = getTemplateData(req.body.template_name)
	if ( currentTemplate ) {
		let {inputFile, convertToShape, imgToReplaceX, imgToReplaceY, mode, opacitySource, opacityDest, requiredWidth, requiredHeight, inputFileRotateDeg, outputFile, type} = currentTemplate

		Jimp.read(inputFile)
		.then(function(mainGreeting) {
			// We should not resize the frame otherwise it may create an issue
			if (type === "_frame" && false) {
				return mainGreeting.resize(requiredWidth, requiredHeight)
			}
			else {
				return mainGreeting
			}
		})
		.then(function(greeting) {
			if (convertToShape) {
				return convertImageShape( base64Image, convertToShape)
				.then(function(modifiedNooraImage) {
					/**
					* Appending the input image in the choosen greeting
					**/
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
					/**
					* Resizing the input image as per required in the template
					**/
					if (requiredWidth && requiredHeight) {
						if (requiredWidth == "auto" && requiredHeight == "auto") {
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
					if (inputFileRotateDeg) {
						return nooraImage.rotate(inputFileRotateDeg)
					}
					else {
						return nooraImage
					}
				})
				.then(function(modifiedNooraImage) {
					/**
					* Appending the input image in the choosen greeting
					**/
					if (mode) {
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
				.then(function(generatedTemplate){
					if (templateMessage && templateMessage.length > 0) {
						/*Jimp.HORIZONTAL_ALIGN_LEFT;
						Jimp.HORIZONTAL_ALIGN_CENTER;
						Jimp.HORIZONTAL_ALIGN_RIGHT;
						Jimp.VERTICAL_ALIGN_TOP;
						Jimp.VERTICAL_ALIGN_MIDDLE;
						Jimp.VERTICAL_ALIGN_BOTTOM;*/
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
	  		return jimpInstance.writeAsync(outputFile);
		})
		.then(function(){
	  		res.send({ status: true, data: outputFile })
		})
		.catch(err => {
			console.error(err);
	  		res.send({ status: false })
		})
	}
	else {
		res.send({status:false, message: "invalid template_name"})
	}
})

const getTemplateData = (template_name) => {
	/***
	Jimp.BLEND_SOURCE_OVER;
	Jimp.BLEND_DESTINATION_OVER;
	Jimp.BLEND_MULTIPLY;
	Jimp.BLEND_ADD; automatically adjusting color
	Jimp.BLEND_SCREEN; automatically adjusting color
	Jimp.BLEND_OVERLAY;
	Jimp.BLEND_DARKEN;
	Jimp.BLEND_LIGHTEN;
	Jimp.BLEND_HARDLIGHT;
	Jimp.BLEND_DIFFERENCE;
	Jimp.BLEND_EXCLUSION;
	***/

	if ( template_name == "birthdayTemplate") {
		return {
			name: "birthdayTemplate",
			inputFile: '../templates/happybirthday.png',
			inputFileRotateDeg: 1.6,
			convertToShape: null,
			requiredWidth: 630,
			requiredHeight: 960,
			outputFile: '../templates/output/happybirthdayoutput.png',
			imgToReplaceX: 143,
			imgToReplaceY: 137,
			mode: Jimp.BLEND_SOURCE_OVER,
			opacitySource: 1.0,
			opacityDest: 1.0,
			text: "Hello World",
			type: "_greeting"
		}
	}
	else if( template_name == "holidayTemplate") {
		return {
			name: "holidayTemplate",
			inputFile: '../templates/holidaycard.png',
			inputFileRotateDeg: 0,
			convertToShape: null,
			requiredWidth: 1799,
			requiredHeight: 853,
			outputFile: '../templates/output/holidaycardoutput.png',
			imgToReplaceX: 109,
			imgToReplaceY: 94,
			mode: Jimp.BLEND_OVERLAY,
			opacitySource: 0.5,
			opacityDest: 1.0, // i.e Base Image
			text: "Hello World",
			type: "_greeting"
		}
	}
	else if( template_name == "christmasHolidayTemplate") {
		return {
			name: "christmasHolidayTemplate",
			inputFile: '../templates/CreamandLightChristmasCard.png',
			inputFileRotateDeg: 0,
			convertToShape: "__circularmask",
			requiredWidth: 1000,
			requiredHeight: 1000,
			outputFile: '../templates/output/CreamandLightChristmasCardOutput.png',
			imgToReplaceX: 215,
			imgToReplaceY: 450,
			mode: Jimp.BLEND_OVERLAY,
			opacitySource: 0.5,
			opacityDest: 1.0, // i.e Base Image
			text: "Hello World",
			type: "_greeting"
		}
	}
	else if( template_name == "scrapbook") {
		return {
			name: "scrapbook",
			inputFile: '../templates/scrapbook.png',
			inputFileRotateDeg: 1.45,
			convertToShape: null,
			requiredWidth: 673,
			requiredHeight: 898,
			outputFile: '../templates/output/scrapbookoutput.png',
			imgToReplaceX: 188,
			imgToReplaceY: 267,
			mode: Jimp.BLEND_OVERLAY,
			opacitySource: 1.0,
			opacityDest: 1.0, // i.e Base Image
			text: "Hello World",
			type: "_greeting"
		}
	}
	else if( template_name == "__beautiful_love_frame_background") {
		return {
			name: "__beautiful_love_frame_background",
			inputFile: '../templates/Frames/__beautiful_love_frame_background.png',
			inputFileRotateDeg: 0,
			convertToShape: null,
			requiredWidth: 542,
			requiredHeight: 640,
			outputFile: '../templates/output/beautiful_love_frame_background.png',
			imgToReplaceX: 0,
			imgToReplaceY: 0,
			mode: Jimp.BLEND_DESTINATION_OVER,
			opacitySource: 1.0,
			opacityDest: 1.0, // i.e Base Image
			text: "Hello World",
			type: "_frame"
		}
	}
  else if( template_name == "__birthday_background") {
		return {
			name: "__birthday_background",
			inputFile: '../templates/Frames/__birthday_background.png',
			inputFileRotateDeg: 0,
			convertToShape: null,
			requiredWidth: 730,
			requiredHeight: 342,
			outputFile: '../templates/output/birthday_background.png',
			imgToReplaceX: 0,
			imgToReplaceY: 0,
			mode: Jimp.BLEND_DESTINATION_OVER,
			opacitySource: 1.0,
			opacityDest: 1.0, // i.e Base Image
			text: "Hello World",
			type: "_greeting"
		}
	}
  else if( template_name == "__christmas_border_frame" || template_name == "__elegant_golden_frame" || template_name == "__realistic_frame_made_of_fir" || template_name == "__red_transparent_love_heart" || template_name == "__spring_grass_with_butterflies_beautiful" || template_name == "__watercolor_leaves_wedding_invitation" || template_name == "__yellow_shiny_valentine_love" ) {
	    /**
	    * These all are square template so we can easily resize it to any size
	    **/
		return {
			name: "__birthday_background",
			inputFile: `../templates/Frames/${template_name}.png`,
			inputFileRotateDeg: 0,
			convertToShape: "__heartmaskimage",
			requiredWidth: "auto",
			requiredHeight: "auto",
			outputFile: `../templates/output/${template_name}.png`,
			imgToReplaceX: 0,
			imgToReplaceY: 0,
			mode: Jimp.BLEND_DESTINATION_OVER,
			opacitySource: 1.0,
			opacityDest: 1.0, // i.e Base Image
			text: "Hello World",
			type: "_greeting"
		}
	}
	else {
		return null
	}
}

const convertImageShape = ( img, shape ) => {
	// var w = currentTemplate.requiredWidth
	// var h = currentTemplate.requiredHeight

	return Jimp.read( img )
	// .then(function( inputImage ) {
	// 	// var w = inputImage.bitmap.width
	// 	// var h = inputImage.bitmap.height
	// 	return inputImage.resize(w,h)
	// })
	.then(function(inputImage) {

		var w = inputImage.bitmap.width
		var h = inputImage.bitmap.height

		return Jimp.read(`../templates/Masks/${shape}.png`)
		.then(function( maskImage ) {
			// resizing the mask image to input image
			return maskImage.resize(w, h)
		})
		.then(function( maskedResizedImage ) {
			return inputImage.mask(maskedResizedImage, 0, 0)
		})
		.catch(function(error){
			return error
		})
	})
	.catch(function(error){
		return error
	})
}

// const convertImageShape = ( img, currentTemplate ) => {
// 	var w = currentTemplate.requiredWidth
// 	var h = currentTemplate.requiredHeight

// 	return Jimp.read( img )
// 	.then(function( inputImage ) {
// 		// var w = inputImage.bitmap.width
// 		// var h = inputImage.bitmap.height
// 		return inputImage.resize(w,h)
// 	})
// 	.then(function(inputImage) {
// 		return Jimp.read('../templates/Frames/__beautiful_love_frame_background.png')
// 		.then(function( circularImage ) {
// 			return circularImage.resize(w, h)
// 		})
// 		.then(function( circularResizedImage ) {
// 			return inputImage.mask(circularResizedImage, 0, 0)
// 		})
// 		.catch(function(error){
// 			return error
// 		})
// 	})
// 	.catch(function(error){
// 		return error
// 	})
// }

module.exports = router;