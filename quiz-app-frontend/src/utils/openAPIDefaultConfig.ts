import {Configuration} from "../app";


// @ts-ignore
const backendURL = import.meta.env.VITE_BACKEND_URL;

export const OpenAPIDefaultConfig = new Configuration({
  basePath: backendURL ? backendURL : undefined
});
