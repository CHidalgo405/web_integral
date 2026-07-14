const cloudinary = require('cloudinary').v2;

cloudinary.config({
  secure: true
});

console.log('[Cloudinary Config] Cloud Name:', cloudinary.config().cloud_name);
console.log('[Cloudinary Config] URL Present:', !!process.env.CLOUDINARY_URL);

module.exports = cloudinary;
