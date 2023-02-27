import NextErrorComponent from "next/error"

const myError = ({ statusCode }: any) => <NextErrorComponent statusCode={statusCode} />

myError.getInitialProps = async (context: any) => {
    const errorInitialProps = (await NextErrorComponent.getInitialProps(context)) as any

    // Workaround for https://github.com/vercel/next.js/issues/8592, mark when
    // getInitialProps has run
    errorInitialProps.hasGetInitialPropsRun = true

    return errorInitialProps
}

export default myError
