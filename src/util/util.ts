import fs from 'fs';
import Jimp = require('jimp');
import { Request, Response } from 'express';

// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export async function filterImageFromURL(inputURL: string): Promise<string> {
  return new Promise(async resolve => {
    const photo = await Jimp.read(inputURL);
    const outpath = '/tmp/filtered.' + Math.floor(Math.random() * 2000) + '.jpg';
    await photo
      .resize(256, 256) // resize
      .quality(60) // set JPEG quality
      .greyscale() // set greyscale
      .write(__dirname + outpath, (img) => {
        resolve(__dirname + outpath);
      });
  });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files: Array<string>) {
  for (let file of files) {
    fs.unlinkSync(file);
  }
}

// Middleware image validator
// Checks for the existence of an URL and extensions compatible with Jimp(https://www.npmjs.com/package/jimp)
export function validateImage(req: Request, res: Response, next: Function) {

  const { image_url: imageUrl }: { image_url: string } = req.query;

  if (!imageUrl) {
    return res.json({ message: "Empty URL provided" }).status(400);
  }

  if (!checkExtension(imageUrl)) {
    return res.json({ message: "Invalid image extension provided. Accepted are [jpg|jpeg|png|bmp|tiff|gif]", }).status(422);
  }

  req.body.imageUrl = imageUrl;
  next();
}

function checkExtension(imageUrl: string): boolean {
  return imageUrl.match(/.*?\.(jpg|jpeg|png|bmp|tiff|gif)$/) !== null;
}