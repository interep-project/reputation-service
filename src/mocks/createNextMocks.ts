import {
  createMocks,
  Mocks,
  RequestMethod,
  RequestOptions,
} from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";

// TODO: Move into an util
const createNextMocks = (
  reqOptions?: RequestOptions
): Mocks<NextApiRequest, NextApiResponse> =>
  createMocks<NextApiRequest, NextApiResponse>({
    // @ts-ignore: GET is part of expected type - RequestMethod - so not sure what is going on
    method: "GET" as RequestMethod,
    ...reqOptions,
  });

export default createNextMocks;
