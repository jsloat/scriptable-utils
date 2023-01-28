import * as get from './verbs/get';
import * as post from './verbs/post';
export const postJson = post.postJson;

export const getJson = get.getJson;

export { getPaginatedResults } from './getPaginatedResults';
export { default as multipartRequest } from './multipart';
export { putJson } from './verbs/put';
