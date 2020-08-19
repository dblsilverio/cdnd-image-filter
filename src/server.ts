import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles, validateImage } from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  app.get("/filteredimage", [validateImage], async (req: Request, res: Response) => {

    const { imageUrl }: { imageUrl: string } = req.body;

    try {
      const filteredImage: string = await filterImageFromURL(imageUrl);
      res.sendFile(filteredImage, (err) => {
        deleteLocalFiles([filteredImage]);

        if (err) {
          console.error(`Error sending file: ${err}`);
          res.send({ error: err }).status(500);
        }
      });
    } catch (exc) {
      console.error(`Exception filtering image: ${exc}`);
      res.send({ error: `${exc}` }).status(500);
    }

  });


  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req: Request, res: Response) => {
    res.send("try GET /filteredimage?image_url={{URL}}")
  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();