var express = require('express');
var router = express.Router();
var Jimp = require('jimp');

var inputImage = '../templates/Models/nora-fatehi.jpg'
var outputImage = '../templates/Models/nora-fatehi-output.jpg'

/* GET users listing. */
router.get('/', function(req, res, next) {
	if( !req.query.effect ) {
  		res.send({status: false, message: "effect param is required"});
	}
	else if( !req.query.effectValue ) {
  		res.send({status: false, message: "effectValue param is required"});
	} 
	else {
		if ( ['posterize', 'sepia', 'gaussian', 'blur', 'invert', 'greyscale', 'dither565',
'normalize','fade', 'opacity', 'opaque'].indexOf(req.query.effect) !== -1 ) {
			// Applyling effects dynamically
			var a = applyEffect(inputImage, req.query.effect, req.query.effectValue)
			.then(function(imageData) {
  				res.send({ status: true, effect:req.query.effect, preview_image: outputImage });
			})
			.catch(function(error) {
				console.log(error, "error")
  				res.send({ status: false, data: [], error });
			})
		}
		else {
  			res.send({status: false, data: [], message: "Invalid effect name"});
		}
	}
});

const applyEffect = ( pathOfImage, effectName, effectValue ) => {
	return Jimp.read(pathOfImage)
	.then(image => {
		if (effectName === 'posterize') {
			return image.posterize( effectValue )
		} 
		else if (effectName === 'sepia') {
			return image.sepia()
		}
		else if (effectName === 'gaussian') {
			return image.gaussian( parseInt(effectValue) )
		}
		else if (effectName === 'blur') {
			return image.blur( parseInt(effectValue) )
		}
		else if (effectName === 'invert') {
			return image.invert()
		}
		else if (effectName === 'greyscale') {
			return image.greyscale()
		}
		else if (effectName === 'dither565') {
			return image.dither565()
		}
		else if (effectName === 'normalize') {
			return image.normalize()
		}
		else if (effectName === 'fade') {
			return image.fade( parseInt(effectValue) )
		}
		else if (effectName === 'opacity') {
			return image.opacity( parseInt(effectValue) )
		}
		else if (effectName === 'opaque') {
			return image.opaque()
		}
		else {
			throw new Error("Can not apply the selected effect")
		}
	})
	.then(function(effectedImage) {
		return effectedImage.writeAsync(outputImage)
		// return effectedImage.getBase64Async(Jimp.MIME_JPEG)
	})
	.catch(err => {
		console.log(err, "err")
		// Handle an exception.
		return err
	});
}

module.exports = router;
