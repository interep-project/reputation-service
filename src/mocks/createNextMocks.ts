import {
  createMocks,
  Mocks,
  RequestMethod,
  RequestOptions,
} from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";

const createNextMocks = (
  reqOptions?: RequestOptions
): Mocks<NextApiRequest, NextApiResponse> =>
  createMocks<NextApiRequest, NextApiResponse>({
    method: "GET" as RequestMethod,
    ...reqOptions,
  });

export default createNextMocks;
