import { Resource } from "../interfaces";
import { ResourceModel } from "../models";

const isUnique = (id: string, resources: Resource[]): boolean => {
  let unique = true;
  for (let resource of resources) {
    if (resource.expiresAt > new Date().getTime()) deleteResource(resource.id);
    if (id === resource.id) unique = false;
  }
  return unique;
};

const uuid = async (length = 4): Promise<string> => {
  const resources = (await getResources()) as Resource[];
  let result = "";
  while (true) {
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    if (isUnique(result, resources)) return result;
  }
};

const wrapper = (cb: Function) => {
  return async (...args: any) => {
    try {
      cb(...args);
    } catch (error) {
    }
  };
};

const createResource = async (resource: Resource): Promise<string> => {
  try {
    const exists = await ResourceModel.findOne({ id: resource.id })
      .maxTimeMS(20000)
      .exec();
    if (Boolean(exists)) {
      return "exists";
    } else {
      await ResourceModel.create(resource);
      return "success";
    }
  } catch (error: any) {
    return error.message as string;
  }
};

const getResource = async (id: string): Promise<Resource | string> => {
  try {
    const exists = (await ResourceModel.findOne({ id }, { _id: 0, __v: 0 })
      .maxTimeMS(20000)
      .exec()) as Resource;
    if (Boolean(exists)) {
      return exists;
    } else {
      return "404";
    }
  } catch (error: any) {
    return error.message as string;
  }
};

const getResources = async (): Promise<Resource[] | string> => {
  try {
    const exists: Resource[] = await ResourceModel.find({}, { _id: 0, __v: 0 })
      .maxTimeMS(20000)
      .exec();
    return exists;
  } catch (error: any) {
    return error.message as string;
  }
};

const updateResource = async (
  id: string,
  resource: Resource
): Promise<string> => {
  try {
    const exists = await ResourceModel.findOne({ id }).maxTimeMS(20000).exec();
    if (Boolean(exists)) {
      await ResourceModel.findOneAndUpdate({ id }, resource, {
        new: true,
      });
      return "success";
    } else {
      return "404";
    }
  } catch (error: any) {
    return error.message as string;
  }
};

const deleteResource = async (id: string): Promise<string> => {
  try {
    const exists = await ResourceModel.findOne({ id }).maxTimeMS(20000).exec();
    if (Boolean(exists)) {
      await ResourceModel.findOneAndRemove({ id });
      return "success";
    } else {
      return "404";
    }
  } catch (error: any) {
    return error.message as string;
  }
};

export {
  uuid,
  wrapper,
  createResource,
  getResource,
  getResources,
  updateResource,
  deleteResource,
};
