var express = require('express');
var router = express.Router();
var Jimp = require('jimp');

var inputImage = '../templates/Models/noora.jpg'
// var inputImage = '../templates/Models/nora-fatehi.jpg'

var birthdayTemplate = {
	name: "birthdayTemplate",
	inputFile: '../templates/happybirthday.png',
	inputFileRotateDeg: 1.6,
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

var holidayTemplate = {
	name: "holidayTemplate",
	inputFile: '../templates/holidaycard.png',
	inputFileRotateDeg: 0,
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

/**
* This template required circular image so passing same height width
**/
var christmasHolidayTemplate = {
	name: "christmasHolidayTemplate",
	inputFile: '../templates/CreamandLightChristmasCard.png',
	inputFileRotateDeg: 0,
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

var currentTemplate = christmasHolidayTemplate

/* GET home page. */
router.get('/', function(req, res, next) {
	Jimp.read(currentTemplate.inputFile)
	// .then(greeting => {
	// 	Jimp.loadFont(Jimp.FONT_SANS_8_WHITE)
	// 	.then(font => {
	// 		greeting.print(
	// 			font,
	// 			10,
	// 			10,
	// 			{
	// 				text: 'Hello world!',
	// 				alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
	// 				alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
	// 		    },
	// 		    300,
	// 		    300
	// 		)
	// 	})
	// 	.then(function() {
	// 		return greeting
	// 	})
	// 	.catch(function(e) {
	// 		return e
	// 	})
	// })
	.then(function(greeting) {
		if (currentTemplate.name == "christmasHolidayTemplate") {
			getCircularImage( inputImage, currentTemplate)			
			.then(function(modifiedNooraImage){
				return greeting
				.composite(modifiedNooraImage, currentTemplate.imgToReplaceX, currentTemplate.imgToReplaceY, {
					mode: currentTemplate.mode,
					opacitySource: currentTemplate.opacitySource,
					opacityDest: currentTemplate.opacityDest
				})				
				.writeAsync(currentTemplate.outputFile); // save
			})
			.catch(err => {
				console.error(err);
				return err			
			})
		} 
		else {
			var nooraImage = Jimp.read(inputImage)
			.then(nooraImage => {
				return nooraImage
				.resize(currentTemplate.requiredWidth, currentTemplate.requiredHeight)
				.rotate(currentTemplate.inputFileRotateDeg)
			})
			.then(function(modifiedNooraImage){
				return greeting
				.composite(modifiedNooraImage, currentTemplate.imgToReplaceX, currentTemplate.imgToReplaceY, {
					mode: currentTemplate.mode,
					opacitySource: currentTemplate.opacitySource,
					opacityDest: currentTemplate.opacityDest
				})				
				.writeAsync(currentTemplate.outputFile); // save
			})
			.catch(err => {
				console.error(err);
				return err			
			});
		}
	})
	.then(function(){
  		res.send({ status: true })
	})
	.catch(err => {
		console.error(err);
  		res.send({ status: false })
	});
});

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
