import * as post from './verbs/post';
export const postJson = post.postJson;
// ts-unused-exports:disable-next-line
export const postString = post.postString;

import * as get from './verbs/get';
export const getJson = get.getJson;
// ts-unused-exports:disable-next-line
export const getData = get.getData;
// ts-unused-exports:disable-next-line
export const getImage = get.getImage;
// ts-unused-exports:disable-next-line
export const getString = get.getString;

export { getPaginatedResults } from './getPaginatedResults';
export { default as multipartRequest } from './multipart';
export { deleteRequest } from './verbs/delete';
export { putJson } from './verbs/put';
