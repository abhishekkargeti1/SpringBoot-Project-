import axios from 'axios';

const baseURL = "http://localhost:8080";

export const httpClient = axios.create({
  baseURL: baseURL,
});
export { baseURL };