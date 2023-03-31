import { Request, Response } from "express";
import ms from "ms";
import { Resource } from "../interfaces";
import {
  uuid,
  createResource,
  getResource,
  getResources,
  updateResource,
  deleteResource,
} from "../utils";

const resourceRoute = async (req: Request, res: Response) => {
  try {
    let id = (req.query?.id || req.params?.id) as string;
    const password = (req.query?.password || "") as string;
    const expiresAt =
      new Date().getTime() + ms((req.body?.expiresAt as string) || "3d");
    const getJson = Boolean(req.query?.json || false);
    let response: string = "";
    let exists: Resource | string = "";
    let resource: Resource;
    switch (req.method) {
      case "GET":
        if (!id) {
          return res.status(400).json({
            message: "Send a post request to /api/${id}",
          });
        }
        exists = await getResource(id);
        if (exists == "404") {
          res.status(404).json({
            message: `${id} not found!`,
          });
        } else if (typeof exists !== "string") {
          resource = exists;
          if (!(resource.password == password)) {
            return res.status(401).json({
              message: `Your access to resource ${id} is blocked!`,
            });
          }
          if (getJson) {
            res.status(200).json(exists);
          } else {
            if ((resource.file?.fileSize as number) > 0) {
              res.set({
                "Content-Disposition": `attachment; filename=${resource.file?.fileName}`,
                "Content-Type": resource.file?.fileType,
                "Content-Length": resource.file?.fileSize,
              });
              res.end(resource.file?.fileContent);
            } else {
              res.send(resource.content);
            }
          }
        } else {
          res.status(400).json({
            message: `Failed to get ${id}`,
            log: exists,
          });
        }
        break;
      case "POST":
        if (!id) id = await uuid();
        resource = {
          id,
          password,
          content: (req.body?.text || "") as string,
          file: {
            fileName: (req.file?.originalname || "") as string,
            fileType: (req.file?.mimetype || "") as string,
            fileSize: (req.file?.size || 0) as number,
            fileContent: (req.file?.buffer || Buffer.from("")) as Buffer,
          },
          expiresAt,
        };
        response = await createResource(resource);
        if (response === "exists") {
          res.status(400).json({
            message: `An resource with id "${id}" already exists!`,
          });
        } else if (response === "success") {
          res.status(200).json({
            message: `${id} created successfully!`,
          });
        } else {
          res.status(400).json({
            message: `Failed to create ${id}`,
            log: response,
          });
        }
        break;
      case "PUT":
        exists = await getResource(id);
        resource = exists as Resource;
        if (!(resource.password == password)) {
          return res.status(401).json({
            message: `Your access to resource ${id} is blocked!`,
          });
        }
        const newResource: Resource = {
          id,
          password,
          content: (req.body?.text || "") as string,
          file: {
            fileName: (req.file?.originalname || "") as string,
            fileType: (req.file?.mimetype || "") as string,
            fileSize: (req.file?.size || 0) as number,
            fileContent: (req.file?.buffer || Buffer.from("")) as Buffer,
          },
          expiresAt,
        };
        response = await updateResource(id, newResource);
        if (response === "404") {
          res.status(404).json({
            message: `${id} not found!`,
          });
        } else if (response === "success") {
          res.status(200).json({
            message: `${id} updated successfully!`,
          });
        } else {
          res.status(400).json({
            message: `Failed to update ${id}`,
            log: response,
          });
        }
        break;
      case "DELETE":
        exists = await getResource(id);
        resource = exists as Resource;
        if (!(resource.password == password)) {
          return res.status(401).json({
            message: `Your access to resource ${id} is blocked!`,
          });
        }
        response = await deleteResource(id);
        if (response === "404") {
          res.status(404).json({
            message: `${id} not found!`,
          });
        } else if (response === "success") {
          res.status(200).json({
            message: `${id} deleted successfully!`,
          });
        } else {
          res.status(400).json({
            message: `Failed to delete ${id}`,
            log: response,
          });
        }
        break;
      default:
        res.status(500).json({
          message: `${req.method} method is not supported`,
        });
        break;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong!",
      log: error,
    });
  }
};

export { resourceRoute };
