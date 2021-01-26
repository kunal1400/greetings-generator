var express = require('express');
var router = express.Router();
var Jimp = require('jimp');
var outputDirectory = "../templates/output/"

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
	// // 		    },
	// // 		    300,
	// // 		    300
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
 //  		res.send({ status: true })
	// })
	// .catch(err => {
	// 	console.error(err);
 //  		res.send({ status: false })
	// });
  	res.send({ status: true })
});

/* Generate greeting api. */
router.post('/', function(req, res, next) {
	if(!req.body.inputImage) {
		res.send({status:false, message: "inputImage is required"})
		return
	}

	if(!req.body.template_name) {
		res.send({status:false, message: "template_name is required"})
		return
	}
	
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
		let {inputFile, convertToShape, imgToReplaceX, imgToReplaceY, mode, opacitySource, opacityDest, requiredWidth, requiredHeight, inputFileRotateDeg, outputFile} = currentTemplate

		Jimp.read(inputFile)
		.then(function(greeting) {
			if (convertToShape && convertToShape == "circular") {
				return getCircularImage( base64Image, currentTemplate)			
				.then(function(modifiedNooraImage){
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
					return nooraImage
					.resize(requiredWidth, requiredHeight)
					.rotate(inputFileRotateDeg)
				})
				.then(function(modifiedNooraImage){
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
			text: "Hello World"
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
			text: "Hello World"	
		}
	}
	else if( template_name == "christmasHolidayTemplate") {
		return {
			name: "christmasHolidayTemplate",
			inputFile: '../templates/CreamandLightChristmasCard.png',
			inputFileRotateDeg: 0,
			convertToShape: "circular",			
			requiredWidth: 1000,
			requiredHeight: 1000,
			outputFile: '../templates/output/CreamandLightChristmasCardOutput.png',
			imgToReplaceX: 215,
			imgToReplaceY: 450,
			mode: Jimp.BLEND_OVERLAY,
			opacitySource: 0.5,
			opacityDest: 1.0, // i.e Base Image
			text: "Hello World"	
		}
	}
	else {
		return null
	}
}

const getCircularImage = ( img, currentTemplate ) => {
	var w = currentTemplate.requiredWidth
	var h = currentTemplate.requiredHeight

	return Jimp.read( img )
	.then(function( inputImage ) {
		// var w = inputImage.bitmap.width
		// var h = inputImage.bitmap.height
		return inputImage.resize(w,h)		
	})
	.then(function(inputImage) {
		return Jimp.read('../templates/circularmask.png')
		.then(function( circularImage ) {
			return circularImage.resize(w, h)
		})
		.then(function( circularResizedImage ) {
			return inputImage.mask(circularResizedImage, 0, 0)
    		//.write("lenna-circle.png")
		})
		.catch(function(error){
			return error
		})
	})
	.catch(function(error){
		return error
	})	
}

module.exports = router;
