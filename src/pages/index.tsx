import Head from "next/head";
import { useState } from "react";
import { IUser } from "src/models/users/User.types";
import { BasicTwitterReputation } from "src/types/twitter";

export default function Home() {
  const [twitterHandle, setTwitterHandle] = useState("");
  const [twitterUserData, setTwitterUserData] = useState<
    IUser["twitter"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = () => {
    if (!twitterHandle) return;
    setIsLoading(true);
    fetch(`/api/reputation/twitter/${twitterHandle}`)
      .then((res) => res.json())
      .then((data) => {
        setIsLoading(false);
        setTwitterUserData(data);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
      });
  };

  return (
    <div>
      <Head>
        <title>Reputation Service</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 mb-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Reputation Service
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Enter a twitter handle to check if a user is reputable
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
              className="mt-8 space-y-6"
            >
              <div>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    @
                  </span>
                  <input
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    type="text"
                    name="twitter_handle"
                    id="twitter-handle"
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                    placeholder="jack"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isLoading ? "Loading..." : "CHECK"}
                </button>
              </div>
            </form>
          </div>
          {!isLoading && (
            <div className="flex flex-col items-center">
              {twitterUserData?.reputation && (
                <h3 className="mb-3 text-lg leading-6 font-medium text-gray-900">
                  Reputation: {twitterUserData.reputation}
                </h3>
              )}

              {twitterUserData?.reputation ===
                BasicTwitterReputation.UNCLEAR && (
                <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Bot Score
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {
                      twitterUserData.botometer?.display_scores?.universal
                        .overall
                    }
                    /5
                  </dd>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
