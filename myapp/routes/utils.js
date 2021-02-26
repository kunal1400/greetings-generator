var Jimp = require('jimp');
var availableMasks = ['__circularmask', '__heartmaskimage']

/**
* Resizing the mask image according to input image is causing error -ex- if input image is 
* rectangle then mask image become oval instead of circle.
* So the mask image should be proper and not resized
*
* https://github.com/oliver-moran/jimp/issues/69
*
**/
const convertImageShape = ( img, shape ) => {
	var w = 500
	var h = 500
	return Jimp.read( img )
	.then(function( inputImage ) {
		// resizing the input image

		// var w = inputImage.bitmap.width
		// var h = inputImage.bitmap.height
		return inputImage.resize(w,h)
	})
	.then(function(inputImage) {
		return Jimp.read(`../templates/Masks/${shape}.png`)
		.then(function( maskImage ) {
			// resizing the mask image
			return maskImage.resize(w, h)
		})
		.then(function( maskedResizedImage ) {
			return inputImage.mask(maskedResizedImage, 0, 0)
		})
		.then(function(jimpInstance) {
	 		return jimpInstance.writeAsync('../templates/output/maskedOutput.png');
		})
		.then(function(jimpInstance) {
	 		return Jimp.read('../templates/output/maskedOutput.png')
		})
		.catch(function(error){
			return error
		})
	})
	.catch(function(error){
		console.log(error, "eeeee in convert image shape")
		return error
	})
}

let json = {
	availableMasks,
	waterMarkImage:'https://destatic.blob.core.windows.net/images/nodejs-logo.png',
	outputFile:'D:/xampp/htdocs/woocommerce_tasks/wp-content/generated-images/',
	outputFileUrl:'http://localhost/woocommerce_tasks/wp-content/generated-images/',
	convertImageShape
}

module.exports = json