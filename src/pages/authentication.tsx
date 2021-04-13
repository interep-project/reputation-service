import { signIn, signout, useSession } from "next-auth/client";

export default function Authentication() {
  const [session] = useSession();

  return (
    <div>
      <main>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 mb-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Reputation Service
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {session
                  ? `You are logged in as ${session.user?.name}`
                  : "Please sign in."}
              </p>
            </div>
          </div>
          {session ? (
            <div>
              <button
                onClick={() => signout()}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {"SIGN OUT"}
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={() => signIn()}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {"SIGN IN"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
