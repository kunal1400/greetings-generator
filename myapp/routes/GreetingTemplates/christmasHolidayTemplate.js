const Jimp = require('jimp');

const template = ( inputFile ) => {
	Jimp.read(currentTemplate.inputFile)	
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